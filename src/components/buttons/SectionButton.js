import React from 'react';
import { Button } from '@mui/material';

export default function SectionButton({ children, ...props }) {
  return (
    <Button
      variant="outlined"
      sx={{ textTransform: 'none', borderRadius: 2 }}
      {...props}
    >
      {children}
    </Button>
  );
}
