import { Col, Container, Navbar, Row } from "react-bootstrap";
import RepositoryFilter from "./RepositoryFilter";
import Profile from "../Profile/Profile";
import PullRequestTable from "./PullRequestTable";
import React from "react";
import LabelFilter from "./LabelFilter";

export default function Dashboard() {
  const [selectedRepositories, setSelectedRepositories] = React.useState<string[]>(() => {
    const stored = localStorage.getItem('selectedRepositories');
    if (stored === null) {
      return [];
    }
    return JSON.parse(stored);
  });

  const [selectedLabels, setSelectedLabels] = React.useState<string[]>(() => {
    const stored = localStorage.getItem('selectedLabels');
    if (stored === null) {
      return [];
    }
    return JSON.parse(stored);
  });

  const handleChangeRepositories = (selectedRepositories: any) => {
    setSelectedRepositories(selectedRepositories);
    localStorage.setItem('selectedRepositories', JSON.stringify(selectedRepositories))
  };

  const handleChangeLabels = (selectedLabels: any) => {
    setSelectedLabels(selectedLabels);
    localStorage.setItem('selectedLabels', JSON.stringify(selectedLabels))
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/" className="text-center w-100">
            <img
              alt=""
              src="/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Pull Requests
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid style={{marginTop: '20px'}}>
        <Row>
          <Col md={6}>
            <RepositoryFilter selectedRepositories={selectedRepositories} onSelectedRepositoriesChange={handleChangeRepositories}/>
          </Col>
          <Col md={3}>
            <LabelFilter selectedRepositories={selectedRepositories} selectedLabels={selectedLabels} onSelectedLabelsChange={handleChangeLabels}/>
          </Col>
          <Col md={3}>
            <Profile/>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}}>
          <Col>
            <PullRequestTable selectedRepositories={selectedRepositories} selectedLabels={selectedLabels} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
