// src/features/settings/ReferenceItemEditModal.js  (ή src/components/modals/ReferenceItemEditModal.js)

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    // Box, // Αφαιρέθηκε: όπως είχαμε πει
} from '@mui/material';

export default function ReferenceItemEditModal({
    open,
    onClose,
    onSave,
    item, // Το αντικείμενο αναφοράς που επεξεργάζεται (αν υπάρχει)
    isEditing, // True αν επεξεργαζόμαστε, false αν προσθέτουμε
    label, // Το label της λίστας αναφοράς (π.χ. "Τύποι Πωμάτων")
    enableSortOrder // Αν η λίστα υποστηρίζει sortOrder
}) {
    const [name, setName] = useState('');
    const [active, setActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(999); // Default value

    useEffect(() => {
        if (open && item) {
            // Όταν το modal ανοίγει για επεξεργασία, προ-συμπλήρωσε τα πεδία
            setName(item.name || '');
            setActive(item.active !== undefined ? item.active : true);
            setSortOrder(item.sortOrder !== undefined ? item.sortOrder : 999);
        } else if (open && !isEditing) {
            // Όταν το modal ανοίγει για προσθήκη, καθάρισε τα πεδία
            setName('');
            setActive(true);
            setSortOrder(999);
        }
    }, [open, item, isEditing]);

    const handleSave = () => {
        // Εδώ είναι η κρίσιμη γραμμή 77 που αναφέρουν τα logs!
        // Η onSave είναι ένα prop που έρχεται από το ReferenceList.js
        // και το ReferenceList.js είναι υπεύθυνο για την κλήση του Firestore
        // με το σωστό path και item.id.

        console.log("Saving item from modal. isEditing:", isEditing, "item received by modal:", item);
        console.log("Name:", name, "Active:", active, "Sort Order:", sortOrder);

        if (!name.trim()) {
            alert('Το όνομα είναι υποχρεωτικό.');
            return;
        }

        const itemData = {
            name: name.trim(),
            active: active,
            ...(enableSortOrder && { sortOrder: Number(sortOrder) || 999 })
        };

        // Καλούμε την onSave prop που είναι η handleSaveItem από το ReferenceList.js
        // Αυτή είναι η συνάρτηση που επικοινωνεί με το Firestore.
        // Το modal ΔΕΝ καλεί απευθείας το Firestore.
        onSave(itemData);
        onClose(); // Κλείσε το modal μετά την αποθήκευση
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{isEditing ? `Επεξεργασία ${label}` : `Προσθήκη Νέου ${label}`}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Όνομα"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                {enableSortOrder && (
                    <TextField
                        margin="dense"
                        id="sortOrder"
                        label="Σειρά Ταξινόμησης"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        helperText="Αριθμός για τη σειρά εμφάνισης (μικρότερος αριθμός, πιο πάνω)"
                        sx={{ mb: 2 }}
                    />
                )}
                <FormControlLabel
                    control={
                        <Switch
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            name="active"
                            color="primary"
                        />
                    }
                    label="Ενεργό"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    ΑΚΥΡΩΣΗ
                </Button>
                <Button onClick={handleSave} color="primary">
                    ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ
                </Button>
            </DialogActions>
        </Dialog>
    );
}