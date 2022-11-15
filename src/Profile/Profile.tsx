import { Avatar } from "@mui/material";
import Logout from "./Logout";

interface ProfileProps {
  ghProfile: {
    avatar_url: string,
    name: string,
  },
}

export default function Profile({ghProfile}: ProfileProps): JSX.Element {


  return (
    <div className="d-flex align-items-center" style={{color: '#ffffff'}}>
      <Avatar src={ghProfile.avatar_url}/>
      <span style={{marginLeft: '10px', marginRight: '20px'}}>{ghProfile.name}</span>
      <Logout/>
    </div>
  );
}
