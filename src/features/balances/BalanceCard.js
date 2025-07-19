import { Card, CardContent, Typography } from '@mui/material';

export default function BalanceCard({ data }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">
          Ποσό: {data.amount} {data.currency}
        </Typography>
        <Typography variant="body2">
          Λήξη: {new Date(data.dueDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">Κατάσταση: {data.status}</Typography>
        <Typography variant="caption" color="text.secondary">
          {data.notes}
        </Typography>
      </CardContent>
    </Card>
  );
}
