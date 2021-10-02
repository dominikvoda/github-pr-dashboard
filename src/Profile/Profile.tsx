import React from 'react';
import { getResponse } from "../GitHub/Api";
import { Avatar } from "@mui/material";
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
    <div className="d-flex align-items-center" style={{color: '#ffffff'}}>
      <Avatar src={ghProfile.avatar_url}/>
      <span style={{marginLeft: '10px', marginRight: '20px'}}>{ghProfile.name}</span>
      <Logout/>
    </div>
  );
}
