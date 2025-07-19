import { lightTokens } from './tokens-light';
import { darkTokens } from './tokens-dark';

export const getTokens = (mode) => (mode === 'dark' ? darkTokens : lightTokens);