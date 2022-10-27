import { getResponse } from "../GitHub/Api"

export const loadReviews = async (pullRequest: any) => {
  const reviews:any[] = await getResponse(pullRequest.url + '/reviews')
    .then(response => response.json())

  const lastUserReviews: any[] = []

  reviews
    .sort((a, b) => { return a.submitted_at > b.submitted_at ? -1 : 1 })
    .forEach(review => {
      if (lastUserReviews.some((existingReview: any) => { return existingReview.user.id === review.user.id })) {
        return
      }

      if (review.user.id === pullRequest.user.id) {
        return
      }

      lastUserReviews.push(review)
    })

  return lastUserReviews
}
