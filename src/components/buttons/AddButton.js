import React from 'react';
import RoundIconButton from './RoundIconButton';
import AddIcon from '@mui/icons-material/Add';

export default function AddButton(props) {
  return (
    <RoundIconButton ariaLabel="Προσθήκη" color="primary" {...props}>
      <AddIcon />
    </RoundIconButton>
  );
}
