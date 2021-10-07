import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, } from '@mui/x-data-grid';
import { getJsonResponse, getResponse } from "../GitHub/Api";
import { Avatar, AvatarGroup, Badge, Chip, Link } from "@mui/material";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import JiraLink from "./JiraLink";
import { createEmptyFilter, PullRequestFilter } from "./PullRequestFilter";
import { getLabelStyle, GithubLabel } from "../GitHub/GithubLabel";
import PullRequestChanges from "./PullRequestChanges";
import ReviewStatus from "./ReviewStatus";

TimeAgo.addDefaultLocale(en)
let timeAgo = new TimeAgo();

export interface PullRequestTableProps {
  pullRequestFilter: PullRequestFilter,
}

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    flex: 3,
    renderCell: params => (
      <div>
        <Link href={params.getValue(params.id, 'link') as string}
              target={'_blank'}
              underline={'hover'}>
          {params.value}
        </Link>
        <span>
          {
            (params.getValue(params.id, 'labels') as any).map((label: GithubLabel) => {
              return (<Chip label={label.name} size="small" style={getLabelStyle(label)} sx={{height: 18}}/>)
            })
          }
        </span>
      </div>
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
      <ReviewStatus pullRequest={params.getValue(params.id, 'pullRequest') as any}/>
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
              return (<Avatar alt={user.login} src={user.avatar_url} sx={{width: 26, height: 26}}/>)
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
      <Badge badgeContent={params.getValue(params.id, 'comments')} color="primary" showZero>
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

  const loadPullRequests = async (): Promise<void> => {
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

    const issuesResponse = await getJsonResponse('/search/issues?q=' + encodeURIComponent('is:pr is:open ' + filters))

    issuesResponse.items.map((pr: any) => {
      return getResponse(pr.pull_request.url)
        .then(response => response.json())
        .then(pullRequest => {
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
            reviews: ''
          }

          setRows(
            rows => [...rows, row]
              .sort((a: any, b: any): number => {
                return a.createdAt < b.createdAt ? 1 : -1
              }))
        })
    })
  }

  React.useEffect(() => {
    loadPullRequests()
  }, [props.pullRequestFilter]);

  return (
    <div style={{display: 'flex', marginBottom: '20px'}}>
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
}
