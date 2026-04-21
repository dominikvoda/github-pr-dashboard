import { Col, Container, Navbar, Row } from "react-bootstrap";
import RepositoryFilter from "./RepositoryFilter";
import Profile from "../Profile/Profile";
import PullRequestTable from "./PullRequestTable";
import React, { useMemo } from "react";
import LabelFilter from "./LabelFilter";
import { createEmptyFilter, PullRequestFilter } from "./PullRequestFilter";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useGhProfile } from "../Profile/useGhProfile";
import { usePolling } from "../hooks/usePolling";
import { buildFilterString } from "./buildFilterString";
import NotificationToggle from "../notifications/NotificationToggle";

export default function Dashboard() {
  const ghProfile = useGhProfile()

  const [pullRequestFilter, setPullRequestFilter] = React.useState<PullRequestFilter>(() => {
    const stored = localStorage.getItem('pullRequestFilter');
    if (stored === null) {
      return createEmptyFilter()
    }

    return JSON.parse(stored);
  });

  const filters = useMemo(() => buildFilterString(pullRequestFilter), [pullRequestFilter.repositories, pullRequestFilter.labels])
  const { rows, isLoading, lastPollTime } = usePolling(filters)

  const handleChangeRepositories = (selectedRepositories: any) => {
    const newPullRequestFilter: PullRequestFilter = {
      ...pullRequestFilter,
      repositories: selectedRepositories,
    }

    setPullRequestFilter(newPullRequestFilter)
    localStorage.setItem('pullRequestFilter', JSON.stringify(newPullRequestFilter))
  };

  const handleChangeLabels = (selectedLabels: any) => {
    const newPullRequestFilter: PullRequestFilter = {
      ...pullRequestFilter,
      labels: selectedLabels
    }

    setPullRequestFilter(newPullRequestFilter)
    localStorage.setItem('pullRequestFilter', JSON.stringify(newPullRequestFilter))
  };

  const handleFilterApprovedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPullRequestFilter: PullRequestFilter = {
      ...pullRequestFilter,
      filterApproved: event.target.checked
    }

    setPullRequestFilter(newPullRequestFilter)
    localStorage.setItem('pullRequestFilter', JSON.stringify(newPullRequestFilter))
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Pull Requests
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <NotificationToggle />
            <Profile ghProfile={ghProfile}/>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid style={{marginTop: '20px'}}>
        <Row>
          <Col md={5}>
            <RepositoryFilter pullRequestFilter={pullRequestFilter} onSelectedRepositoriesChange={handleChangeRepositories}/>
          </Col>
          <Col md={3}>
            <LabelFilter pullRequestFilter={pullRequestFilter} onSelectedLabelsChange={handleChangeLabels}/>
          </Col>
          <Col md={2}>
            <FormControlLabel control={<Checkbox onChange={handleFilterApprovedChange} checked={pullRequestFilter.filterApproved} />} label="Filter out approved PRs" />
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-end">
            {isLoading && <span style={{color: '#666', fontSize: '0.85rem'}}>Refreshing…</span>}
            {!isLoading && lastPollTime && (
              <span style={{color: '#999', fontSize: '0.85rem'}}>
                Updated {lastPollTime.toLocaleTimeString()}
              </span>
            )}
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}}>
          <Col>
            <PullRequestTable rows={rows} ghProfile={ghProfile} pullRequestFilter={pullRequestFilter}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
