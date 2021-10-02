import { IconButton } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';

export default function Logout() {
  function handleClick() {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <IconButton aria-label="delete" onClick={handleClick}>
      <LogoutIcon style={{color: '#ffffff'}}/>
    </IconButton>
  );
}
