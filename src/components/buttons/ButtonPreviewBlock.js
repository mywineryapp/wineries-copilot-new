import {
  AddButton,
  DeleteIconButton,
  CancelTopRightButton,
  SectionButton,
  SaveButton,
  EmailStatusBadge,
  EditIconButton,
  ExportButton,
  ReminderBadge
} from './buttons';

import { Paper, Stack, Typography } from '@mui/material';

export default function ButtonPreviewBlock() {
  const handleMock = () => alert('Click!');

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        🔘 Προεπισκόπηση Κουμπιών UI
      </Typography>

      <Stack spacing={2} direction="row" flexWrap="wrap">
        <AddButton onClick={handleMock}>Προσθήκη Επαφής</AddButton>
        <DeleteIconButton onClick={handleMock} />
        <CancelTopRightButton onClick={handleMock} />
        <SectionButton label="Επεξεργασία Προϊόντων" icon={<EditIconButton onClick={handleMock} />} onClick={handleMock} />
        <SaveButton saving={false} onClick={handleMock} />
        <ExportButton onClick={handleMock} label="Εξαγωγή Παραγγελιών" />
        <EmailStatusBadge status="sent" />
        <EmailStatusBadge status="failed" />
        <ReminderBadge dueToday={true} />
        <ReminderBadge dueToday={false} />
      </Stack>
    </Paper>
  );
}