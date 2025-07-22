import {
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip, Typography, Box
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firestore';

function formatDate(orderDate) {
    if (!orderDate) return '';
    if (orderDate.toDate) return orderDate.toDate().toLocaleDateString('el-GR');
    if (typeof orderDate === 'string') return new Date(orderDate).toLocaleDateString('el-GR');
    if (orderDate.seconds) return new Date(orderDate.seconds * 1000).toLocaleDateString('el-GR');
    return '';
}

function getWineryName(order) {
    // Αν έχει object με name
    if (order.wineryName && typeof order.wineryName === 'object' && order.wineryName.name)
        return order.wineryName.name;
    // Αν είναι string
    if (typeof order.wineryName === 'string')
        return order.wineryName;
    // Αν δεν έχει, γύρνα “—”
    return "—";
}

export default function OrderTable({ orders, onRowClick, reloadOrders }) {
    const [sendingId, setSendingId] = useState(null);
    const [emailStatus, setEmailStatus] = useState({});

    const handleSendEmail = async (orderId) => {
        setSendingId(orderId);
        setEmailStatus(prev => ({ ...prev, [orderId]: 'sending' }));
        try {
            const sendOrderEmail = httpsCallable(functions, 'sendOrderEmail');
            const result = await sendOrderEmail({ orderId });
            if (result.data.success) {
                setEmailStatus(prev => ({ ...prev, [orderId]: 'sent' }));
            } else {
                setEmailStatus(prev => ({ ...prev, [orderId]: 'failed' }));
            }
        } catch {
            setEmailStatus(prev => ({ ...prev, [orderId]: 'failed' }));
        } finally {
            setSendingId(null);
        }
    };

    // Επιλογή χρώματος ανά status
    function getStatusColor(status) {
        if (status === 'sent') return "#4caf50";   // Πράσινο
        if (status === 'failed') return "#e53935"; // Κόκκινο
        if (status === 'sending') return "#1565c0"; // Μπλε
        return "#1976d2"; // default blue
    }
    function getStatusIcon(status) {
        if (status === 'sent') return <MarkEmailReadIcon />;
        if (status === 'failed') return <ErrorIcon />;
        if (status === 'sending') return <CircularProgress size={24} />;
        return <EmailIcon />;
    }
    function getStatusTooltip(status) {
        if (status === 'sent') return "Το email στάλθηκε!";
        if (status === 'failed') return "Αποτυχία αποστολής, ξαναδοκίμασε!";
        if (status === 'sending') return "Γίνεται αποστολή...";
        return "Αποστολή Email";
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Οινοποιείο</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Προϊόντα</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ημερομηνία</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Αποστολή Email</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {orders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Typography align="center" color="text.secondary">Δεν βρέθηκαν παραγγελίες.</Typography>
                        </TableCell>
                    </TableRow>
                )}
                {orders.map((order) => {
                    const productNames = order.products?.map(p =>
                        p.name || p.productName || p.wineTypeId || "—"
                    ).join(', ');
                    const status = emailStatus[order.id];
                    const statusColor = getStatusColor(status);
                    return (
                        <TableRow
                            key={order.id}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={e => {
                                // Πατάμε στη γραμμή, εκτός από το email κουμπί
                                if (e.target.closest('button')) return;
                                onRowClick(order);
                            }}
                        >
                            <TableCell>
                                <Box sx={{ fontWeight: 600, fontSize: 16 }}>
                                    {getWineryName(order)}
                                </Box>
                            </TableCell>
                            <TableCell>{productNames}</TableCell>
                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                            <TableCell align="center">
                                <Tooltip title={getStatusTooltip(status)}>
                                    <span>
                                        <IconButton
                                            sx={{
                                                bgcolor: status ? statusColor : "#1976d2",
                                                color: "#fff",
                                                '&:hover': {
                                                    bgcolor: status ? statusColor : "#115293",
                                                    color: "#fff"
                                                }
                                            }}
                                            disabled={status === 'sent' || sendingId === order.id}
                                            onClick={e => { e.stopPropagation(); handleSendEmail(order.id); }}
                                        >
                                            {getStatusIcon(status)}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
