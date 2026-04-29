import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllRepositoryNames, getGraphqlResponse } from './Api'

describe('Api', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  describe('getAllRepositoryNames', () => {
    beforeEach(() => {
      const responses = [
        new Response(JSON.stringify([{ name: 'a' }, { name: 'b' }, { name: 'c' }]), {
          headers: {
            link: '<https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2>; rel="next", <https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=3>; rel="last"',
            'content-type': 'application/json',
          },
          status: 200,
        }),
        new Response(JSON.stringify([{ name: 'd' }, { name: 'e' }, { name: 'f' }]), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      ]

      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(responses.shift()!))
      )
    })

    it('paginates through repository pages', async () => {
      const repos = await getAllRepositoryNames()

      expect(repos).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f'])
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('serves subsequent calls from session cache', async () => {
      await getAllRepositoryNames()
      const repos = await getAllRepositoryNames()

      expect(repos).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f'])
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getAllRepositoryNames empty result', () => {
    it('does not cache an empty repo list', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify([]), {
              headers: { 'content-type': 'application/json' },
              status: 200,
            })
          )
        )
      )

      const first = await getAllRepositoryNames()
      const second = await getAllRepositoryNames()

      expect(first).toStrictEqual([])
      expect(second).toStrictEqual([])
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getGraphqlResponse', () => {
    it('POSTs query and variables with Bearer auth', async () => {
      localStorage.setItem('githubToken', 'tok')
      const fetchMock = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { search: { nodes: [] } } }), {
            headers: { 'content-type': 'application/json' },
            status: 200,
          })
        )
      )
      vi.stubGlobal('fetch', fetchMock)

      const data = await getGraphqlResponse('query { x }', { y: 1 })

      expect(data).toStrictEqual({ search: { nodes: [] } })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      const url = call[0]
      const init = call[1]
      expect(url).toBe('https://api.github.com/graphql')
      expect(init.method).toBe('POST')
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer tok')
      expect(JSON.parse(init.body as string)).toStrictEqual({
        query: 'query { x }',
        variables: { y: 1 },
      })
    })

    it('throws when the response contains GraphQL errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify({ errors: [{ message: 'boom' }] }), {
              headers: { 'content-type': 'application/json' },
              status: 200,
            })
          )
        )
      )

      await expect(getGraphqlResponse('query { x }')).rejects.toThrow(/boom/)
    })

    it('throws on non-OK HTTP status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
          )
        )
      )

      await expect(getGraphqlResponse('query { x }')).rejects.toThrow(/401/)
    })
  })
})
