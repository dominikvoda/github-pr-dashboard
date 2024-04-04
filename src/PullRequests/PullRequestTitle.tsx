import React, { FC } from 'react';
import styled from '@emotion/styled';
import { Chip, Link } from "@mui/material";
import { GridRenderCellParams } from '@mui/x-data-grid';

import { GithubLabel, getLabelStyle } from '../GitHub/GithubLabel';

interface PullRequestTitleProps {
  params: GridRenderCellParams
}

const StyledWrapper = styled.div({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const PullRequestTitle: FC<PullRequestTitleProps> = ({params}) => {
  const title = params.value as string
  const link = params.row.link as string
  const labels = params.row.labels as GithubLabel[]

  return (
    <StyledWrapper>
        <Link
          href={link}
          target={'_blank'}
          underline={'hover'}
          title={title}
        >
          {title}
        </Link>
        <div>
          {labels.map((label) => {
            return (
              <Chip
                title={label.name}
                label={label.name}
                key={label.name}
                size="small"
                style={getLabelStyle(label)}
                sx={{height: 18}}
              />
            )
          })}
        </div>
      </StyledWrapper>
  )
}
