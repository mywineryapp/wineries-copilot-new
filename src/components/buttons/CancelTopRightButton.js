import React from 'react';
import RoundIconButton from './RoundIconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function CancelTopRightButton(props) {
  return (
    <RoundIconButton ariaLabel="Κλείσιμο" color="default" {...props}>
      <CloseIcon />
    </RoundIconButton>
  );
}
