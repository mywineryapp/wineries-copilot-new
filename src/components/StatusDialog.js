import { Dialog, DialogContent, Typography, Button } from '@mui/material';

export default function StatusDialog({ open, message, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography>{message}</Typography>
        <Button onClick={onClose}>ΟΚ</Button>
      </DialogContent>
    </Dialog>
  );
}