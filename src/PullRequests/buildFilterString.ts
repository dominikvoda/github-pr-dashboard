import { PullRequestFilter } from "./PullRequestFilter"

export function buildFilterString(filter: PullRequestFilter): string {
  let filters = ''

  filter.repositories.forEach((repository: any) => (
    filters += ' repo:BrandEmbassy/' + repository
  ))

  filter.labels.forEach((label) => (
    filters += ' label:"' + label.name + '"'
  ))

  if (filters === '') {
    filters = ' org:BrandEmbassy'
  }

  return filters
}
