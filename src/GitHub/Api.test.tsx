import { getAllRepositoryNames } from './Api';
import fetchMock from "jest-fetch-mock"

describe('Api', () => {
  beforeEach(() => {
    fetchMock.doMock()
    
    fetchMock.mockResponseOnce(JSON.stringify([{name: "a"}, {name: "b"}, {name: "c"}]), {
      headers: {
        link: '<https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2>; rel="next", <https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=3>; rel="last"',
        'content-type': 'application/json',
      },
      status: 200,
    })

    fetchMock.mockResponseOnce(JSON.stringify([{name: "d"}, {name: "e"}, {name: "f"}]), {
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
    })
  })
  it('getAllRepositoryNames', async () => {

    const repos = await getAllRepositoryNames()
    
    expect(repos).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(fetchMock).toBeCalledTimes(2)
  })
})