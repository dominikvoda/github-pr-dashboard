export const getResponse = async (endpoint: string): Promise<any> => {
  const url = 'https://api.github.com' + endpoint;
  const token = localStorage.getItem('githubToken')

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  return await response.json();
}
