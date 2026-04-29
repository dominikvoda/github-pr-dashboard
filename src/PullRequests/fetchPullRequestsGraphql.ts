import { getGraphqlResponse } from "../GitHub/Api"

const PR_SEARCH_QUERY = `
query PullRequestSearch($q: String!, $first: Int!) {
  rateLimit { cost remaining resetAt }
  search(query: $q, type: ISSUE, first: $first) {
    issueCount
    nodes {
      ... on PullRequest {
        number
        title
        url
        createdAt
        additions
        deletions
        changedFiles
        comments { totalCount }
        author {
          login
          avatarUrl
          ... on User { databaseId }
        }
        repository { name }
        labels(first: 20) {
          nodes { name color }
        }
        assignees(first: 10) {
          nodes { databaseId login avatarUrl }
        }
        reviews(last: 50) {
          nodes {
            databaseId
            state
            submittedAt
            comments { totalCount }
            author {
              login
              avatarUrl
              ... on User { databaseId }
            }
          }
        }
      }
    }
  }
}
`

interface GraphqlReviewNode {
  databaseId: number | null
  state: string
  submittedAt: string | null
  comments: { totalCount: number }
  author: { login: string; avatarUrl: string; databaseId?: number } | null
}

interface GraphqlPrNode {
  number: number
  title: string
  url: string
  createdAt: string
  additions: number
  deletions: number
  changedFiles: number
  comments: { totalCount: number }
  author: { login: string; avatarUrl: string; databaseId?: number } | null
  repository: { name: string }
  labels: { nodes: Array<{ name: string; color: string }> }
  assignees: { nodes: Array<{ databaseId: number; login: string; avatarUrl: string }> }
  reviews: { nodes: GraphqlReviewNode[] }
}

interface PullRequestSearchData {
  rateLimit?: { cost: number; remaining: number; resetAt: string }
  search: {
    issueCount: number
    nodes: Array<GraphqlPrNode | Record<string, never>>
  }
}

export const dedupReviews = (
  nodes: GraphqlReviewNode[],
  prAuthorDatabaseId: number | undefined
): any[] => {
  const sorted = [...nodes].sort((a, b) => {
    const aTime = a.submittedAt ?? ''
    const bTime = b.submittedAt ?? ''
    return aTime > bTime ? -1 : 1
  })

  const seen = new Set<number>()
  const out: any[] = []

  for (const review of sorted) {
    const userId = review.author?.databaseId
    if (userId === undefined || userId === null) continue
    if (review.databaseId === null) continue
    if (prAuthorDatabaseId !== undefined && userId === prAuthorDatabaseId) continue
    if (seen.has(userId)) continue

    seen.add(userId)
    out.push({
      id: review.databaseId,
      state: review.state,
      submitted_at: review.submittedAt,
      user: {
        id: userId,
        login: review.author!.login,
        avatar_url: review.author!.avatarUrl,
      },
    })
  }

  return out
}

const mapNodeToRow = (node: GraphqlPrNode) => {
  const reviewCommentsTotal = node.reviews.nodes.reduce(
    (sum, review) => sum + (review.comments?.totalCount ?? 0),
    0
  )

  return {
    id: node.number,
    number: node.number,
    title: node.title,
    author: node.author?.login ?? '',
    labels: node.labels.nodes,
    link: node.url,
    repository: node.repository.name,
    avatarUrl: node.author?.avatarUrl ?? '',
    createdAt: node.createdAt,
    assignees: node.assignees.nodes.map(a => ({
      id: a.databaseId,
      login: a.login,
      avatar_url: a.avatarUrl,
    })),
    comments: node.comments.totalCount + reviewCommentsTotal,
    pullRequest: {
      additions: node.additions,
      deletions: node.deletions,
      changed_files: node.changedFiles,
    },
    changes: node.additions + node.deletions,
    reviews: dedupReviews(node.reviews.nodes, node.author?.databaseId),
  }
}

export const fetchPullRequests = async (filters: string): Promise<any[]> => {
  const data = await getGraphqlResponse<PullRequestSearchData>(PR_SEARCH_QUERY, {
    q: ('is:pr is:open ' + filters).replace(/\s+/g, ' ').trim(),
    first: 100,
  })

  const rows = data.search.nodes
    .filter((node): node is GraphqlPrNode => 'number' in node)
    .map(mapNodeToRow)

  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return rows
}
