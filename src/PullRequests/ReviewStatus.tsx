import { Avatar, Badge, CircularProgress } from "@mui/material";
import React from "react";
import { getResponse } from "../GitHub/Api";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TextsmsIcon from '@mui/icons-material/Textsms';
import CancelIcon from '@mui/icons-material/Cancel';

export interface ReviewStatusProps {
  pullRequest: any
}

const reviewStatus: any = {
  APPROVED: (<CheckCircleIcon sx={{ fontSize: 13, color: '#357a38' }} />),
  COMMENTED: (<TextsmsIcon sx={{ fontSize: 13, color: '#adacaa' }} />),
  CHANGES_REQUESTED: (<CancelIcon sx={{ fontSize: 13, color: '#ab003c' }} />)
}


export default function ReviewStatus(props: ReviewStatusProps) {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);

  const loadReviews = async () => {
    getResponse(props.pullRequest.url + '/reviews')
      .then(response => response.json())
      .then((reviews: any[]) => {
        const lastUserReviews: any[] = []

        reviews.sort((a, b) => { return a.submittedAt > b.submittedAt ? -1 : 1 })
          .forEach(review => {
            if (lastUserReviews.some((existingReview: any) => { return existingReview.user.id === review.user.id })) {
              return
            }

            if (review.user.id === props.pullRequest.user.id) {
              return
            }

            lastUserReviews.push(review)
          })

        setReviews(lastUserReviews)
        setLoaded(true)
      })
  }

  React.useEffect(() => {
    loadReviews()
  }, []);

  if (loaded) {
    return (
      <div>
        {reviews.map((review: any) => {
          return (
              <Badge
                overlap="circular"
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                badgeContent={reviewStatus[review.state]}
                style={{marginRight: '5px'}}
              >
              <Avatar alt={review.user.login} src={review.user.avatar_url} sx={{ width: 24, height: 24 }} />
            </Badge>
          )
        })}
      </div>
    )
  }

  return (<CircularProgress/>)
}
