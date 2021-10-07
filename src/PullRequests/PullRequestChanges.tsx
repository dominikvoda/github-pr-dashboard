import { Tooltip } from "@mui/material";

export interface PullRequestChangesProps {
  pullRequest: any
}

export default function PullRequestChanges(props: PullRequestChangesProps){
  const title =  props.pullRequest.changed_files + ' changed files'

  return (
    <Tooltip title={title} placement="top" arrow>
      <div>
        <span style={{color: '#357a38'}}>+{props.pullRequest.additions}</span>
        {' '}
        <span style={{color: '#ab003c'}}>-{props.pullRequest.deletions}</span>
      </div>
    </Tooltip>
  )
}
