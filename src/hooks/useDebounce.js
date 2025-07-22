import { useState, useEffect } from 'react';

// Αυτό το hook παίρνει μια τιμή (value) και έναν χρόνο καθυστέρησης (delay)
// και επιστρέφει την τιμή μόνο όταν ο χρήστης σταματήσει να πληκτρολογεί για 'delay' χιλιοστά του δευτερολέπτου.
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Αυτή είναι η συνάρτηση "καθαρισμού" που εκτελείται κάθε φορά που αλλάζει η τιμή,
    // ακυρώνοντας τον προηγούμενο χρονοδιακόπτη.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Τρέχει ξανά μόνο αν αλλάξει η τιμή ή η καθυστέρηση

  return debouncedValue;
}