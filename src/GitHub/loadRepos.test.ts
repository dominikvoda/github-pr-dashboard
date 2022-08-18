import { getNext, parseLinkHeaderItem } from './loadRepos';

describe('loadRepos', () => {
  describe('getNext', () => {
    it('should return next link', () => {
      const expectedLink = 'https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2'
      const headers = new Headers({
        link: `<${expectedLink}>; rel="next"`
      })
      const link = getNext(headers)
      expect(link).toBe(expectedLink)
    })

    it('should return next link with multiple links', () => {
      const expectedLink = 'https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2'
      const headers = new Headers({
        link: `<https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2>; rel="next", <https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=3>; rel="last"`
      })
      const link = getNext(headers)

      expect(link).toBe(expectedLink)
    })

    it('should return empty link (no next link)', () => {
      const headers = new Headers({
        link: `<https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2>; rel="prev", <https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=3>; rel="last"`
      })
      const link = getNext(headers)

      expect(link).toBe(undefined)
    })

    it('should return empty link with no link header provided', () => {
      const headers = new Headers({})
      const link = getNext(headers)

      expect(link).toBe(undefined)
    })
  })

  describe('parseLinkHeaderItem', () => { 
    it('should return parsed headers', () => {
      const linkHeaderItem = `<https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2>; rel="next", <https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=3>; rel="last"`
      const parsedLinkHeaders = parseLinkHeaderItem(linkHeaderItem)

      expect(parsedLinkHeaders).toStrictEqual({
        link: "https://api.github.com/organizations/17497784/repos?sort=updated&per_page=100&page=2",
        rel: "next",
      })
    });
  })
})
