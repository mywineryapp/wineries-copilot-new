import React from 'react';
import RoundIconButton from './RoundIconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function ExportButton(props) {
  return (
    <RoundIconButton ariaLabel="Εξαγωγή" color="primary" {...props}>
      <FileDownloadIcon />
    </RoundIconButton>
  );
}
