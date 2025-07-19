import React from 'react';
import RoundIconButton from './RoundIconButton';
import EditIcon from '@mui/icons-material/Edit';

export default function EditIconButton({ onClick, sx }) {
  return (
    <RoundIconButton
      ariaLabel="Επεξεργασία"
      color="primary"
      size="small"
      onClick={onClick}
      sx={sx}
    >
      <EditIcon />
    </RoundIconButton>
  );
}
