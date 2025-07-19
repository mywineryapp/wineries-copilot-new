import React from 'react';
import { Button } from '@mui/material';

export default function SecondaryButton({ children, onClick, disabled = false }) {
  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
