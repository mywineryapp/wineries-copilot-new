// src/components/buttons/RoundIconButton.js
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

export default function RoundIconButton({ children, ariaLabel, onClick, color = 'primary', size = 'medium', disabled = false }) {
  return (
    <Tooltip title={ariaLabel} arrow>
      <span>
        <IconButton
          onClick={onClick}
          color={color}
          size={size}
          disabled={disabled}
          sx={{
            borderRadius: '50%',
            backgroundColor: 'transparent',
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            fontSize: size === 'small' ? 20 : 24,
          }}
          aria-label={ariaLabel}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
