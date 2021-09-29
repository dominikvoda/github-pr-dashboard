import React from 'react';
import { getResponse } from "../GitHub/Api";
import { Avatar, Card, CardHeader } from "@mui/material";
import Logout from "./Logout";

export default function Profile() {
  const [ghProfile, setGhProfile] = React.useState({name: '', avatar_url: '', login: null})
  const [profileLoaded, setProfileLoaded] = React.useState(false);

  const loadProfile = async (): Promise<void> => {
    const profileData = await getResponse('/user')
    setGhProfile(profileData);
    setProfileLoaded(true)
  }

  React.useEffect(() => {
    if (!profileLoaded) {
      loadProfile()
    }
  });

  return (
    <Card style={{position: 'relative'}}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={ghProfile.avatar_url}/>
        }
        title={ghProfile.name}
        subheader={ghProfile.login}
      />
      <Logout/>
    </Card>
  );
}
