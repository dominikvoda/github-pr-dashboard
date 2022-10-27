import { GithubLabel } from "../GitHub/GithubLabel";

export interface PullRequestFilter {
  repositories: Array<string>,
  labels: Array<GithubLabel>,
  filterApproved?: boolean,
}

export const createEmptyFilter = (): PullRequestFilter => {
  return {
    repositories: [],
    labels: [],
    filterApproved: false
  }
}
