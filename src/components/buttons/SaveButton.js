import React from 'react';
import RoundIconButton from './RoundIconButton';
import SaveIcon from '@mui/icons-material/Save';

export default function SaveButton(props) {
  return (
    <RoundIconButton ariaLabel="Αποθήκευση" color="success" {...props}>
      <SaveIcon />
    </RoundIconButton>
  );
}
