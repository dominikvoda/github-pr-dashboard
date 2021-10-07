import { Col, Container, Navbar, Row } from "react-bootstrap";
import RepositoryFilter from "./RepositoryFilter";
import Profile from "../Profile/Profile";
import PullRequestTable from "./PullRequestTable";
import React from "react";
import LabelFilter from "./LabelFilter";
import { createEmptyFilter, PullRequestFilter } from "./PullRequestFilter";

export default function Dashboard() {
  const [pullRequestFilter, setPullRequestFilter] = React.useState<PullRequestFilter>(() => {
    const stored = localStorage.getItem('pullRequestFilter');
    if (stored === null) {
      return createEmptyFilter()
    }

    return JSON.parse(stored);
  });

  const handleChangeRepositories = (selectedRepositories: any) => {
    const newPullRequestFilter: PullRequestFilter = {
      repositories: selectedRepositories,
      labels: pullRequestFilter.labels
    }

    setPullRequestFilter(newPullRequestFilter)
    localStorage.setItem('pullRequestFilter', JSON.stringify(newPullRequestFilter))
  };

  const handleChangeLabels = (selectedLabels: any) => {
    const newPullRequestFilter: PullRequestFilter = {
      repositories: pullRequestFilter.repositories,
      labels: selectedLabels
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
            <Profile/>
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
          <Col md={3}>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}}>
          <Col>
            <PullRequestTable pullRequestFilter={pullRequestFilter}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
