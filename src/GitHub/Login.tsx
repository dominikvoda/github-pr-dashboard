import { Box, Button, Link, TextField } from "@mui/material";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

export interface LoginProps {
  onLogin: (githubToken: any) => void
}

export default function Login(props: LoginProps) {
  const [githubToken, setGithubToken] = React.useState('')

  function handleChange(event: any) {
    setGithubToken(event.target.value)
  }

  function handleSubmit(event: any) {
    props.onLogin(githubToken)

    event.preventDefault();
  }

  return (
    <Container fluid style={{marginTop: '10%'}}>
      <Row className="align-self-center">
        <Col md={{span: 4, offset: 4}}>
          <Box component="form" onSubmit={handleSubmit}>
            <Row style={{marginBottom: '20px'}}>
              <Col>
                <TextField
                  id="outlined-basic"
                  label="Github Personal Access Token"
                  variant="outlined"
                  onChange={handleChange}
                  value={githubToken}
                  fullWidth
                  helperText={(
                    <Link href="https://github.com/settings/tokens/new" target={'_blank'}>
                      Create personal access token
                    </Link>
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button variant="outlined" type="submit" fullWidth>Login</Button>
              </Col>
            </Row>
          </Box>
        </Col>
      </Row>
    </Container>
  )
}
