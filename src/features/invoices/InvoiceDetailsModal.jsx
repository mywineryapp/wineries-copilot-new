import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  IconButton // ✅ Αλλαγή από Button σε IconButton για καλύτερη εμφάνιση
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CancelTopRightButton } from '../../components/buttons'; // ✅ Προσθήκη για το κουμπί κλεισίματος

// Βοηθητική συνάρτηση από την προηγούμενη έκδοση
const formatCurrency = (num) => {
    if (typeof num !== 'number') return '-';
    return num.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
};

export default function InvoiceDetailsModal({ open, onClose, invoiceGroup }) {
  if (!invoiceGroup) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ position: 'relative', pb: 1 }}>
        Λεπτομέρειες Τιμολογίων για: {invoiceGroup.wineryName}
        <Typography variant="body2" color="text.secondary">
          Ημερομηνία: {invoiceGroup.date}
        </Typography>

        {/* Κουμπιά Εκτύπωσης / PDF / Excel */}
        <Box sx={{ position: 'absolute', top: 16, right: 56, display: 'flex', gap: 1 }}>
          <Tooltip title="Εκτύπωση">
            <IconButton size="small" onClick={() => window.print()}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Εξαγωγή PDF (δεν λειτουργεί ακόμα)">
            <IconButton size="small" onClick={() => {/* λογική εξαγωγής PDF */}}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Εξαγωγή Excel (δεν λειτουργεί ακόμα)">
            <IconButton size="small" onClick={() => {/* λογική εξαγωγής Excel */}}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <CancelTopRightButton onClick={onClose} />
      </DialogTitle>

      <DialogContent dividers>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Περιγραφή Είδους</TableCell>
                <TableCell>Φιάλη</TableCell>
                <TableCell>Οίνος</TableCell>
                <TableCell align="right">Ποσότητα</TableCell>
                <TableCell align="right">Τιμή Μονάδος</TableCell>
                <TableCell>Σημειώσεις</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceGroup.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {item.productDescription || '-'}
                  </TableCell>
                  <TableCell>{item.bottleInfo || '-'}</TableCell>
                  <TableCell>{item.wineInfo || '-'}</TableCell>
                  <TableCell align="right">{item.quantity || 0}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Κλείσιμο</Button>
      </DialogActions>
    </Dialog>
  );
}