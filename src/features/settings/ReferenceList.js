// src/features/settings/ReferenceList.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Alert,
    Button,
    Switch,
    FormControlLabel,
    // ❌ ΑΦΑΙΡΟΥΜΕ ΤΟ SNACKBAR ΑΠΟ ΤΑ IMPORTS
    // Snackbar,
    TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '../../services/firestore';
import ReferenceItemEditModal from './ReferenceItemEditModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ✅ ΝΕΟ IMPORT: Εισάγουμε την υπηρεσία ειδοποιήσεων
import { useNotifier } from '../../context/NotificationContext';

// ... (Το περιεχόμενο των ReorderableListItem και StaticListItem παραμένει ΙΔΙΟ)
const ReorderableListItem = React.memo(({ item, index, enableActive, handleEditItem, handleDeleteItem, handleToggleActive }) => (
    <Draggable draggableId={item.id} index={index}>
        {(provided) => (
            <ListItem
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {enableActive && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={item.active}
                                        onChange={() => handleToggleActive(item.id, item.active)}
                                        color="primary"
                                    />
                                }
                                label="Ενεργό"
                                labelPlacement="start"
                                sx={{ mr: 1 }}
                            />
                        )}
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                }
                sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <ListItemText
                    primary={item.name}
                    secondary={`Σειρά: ${item.sortOrder || 'Μη ορισμένη'}`}
                    sx={{
                        textDecoration: item.active ? 'none' : 'line-through',
                        color: item.active ? 'inherit' : 'text.disabled',
                    }}
                />
            </ListItem>
        )}
    </Draggable>
));

const StaticListItem = React.memo(({ item, enableActive, handleEditItem, handleDeleteItem, handleToggleActive }) => (
    <ListItem
        secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {enableActive && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={item.active}
                                onChange={() => handleToggleActive(item.id, item.active)}
                                color="primary"
                            />
                        }
                        label="Ενεργό"
                        labelPlacement="start"
                        sx={{ mr: 1 }}
                    />
                )}
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item)}>
                    <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        }
        sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            mb: 1,
            bgcolor: 'background.paper',
            '&:hover': {
                bgcolor: 'action.hover',
            },
        }}
    >
        <ListItemText
            primary={item.name}
            sx={{
                textDecoration: item.active ? 'none' : 'line-through',
                color: item.active ? 'inherit' : 'text.disabled',
            }}
        />
    </ListItem>
));


