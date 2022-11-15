import { getJsonResponse, getResponse } from "../GitHub/Api"
import { loadReviews } from "./reviews"

export const fetchPullRequests = async (filters: string) => {
  const issuesResponse = await getJsonResponse('/search/issues?q=' + encodeURIComponent('is:pr is:open ' + filters))

  const pullrequestsPromise:Array<Promise<any>> = issuesResponse.items.map(async (pr: any) => {
    const pullRequest = await getResponse(pr.pull_request.url)
      .then(response => response.json())

    const reviews = await loadReviews(pullRequest)

    const row = {
      id: pullRequest.number,
      number: pullRequest.number,
      title: pullRequest.title,
      author: pullRequest.user.login,
      labels: pullRequest.labels,
      link: pullRequest.html_url,
      repository: pullRequest.base.repo.name,
      avatarUrl: pullRequest.user.avatar_url,
      createdAt: pullRequest.created_at,
      assignees: pullRequest.assignees,
      comments: pullRequest.comments + pullRequest.review_comments,
      pullRequest: pullRequest,
      changes: pullRequest.additions + pullRequest.deletions,
      reviews: reviews,
    }

    return row
  })

  const results = await Promise.allSettled(pullrequestsPromise)
  const pullrequests = results.map((result:any) => result.value)

  pullrequests.sort((a: any, b: any): number => {
    return a.createdAt < b.createdAt ? 1 : -1
  })

  return pullrequests
}
