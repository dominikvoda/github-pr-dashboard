import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllRepositoryNames } from './Api'

describe('Api', () => {
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

  it('getAllRepositoryNames', async () => {
    const repos = await getAllRepositoryNames()

    expect(repos).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
