import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ThemeContext } from './muiThemes'; // 🔁 φάκελος που περιέχει το ThemeContext

export default function ThemeSwitcher() {
  const { mode, toggleTheme } = useContext(ThemeContext);

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
      <IconButton onClick={toggleTheme} sx={{ color: 'inherit' }}>
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}