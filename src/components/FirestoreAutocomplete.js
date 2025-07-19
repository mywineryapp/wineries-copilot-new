import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firestore';
import { useNotifier } from '../context/NotificationContext';

export default function FirestoreAutocomplete({
    collectionName,
    label,
    value,
    onChange,
    disabled = false,
    filterQuery,
    newDocExtraData = {},
    orderByField = 'name',
    allowCreate = false,
}) {
    const { showNotification } = useNotifier();
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!collectionName || disabled) {
                setOptions([]);
                return;
            }
            setLoading(true);
            try {
                let q;
                if (filterQuery && filterQuery[2]) {
                    q = query(collection(db, collectionName), where(...filterQuery), orderBy(orderByField, 'asc'));
                } else {
                    q = query(collection(db, collectionName), orderBy(orderByField, 'asc'));
                }
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOptions(items);
            } catch (err) {
                console.error(`Error fetching ${collectionName}:`, err);
                if (err.code === 'failed-precondition') {
                     showNotification(`Χρειάζεται να δημιουργηθεί ευρετήριο στο Firebase για την ταξινόμηση ${label}.`, 'error');
                } else {
                     showNotification(`Σφάλμα φόρτωσης για "${label}": ${err.message}`, 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [collectionName, JSON.stringify(filterQuery), disabled, label, orderByField, showNotification]);

    const handleChange = async (event, newValue) => {
        if (allowCreate && typeof newValue === 'string' && newValue.trim() !== '') {
            setLoading(true);
            try {
                const docData = { name: newValue.trim(), ...newDocExtraData, createdAt: serverTimestamp() };
                if (orderByField === 'sortOrder') docData.sortOrder = 999;
                
                const docRef = await addDoc(collection(db, collectionName), docData);
                const newOption = { id: docRef.id, name: newValue.trim() };
                setOptions(prev => [...prev].sort((a,b) => a.name.localeCompare(b.name)));
                onChange(newOption.id, newOption);
                showNotification(`Η επιλογή "${newValue}" προστέθηκε!`, 'success');
            } catch (err) {
                showNotification(`Αποτυχία προσθήκης: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        } else {
            onChange(newValue ? newValue.id : null, newValue);
        }
    };
    
    const selectedValue = options.find(opt => opt && opt.id === value) || null;

    return (
        <Autocomplete
            value={selectedValue}
            onChange={handleChange}
            options={options}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option?.name || "";
            }}
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
            isOptionEqualToValue={(option, val) => val && option && option.id === val.id}
            loading={loading}
            disabled={disabled}
            freeSolo={allowCreate}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            noOptionsText={disabled ? "Επιλέξτε πρώτα οινοποιείο" : "Δεν βρέθηκαν επιλογές"}
        />
    );
}