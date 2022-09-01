import { getNext } from "./loadRepos";

const GITHUB_API_URL = 'https://api.github.com'
const PAGE_LIMIT = 10

export const getJsonResponse = async (endpoint: string): Promise<any> => {
  const url = `${GITHUB_API_URL}${endpoint}`;

  const response = await getResponse(url)

  return await response.json();
}

export const getResponse = async (url: string): Promise<Response> => {
  const token = localStorage.getItem('githubToken')

  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
}

export const getAllRepositoryNames = async (): Promise<string[]> => {
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

  return repos
}
