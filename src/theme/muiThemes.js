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

    useEffect(() => {
        const savedWinery = localStorage.getItem('selectedWinery');
        if (savedWinery && Object.keys(wineryThemes).includes(savedWinery)) {
            setSelectedWinery(savedWinery);
        } else {
            setSelectedWinery('Nemea');
            localStorage.setItem('selectedWinery', 'Nemea');
        }
    }, []);

    const updateSelectedWinery = (winery) => {
        setSelectedWinery(winery);
        localStorage.setItem('selectedWinery', winery);
    };

    const tokens = wineryThemes[selectedWinery] || (mode === 'light' ? lightTokens : tokensDark);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    background: {
                        default: '#f4f6f8', // Ένα πολύ απαλό γκρι για το φόντο
                        paper: '#ffffff',
                    },
                    text: {
                        primary: tokens.color.text,
                    },
                    primary: {
                        main: tokens.color.primary,
                    },
                    secondary: {
                        main: tokens.color.secondary,
                    },
                    error: {
                        main: tokens.color.error,
                    },
                },
                shape: {
                    borderRadius: 12, // Πιο στρογγυλεμένες γωνίες παντού
                },
                spacing: factor => `${factor * 4}px`,
                typography: {
                    fontFamily: tokens.font?.body || 'Roboto, sans-serif',
                    h1: { fontFamily: tokens.font?.heading || 'Playfair Display, serif', },
                    h4: { fontFamily: tokens.font?.heading || 'Playfair Display, serif', fontWeight: 700 },
                    h5: { fontFamily: tokens.font?.heading || 'Playfair Display, serif', fontWeight: 600 },
                    h6: { fontWeight: 600 },
                },
                // ✅✅✅ Η ΑΝΑΒΑΘΜΙΣΗ ΕΙΝΑΙ ΕΔΩ ✅✅✅
                components: {
                    MuiPaper: {
                        defaultProps: {
                            elevation: 0, // Αφαιρούμε την default σκιά για να βάλουμε τη δική μας
                        },
                        styleOverrides: {
                            root: {
                                // Εφαρμόζουμε τη νέα σκιά και περίγραμμα σε ΟΛΑ τα Paper
                                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #e0e0e0',
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                borderRadius: 8, // Στρογγυλεμένα κουμπιά
                            },
                        },
                    },
                },
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
            }}
        >
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
}