import React from 'react';
import RoundIconButton from './RoundIconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DeleteIconButton({ onClick, sx }) {
  return (
    <RoundIconButton
      ariaLabel="Διαγραφή"
      color="error"
      size="small"
      onClick={onClick}
      sx={sx}
    >
      <DeleteIcon />
    </RoundIconButton>
  );
}
