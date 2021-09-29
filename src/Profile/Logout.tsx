import { IconButton } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';

export default function Logout() {
  function handleClick() {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <IconButton style={{position: 'absolute', top: '16px', right: '10px'}} aria-label="delete" onClick={handleClick}>
      <LogoutIcon/>
    </IconButton>
  );
}
