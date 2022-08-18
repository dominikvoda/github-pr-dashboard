
interface LinkHeaderItem {
  rel: string;
  link: string
}
export const parseLinkHeaderItem = (linkItem: string): LinkHeaderItem => {
  const [,link, rel] = linkItem.match(/<(.*?)>; rel="([a-z]*)"/) || []
  
  return { rel, link }
}

export const getNext = (headers: Headers): string | undefined => {
  const linkHeader = headers.get("link")
  if (!linkHeader) {
    return;
  }

  return linkHeader
    .split(/,\s*/)
    .map(parseLinkHeaderItem)
    .find(item => item?.rel === 'next')
    ?.link   
}