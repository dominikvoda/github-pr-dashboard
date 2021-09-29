import React from 'react';
import { Avatar, Chip, Link } from "@mui/material";
import AssignmentIcon from '@mui/icons-material/Assignment';

export interface JiraLinkProps {
  prTitle: string
}

export default function JiraLink(props: JiraLinkProps) {
  let ticketNumber = props.prTitle.match('^([A-Z]*[-]?[0-9]+)[^0-9]*');

  if (ticketNumber === null) {
    return (<span/>)
  }

  return (
    <Link href={'https://tlvjira02.nice.com/browse/' + ticketNumber[1].toUpperCase()} target={'blank'}>
      {/*<Chip*/}
      {/*  avatar={*/}
      {/*    <Avatar alt="Jira" sx={{width: 26, height: 26}}>*/}
      {/*      <AssignmentIcon color="disabled"/>*/}
      {/*    </Avatar>*/}
      {/*  }*/}
      {/*  label="Jira"*/}
      {/*  variant="outlined"*/}
      {/*/>*/}

      <AssignmentIcon color="disabled"/>
    </Link>
  );
}
