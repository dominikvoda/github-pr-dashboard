import { Avatar, Badge, CircularProgress } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TextsmsIcon from '@mui/icons-material/Textsms';
import CancelIcon from '@mui/icons-material/Cancel';

export interface ReviewStatusProps {
  reviews?: any[]
}

const reviewStatus: any = {
  APPROVED: (<CheckCircleIcon sx={{ fontSize: 13, color: '#357a38' }} />),
  COMMENTED: (<TextsmsIcon sx={{ fontSize: 13, color: '#adacaa' }} />),
  CHANGES_REQUESTED: (<CancelIcon sx={{ fontSize: 13, color: '#ab003c' }} />)
}


export default function ReviewStatus({reviews}: ReviewStatusProps) {
  if (reviews === undefined) {
    return <CircularProgress />
  }

  return (
    <div>
      {reviews.map((review: any) => {
        return (
            <Badge
              overlap="circular"
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
              badgeContent={reviewStatus[review.state]}
              style={{marginRight: '5px'}}
              key={review.id}
            >
            <Avatar alt={review.user.login} src={review.user.avatar_url} sx={{ width: 24, height: 24 }} />
          </Badge>
        )
      })}
    </div>
  )
}
