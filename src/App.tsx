import React from 'react';
import Dashboard from "./PullRequests/Dashboard";
import Login from "./GitHub/Login";

export default function App() {
  const [githubToken, setGithubToken] = React.useState<string>(() => {
    return localStorage.getItem('githubToken') || '';
  });

  const onLogin = (githubToken: string) => {
    localStorage.setItem('githubToken', githubToken)
    setGithubToken(githubToken)
  }

  if (githubToken !== '') {
    return (<Dashboard/>)
  }

  return (<Login onLogin={onLogin}/>)
}
