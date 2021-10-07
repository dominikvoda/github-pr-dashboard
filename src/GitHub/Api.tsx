export const getJsonResponse = async (endpoint: string): Promise<any> => {
  const url = 'https://api.github.com' + endpoint;

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
