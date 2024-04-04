import React, { useCallback, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, } from '@mui/x-data-grid';
import { Avatar, AvatarGroup, Badge, Chip, Link } from "@mui/material";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import JiraLink from "./JiraLink";
import { PullRequestFilter } from "./PullRequestFilter";
import { GithubLabel } from "../GitHub/GithubLabel";
import PullRequestChanges from "./PullRequestChanges";
import ReviewStatus from "./ReviewStatus";
import { fetchPullRequests } from './fetchPullRequests';
import { GhProfile } from '../Profile/useGhProfile';
import { PullRequestTitle } from './PullRequestTitle';

TimeAgo.addDefaultLocale(en)
let timeAgo = new TimeAgo();

export interface PullRequestTableProps {
  pullRequestFilter: PullRequestFilter,
  ghProfile: GhProfile,
}

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    flex: 3,
    renderCell: params => (
      <PullRequestTitle params={params} />
    )
  },
  {
    field: 'reviews',
    headerName: 'Reviews',
    align: 'center',
    headerAlign: 'center',
    flex: 1,
    sortable: false,
    renderCell: params => (
      <ReviewStatus reviews={params.row.reviews} />
    )
  },
  {
    field: 'changes',
    headerName: 'Changes',
    align: 'center',
    headerAlign: 'center',
    flex: 0.5,
    renderCell: params => (
      <PullRequestChanges pullRequest={params.getValue(params.id, 'pullRequest') as any}/>
    )
  },
  {
    field: 'author',
    headerName: 'Author',
    align: 'center',
    headerAlign: 'center',
    flex: 1,
    renderCell: params => (
      <Link href={'https://github.com/' + params.value} target={'_blank'} underline={'hover'}>
        <Chip
          avatar={<Avatar
            alt={params.value as string}
            src={params.getValue(params.id, 'avatarUrl') as string}
            sx={{width: 26, height: 26}}
          />}
          label={params.value}
          variant="outlined"
          key={params.id}
        />
      </Link>
    )
  },
  {
    field: 'createdAt', headerName: 'Created At', width: 120,
    renderCell: params => (
      timeAgo.format(new Date(params.value as string))
    )
  },
  {
    field: 'repository',
    headerName: 'Repository',
    flex: 1,
    renderCell: params => (
      <Link href={'https://github.com/BrandEmbassy/' + params.value} target={'_blank'} underline={'hover'}>
        {params.value}
      </Link>
    )
  },
  {
    field: 'assignees',
    headerName: 'Assignees',
    align: 'center',
    headerAlign: 'center',
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <div>
        <AvatarGroup>
          {
            (params.value as any).map((user: any) => {
              return (<Avatar key={user.id} alt={user.login} src={user.avatar_url} sx={{width: 26, height: 26}}/>)
            })
          }
        </AvatarGroup>
      </div>
    ),
  },
  {
    field: 'comments',
    headerName: 'Comments',
    align: 'center',
    headerAlign: 'center',
    flex: 0.5,
    renderCell: params => (
      <Badge key={params.id} badgeContent={params.getValue(params.id, 'comments')} color="primary" showZero>
        <QuestionAnswerIcon color="disabled"/>
      </Badge>
    )
  },
  {
    field: 'jira',
    headerName: 'JIRA',
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 0.5,
    renderCell: params => (
      <JiraLink prTitle={params.getValue(params.id, 'title') as string}/>
    )
  },
];

export default function PullRequestTable(props: PullRequestTableProps) {
  const [rows, setRows] = React.useState<any[]>([])

  const loadPullRequests = useCallback(async (): Promise<void> => {
    setRows([])
    let filters = ''

    props.pullRequestFilter.repositories.forEach((repository: any) => (
      filters += ' repo:BrandEmbassy/' + repository
    ))

    props.pullRequestFilter.labels.forEach((label: GithubLabel) => (
      filters += ' label:"' + label.name + '"'
    ))

    if (filters === '') {
      filters = ' org:BrandEmbassy'
    }

    let rows = await fetchPullRequests(filters)
    setRows(rows)
  }, [props.pullRequestFilter.labels, props.pullRequestFilter.repositories])


  const filteredRows = useMemo(() => {
    if (!props.pullRequestFilter.filterApproved) {
      return rows
    }

    return rows.filter((pr) => {
      const myReview = (pr.reviews as Array<any>).find((review) => review.user.id === props.ghProfile.id)

      if (!myReview) {
        return true
      }
      console.log(myReview);

      return myReview.state !== "APPROVED"
    })

  }, [props.ghProfile.id, props.pullRequestFilter.filterApproved, rows])

  React.useEffect(() => {
    loadPullRequests()
  }, [loadPullRequests, props.pullRequestFilter]);

  return (
    <div style={{display: 'flex', marginBottom: '20px'}}>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        hideFooter
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
}
