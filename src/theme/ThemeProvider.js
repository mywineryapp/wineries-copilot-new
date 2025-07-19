import {
  createContext,
  useMemo,
  useState,
  useEffect
} from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { lightTokens } from './tokens-light';
import { tokensDark } from './tokens-dark';
import { wineryThemes } from './wineryPalettes';

export const ThemeContext = createContext();

export default function ThemeProviderWrapper({ children }) {
  const [mode, setMode] = useState('light');
  const [selectedWinery, setSelectedWinery] = useState('Nemea');
  const [customTheme, setCustomTheme] = useState(null);

  // 🗃️ Load saved selection on first render
  useEffect(() => {
    const savedWinery = localStorage.getItem('selectedWinery');
    if (savedWinery) setSelectedWinery(savedWinery);

    const storedTheme = localStorage.getItem('customTheme');
    if (storedTheme) setCustomTheme(JSON.parse(storedTheme));
  }, []);

  // 💾 Save winery selection whenever it changes
  const updateSelectedWinery = (winery) => {
    setSelectedWinery(winery);
    localStorage.setItem('selectedWinery', winery);
  };

  // 💾 Save custom theme when it updates
  const updateCustomTheme = (theme) => {
    setCustomTheme(theme);
    localStorage.setItem('customTheme', JSON.stringify(theme));
  };

  // 🎨 Determine active theme tokens
  const tokens =
    selectedWinery === 'Custom'
      ? customTheme || lightTokens
      : wineryThemes[selectedWinery] || (mode === 'light' ? lightTokens : tokensDark);

  // 🧠 Build full theme with component overrides
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: tokens.color.background,
            paper: tokens.color.surface
          },
          text: {
            primary: tokens.color.text
          },
          primary: {
            main: tokens.color.primary
          },
          secondary: {
            main: tokens.color.secondary
          },
          error: {
            main: tokens.color.error
          }
        },
        shape: {
          borderRadius: tokens.radius?.md || 8
        },
        spacing: factor => `${factor * 4}px`,
        typography: {
          fontFamily: tokens.font?.body || 'Roboto, sans-serif',
          h1: {
            fontFamily: tokens.font?.heading || 'Playfair Display, serif'
          }
        },
        shadows: [tokens.shadow?.level1 || '0px 2px 4px rgba(0,0,0,0.2)'],
        components: {
          MuiPaper: {
            defaultProps: {
              elevation: 1
            },
            styleOverrides: {
              root: {
                backgroundColor: '#fff',
                borderRadius: tokens.radius?.md || 8,
                border: `1px solid ${tokens.color.primary}`
              }
            }
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: '#fff',
                border: `1px solid ${tokens.color.primary}`,
                borderRadius: tokens.radius?.md || 8
              }
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                backgroundColor: '#fff',
                border: `1px solid ${tokens.color.primary}`,
                color: tokens.color.text,
                borderRadius: 4
              }
            }
          }
        }
      }),
    [tokens, mode]
  );

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
        selectedWinery,
        setSelectedWinery: updateSelectedWinery,
        customTheme,
        setCustomTheme: updateCustomTheme
      }}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}