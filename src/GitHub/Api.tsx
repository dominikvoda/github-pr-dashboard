import { getNext } from "./loadRepos";

const GITHUB_API_URL = 'https://api.github.com'
const PAGE_LIMIT = 10
const REPO_CACHE_TTL_MS = 60 * 60 * 1000
const REPO_CACHE_KEY = 'repoListCache:BrandEmbassy'

export interface RateLimitState {
  remaining: number | null
  resetAt: number | null
}

const rateLimitState: { rest: RateLimitState; graphql: RateLimitState } = {
  rest: { remaining: null, resetAt: null },
  graphql: { remaining: null, resetAt: null },
}

const RATE_LIMIT_PAUSE_THRESHOLD = 100

const rateLimitListeners = new Set<() => void>()

export const getRateLimitState = () => rateLimitState

export const subscribeRateLimit = (listener: () => void): (() => void) => {
  rateLimitListeners.add(listener)
  return () => { rateLimitListeners.delete(listener) }
}

export const isPollingPaused = (): boolean => {
  // Polling uses GraphQL only; REST exhaustion shouldn't stall the dashboard refresh.
  const { remaining, resetAt } = rateLimitState.graphql
  if (remaining === null || remaining >= RATE_LIMIT_PAUSE_THRESHOLD) return false
  return resetAt === null || Date.now() < resetAt
}

const notifyRateLimit = () => { rateLimitListeners.forEach(l => l()) }

const recordRateLimitFromHeaders = (pool: 'rest' | 'graphql', headers: Headers): void => {
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')
  let changed = false
  if (remaining !== null) { rateLimitState[pool].remaining = Number(remaining); changed = true }
  if (reset !== null) { rateLimitState[pool].resetAt = Number(reset) * 1000; changed = true }
  if (changed) notifyRateLimit()
}

const recordGraphqlRateLimitFromBody = (remaining: number, resetAt: string): void => {
  rateLimitState.graphql.remaining = remaining
  rateLimitState.graphql.resetAt = new Date(resetAt).getTime()
  notifyRateLimit()
}

export const getJsonResponse = async (endpoint: string): Promise<any> => {
  const url = `${GITHUB_API_URL}${endpoint}`;

  const response = await getResponse(url)

  return await response.json();
}

export const getResponse = async (url: string): Promise<Response> => {
  const token = localStorage.getItem('githubToken')

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  recordRateLimitFromHeaders('rest', response.headers)

  return response
}

// Callers should include `rateLimit { remaining resetAt }` in their query for
// authoritative pool stats; headers are used as a fallback when absent.
export const getGraphqlResponse = async <T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> => {
  const token = localStorage.getItem('githubToken')

  const response = await fetch(`${GITHUB_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ query, variables }),
  })

  recordRateLimitFromHeaders('graphql', response.headers)

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    const message = json.errors.map((e: any) => e.message).join('; ')
    throw new Error('GitHub GraphQL error: ' + message)
  }

  const rl = json?.data?.rateLimit
  if (rl && typeof rl.remaining === 'number' && typeof rl.resetAt === 'string') {
    recordGraphqlRateLimitFromBody(rl.remaining, rl.resetAt)
  }

  return json.data as T
}

interface RepoCacheEntry {
  repos: string[]
  expiresAt: number
  token: string
}

const readRepoCache = (token: string): string[] | null => {
  try {
    const raw = sessionStorage.getItem(REPO_CACHE_KEY)
    if (!raw) return null
    const entry: RepoCacheEntry = JSON.parse(raw)
    if (entry.token !== token) return null
    if (Date.now() > entry.expiresAt) return null
    return entry.repos
  } catch {
    return null
  }
}

const writeRepoCache = (token: string, repos: string[]): void => {
  try {
    const entry: RepoCacheEntry = {
      repos,
      expiresAt: Date.now() + REPO_CACHE_TTL_MS,
      token,
    }
    sessionStorage.setItem(REPO_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // sessionStorage may be unavailable; fall through and refetch next time
  }
}

export const getAllRepositoryNames = async (): Promise<string[]> => {
  const token = localStorage.getItem('githubToken') ?? ''
  const cached = readRepoCache(token)
  if (cached) return cached

  const repos: string[] = []
  let pageLimit = 0

  let nextLink: string | undefined = `${GITHUB_API_URL}/orgs/BrandEmbassy/repos?sort=updated&per_page=100`

  while(nextLink && pageLimit < PAGE_LIMIT) {
    const pageResponse = await getResponse(nextLink)

    try {
      const reposPage = await pageResponse.json()
      repos.push(...(reposPage.map((repository:any) => repository.name)))
      nextLink = getNext(pageResponse.headers)
    } catch (e) {
      nextLink = ''
    }
    pageLimit++
  }

  if (repos.length > 0) {
    writeRepoCache(token, repos)
  }

  return repos
}
