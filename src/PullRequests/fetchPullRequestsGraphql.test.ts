import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dedupReviews, fetchPullRequests } from './fetchPullRequestsGraphql'

const makeReview = (
  databaseId: number,
  authorId: number | null,
  state: string,
  submittedAt: string,
  reviewCommentsCount = 0,
) => ({
  databaseId,
  state,
  submittedAt,
  comments: { totalCount: reviewCommentsCount },
  author:
    authorId === null
      ? null
      : { login: 'user' + authorId, avatarUrl: 'avatar' + authorId, databaseId: authorId },
})

describe('dedupReviews', () => {
  it('keeps the latest review per user, sorted by submittedAt desc', () => {
    const result = dedupReviews(
      [
        makeReview(1, 10, 'COMMENTED', '2026-04-01T00:00:00Z'),
        makeReview(2, 10, 'APPROVED', '2026-04-02T00:00:00Z'),
        makeReview(3, 11, 'CHANGES_REQUESTED', '2026-04-03T00:00:00Z'),
      ],
      99,
    )

    expect(result.map(r => r.id)).toStrictEqual([3, 2])
    expect(result[1].state).toBe('APPROVED')
  })

  it('drops self-reviews (matching PR author databaseId)', () => {
    const result = dedupReviews(
      [
        makeReview(1, 50, 'APPROVED', '2026-04-01T00:00:00Z'),
        makeReview(2, 51, 'COMMENTED', '2026-04-02T00:00:00Z'),
      ],
      50,
    )

    expect(result.map(r => r.user.id)).toStrictEqual([51])
  })

  it('drops reviews from authors without databaseId (bots, deleted users)', () => {
    const result = dedupReviews(
      [
        makeReview(1, null, 'APPROVED', '2026-04-01T00:00:00Z'),
        makeReview(2, 12, 'COMMENTED', '2026-04-02T00:00:00Z'),
      ],
      99,
    )

    expect(result.map(r => r.user.id)).toStrictEqual([12])
  })

  it('produces user shape compatible with the existing UI', () => {
    const result = dedupReviews([makeReview(7, 33, 'APPROVED', '2026-04-01T00:00:00Z')], 99)

    expect(result[0]).toStrictEqual({
      id: 7,
      state: 'APPROVED',
      submitted_at: '2026-04-01T00:00:00Z',
      user: { id: 33, login: 'user33', avatar_url: 'avatar33' },
    })
  })
})

describe('fetchPullRequests (GraphQL)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  const samplePr = (overrides: any = {}) => ({
    number: 42,
    title: 'A title',
    url: 'https://github.com/BrandEmbassy/repo/pull/42',
    createdAt: '2026-04-01T00:00:00Z',
    additions: 10,
    deletions: 5,
    changedFiles: 3,
    comments: { totalCount: 4 },
    author: { login: 'alice', avatarUrl: 'aliceAv', databaseId: 1 },
    repository: { name: 'repo' },
    labels: { nodes: [{ name: 'bug', color: 'ff0000' }] },
    assignees: { nodes: [{ databaseId: 9, login: 'bob', avatarUrl: 'bobAv' }] },
    reviews: {
      nodes: [
        makeReview(101, 2, 'APPROVED', '2026-04-02T00:00:00Z', 2),
        makeReview(102, 3, 'COMMENTED', '2026-04-03T00:00:00Z', 1),
      ],
    },
    ...overrides,
  })

  it('maps GraphQL search nodes to dashboard rows', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                rateLimit: { cost: 1, remaining: 4999, resetAt: '2026-04-29T01:00:00Z' },
                search: { issueCount: 1, nodes: [samplePr()] },
              },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        ),
      ),
    )

    const rows = await fetchPullRequests('org:BrandEmbassy')

    expect(rows).toHaveLength(1)
    const row = rows[0]
    expect(row.id).toBe(42)
    expect(row.number).toBe(42)
    expect(row.title).toBe('A title')
    expect(row.author).toBe('alice')
    expect(row.repository).toBe('repo')
    expect(row.link).toBe('https://github.com/BrandEmbassy/repo/pull/42')
    expect(row.changes).toBe(15)
    expect(row.pullRequest).toStrictEqual({ additions: 10, deletions: 5, changed_files: 3 })
    expect(row.assignees).toStrictEqual([{ id: 9, login: 'bob', avatar_url: 'bobAv' }])
    expect(row.labels).toStrictEqual([{ name: 'bug', color: 'ff0000' }])
    expect(row.comments).toBe(4 + 2 + 1)
    expect(row.reviews.map((r: any) => r.user.id)).toStrictEqual([3, 2])
  })

  it('sorts rows by createdAt desc', async () => {
    const a = samplePr({ number: 1, createdAt: '2026-04-01T00:00:00Z' })
    const b = samplePr({ number: 2, createdAt: '2026-04-03T00:00:00Z' })
    const c = samplePr({ number: 3, createdAt: '2026-04-02T00:00:00Z' })

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ data: { search: { issueCount: 3, nodes: [a, b, c] } } }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        ),
      ),
    )

    const rows = await fetchPullRequests('org:BrandEmbassy')
    expect(rows.map((r: any) => r.number)).toStrictEqual([2, 3, 1])
  })

  it('issues a single graphql request for many PRs', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              search: {
                issueCount: 30,
                nodes: Array.from({ length: 30 }, (_, i) => samplePr({ number: i + 1 })),
              },
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchPullRequests('org:BrandEmbassy')

    expect(rows).toHaveLength(30)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
