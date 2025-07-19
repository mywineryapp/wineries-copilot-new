import { Paper, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function RecordCardSection({ title, children, sx = {} }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={1}
      sx={{
        backgroundColor: '#fff', // ✅ καθαρό φόντο
        border: `1px solid ${theme.palette.primary.main}`, // ✅ περίγραμμα theme
        borderRadius: theme.shape.borderRadius, // ✅ πομπέ εμφάνιση από theme
        px: 2,
        py: 2,
        mb: 3,
        ...sx
      }}
    >
      {title && (
        <Typography
          variant="subtitle1"
          sx={{
            mb: 2,
            color: theme.palette.text.primary // ✅ consistent γραμματοσειρά
          }}
        >
          {title}
        </Typography>
      )}
      <Stack spacing={1}>
        {children}
      </Stack>
    </Paper>
  );
}