export default function ReferenceList({ path, label, enableActive, enableSortOrder }) {
    // ✅ ΝΕΑ ΓΡΑΜΜΗ: Παίρνουμε τη συνάρτηση showNotification
    const { showNotification } = useNotifier();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // ❌ ΑΦΑΙΡΟΥΜΕ ΤΟ STATE ΓΙΑ ΤΟ SNACKBAR
    // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [originalItemsOrder, setOriginalItemsOrder] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const collectionRef = collection(db, path);
            const countSnapshot = await getCountFromServer(collectionRef);
            setTotalCount(countSnapshot.data().count);

            let baseQuery = query(collectionRef);
            if (enableSortOrder) {
                baseQuery = query(collectionRef, orderBy('sortOrder', 'asc'), orderBy('name', 'asc'));
            } else {
                baseQuery = query(collectionRef, orderBy('name', 'asc'));
            }

            const querySnapshot = await getDocs(baseQuery);
            const allDocs = querySnapshot.docs;
            const startIndex = page * rowsPerPage;
            
            if (allDocs.length > 0 && startIndex >= allDocs.length && page > 0) {
                 setPage(prevPage => prevPage - 1);
                 return;
            }

            const currentDocs = allDocs.slice(startIndex, startIndex + rowsPerPage);
            const fetchedItems = currentDocs.map(doc => ({ id: doc.id, ...doc.data() }));

            setItems(fetchedItems);
            setOriginalItemsOrder(fetchedItems.map(item => ({ id: item.id, sortOrder: item.sortOrder })));

        } catch (err) {
            const errorMsg = `Αδυναμία φόρτωσης λίστας. ${err.message}`;
            setError(errorMsg);
            // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
            showNotification(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }, [path, enableSortOrder, page, rowsPerPage, showNotification]); // ✅ ΠΡΟΣΘΗΚΗ showNotification

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleAddItem = () => {
        setCurrentItem(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        if (!item || !item.id) {
            showNotification('Σφάλμα: Δεν βρέθηκε αναγνωριστικό για επεξεργασία.', 'error');
            return;
        }
        setCurrentItem(item);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (itemData) => {
        try {
            if (isEditing) {
                if (!currentItem || !currentItem.id) {
                    showNotification('Σφάλμα: Δεν βρέθηκε αναγνωριστικό για ενημέρωση.', 'error');
                    return;
                }
                const itemRef = doc(db, path, currentItem.id);
                await updateDoc(itemRef, {
                    name: itemData.name,
                    active: itemData.active,
                    ...(enableSortOrder && { sortOrder: itemData.sortOrder })
                });
                // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
                showNotification('Επιτυχής ενημέρωση στοιχείου!', 'success');
            } else {
                await addDoc(collection(db, path), {
                    name: itemData.name,
                    active: itemData.active,
                    ...(enableSortOrder && { sortOrder: itemData.sortOrder || 999 })
                });
                // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
                showNotification('Επιτυχής προσθήκη στοιχείου!', 'success');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
            showNotification(`Σφάλμα αποθήκευσης: ${error.message}`, 'error');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!id) {
            showNotification('Σφάλμα: Δεν βρέθηκε αναγνωριστικό για διαγραφή.', 'error');
            return;
        }
        if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το στοιχείο;`)) {
            try {
                await deleteDoc(doc(db, path, id));
                // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
                showNotification('Επιτυχής διαγραφή στοιχείου!', 'success');
                fetchItems();
            } catch (error) {
                // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
                showNotification(`Σφάλμα διαγραφής: ${error.message}`, 'error');
            }
        }
    };

    const handleToggleActive = async (id, currentActiveStatus) => {
        if (!id) {
            showNotification('Σφάλμα: Δεν βρέθηκε αναγνωριστικό για αλλαγή κατάστασης.', 'error');
            return;
        }
        try {
            const itemRef = doc(db, path, id);
            await updateDoc(itemRef, { active: !currentActiveStatus });
            // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
            showNotification('Επιτυχής αλλαγή κατάστασης!', 'success');
            fetchItems();
        } catch (error) {
            // ✅ ΧΡΗΣΗ ΤΟΥ ΝΕΟΥ ΣΥΣΤΗΜΑΤΟΣ
            showNotification(`Σφάλμα αλλαγής κατάστασης: ${error.message}`, 'error');
        }
    };
    
    // ... (Οι συναρτήσεις onDragEnd, handleSaveOrder, handleCancelOrderChange, handleChangePage, handleChangeRowsPerPage παραμένουν ΙΔΙΕΣ,
    // αλλά οι ειδοποιήσεις μέσα τους αλλάζουν)
    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.index === destination.index) {
            return;
        }

        const reorderedItems = Array.from(items);
        const [movedItem] = reorderedItems.splice(source.index, 1);
        reorderedItems.splice(destination.index, 0, movedItem);
        
        const updatedItemsForSave = reorderedItems.map((item, idx) => ({
            ...item,
            sortOrder: (page * rowsPerPage) + idx + 1
        }));
        setItems(updatedItemsForSave);
    };

    const handleSaveOrder = async () => {
        try {
            const batch = [];
            for (const item of items) {
                if (!item || !item.id) {
                    showNotification(`Σφάλμα: Βρέθηκε στοιχείο χωρίς ID κατά την αποθήκευση.`, 'error');
                    continue;
                }

                const originalItem = originalItemsOrder.find(o => o.id === item.id);
                if (originalItem && originalItem.sortOrder !== item.sortOrder) {
                    const itemRef = doc(db, path, item.id);
                    batch.push(updateDoc(itemRef, { sortOrder: item.sortOrder }));
                }
            }
            if (batch.length > 0) {
                await Promise.all(batch);
                showNotification('Η σειρά αποθηκεύτηκε επιτυχώς!', 'success');
                fetchItems();
            } else {
                showNotification('Δεν υπήρξαν αλλαγές στη σειρά για αποθήκευση.', 'info');
            }
        } catch (error) {
            showNotification(`Σφάλμα αποθήκευσης σειράς: ${error.message}`, 'error');
        }
    };

    const handleCancelOrderChange = () => {
        setItems(originalItemsOrder.map(original => {
            const current = items.find(item => item.id === original.id);
            return current ? { ...current, sortOrder: original.sortOrder } : original;
        }));
        showNotification('Οι αλλαγές σειράς ακυρώθηκαν.', 'info');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper elevation={0} sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            minHeight: '200px',
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    {label}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                >
                    Προσθήκη Νέου
                </Button>
            </Box>

            {enableSortOrder && (
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveOrder}
                        disabled={JSON.stringify(items.map(i => ({ id: i.id, sortOrder: i.sortOrder }))) === JSON.stringify(originalItemsOrder)}
                    >
                        Αποθήκευση Σειράς
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelOrderChange}
                        disabled={JSON.stringify(items.map(i => ({ id: i.id, sortOrder: i.sortOrder }))) === JSON.stringify(originalItemsOrder)}
                    >
                        Ακύρωση
                    </Button>
                </Box>
            )}

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {!loading && !error && items.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>Δεν βρέθηκαν στοιχεία για "{label}".</Alert>}

            {!loading && !error && items.length > 0 && (
                <>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="items">
                            {(provided) => (
                                <List {...provided.droppableProps} ref={provided.innerRef}>
                                    {items.map((item, index) =>
                                        enableSortOrder ? (
                                            <ReorderableListItem
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                enableActive={enableActive}
                                                handleEditItem={handleEditItem}
                                                handleDeleteItem={handleDeleteItem}
                                                handleToggleActive={handleToggleActive}
                                            />
                                        ) : (
                                            <StaticListItem
                                                key={item.id}
                                                item={item}
                                                enableActive={enableActive}
                                                handleEditItem={handleEditItem}
                                                handleDeleteItem={handleDeleteItem}
                                                handleToggleActive={handleToggleActive}
                                            />
                                        )
                                    )}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Στοιχεία ανά σελίδα:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} από ${count}`}
                    />
                </>
            )}

            <ReferenceItemEditModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                item={currentItem}
                isEditing={isEditing}
                label={label}
                enableSortOrder={enableSortOrder}
            />

            {/* ❌ ΤΟ SNACKBAR ΑΦΑΙΡΕΙΤΑΙ ΑΠΟ ΕΔΩ */}
            
        </Paper>
    );
}