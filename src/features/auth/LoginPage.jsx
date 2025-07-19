// src/features/auth/LoginPage.jsx

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack } from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firestore';
import { useNotifier } from '../../context/NotificationContext';

export default function LoginPage() {
    const { showNotification } = useNotifier();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (authAction) => {
        setLoading(true);
        try {
            await authAction(auth, email, password);
        } catch (error) {
            let friendlyMessage = `Προέκυψε σφάλμα: ${error.code}`;
            // ✅ Προσθέτουμε μια default περίπτωση για να φύγει η προειδοποίηση
            switch (error.code) {
                case 'auth/wrong-password':
                    friendlyMessage = 'Ο κωδικός που δώσατε είναι λάθος.';
                    break;
                case 'auth/user-not-found':
                    friendlyMessage = 'Δεν βρέθηκε χρήστης με αυτό το email.';
                    break;
                case 'auth/email-already-in-use':
                    friendlyMessage = 'Αυτό το email χρησιμοποιείται ήδη από άλλον χρήστη.';
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = 'Η διεύθυνση email δεν είναι έγκυρη.';
                    break;
                case 'auth/operation-not-allowed':
                    friendlyMessage = 'Η είσοδος με Email/Κωδικό δεν είναι ενεργοποιημένη στο Firebase.';
                    break;
                 case 'auth/weak-password':
                    friendlyMessage = 'Ο κωδικός είναι πολύ αδύναμος. Πρέπει να έχει τουλάχιστον 6 χαρακτήρες.';
                    break;
                default:
                    friendlyMessage = `Προέκυψε ένα άγνωστο σφάλμα: ${error.message}`;
                    break;
            }
            showNotification(friendlyMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            showNotification('Παρακαλώ συμπληρώστε το email και τον κωδικό σας.', 'warning');
            return;
        }
        handleAuth(signInWithEmailAndPassword);
    };

    const handleSignUp = () => {
        if (!email.trim() || !password.trim()) {
            showNotification('Παρακαλώ συμπληρώστε email και κωδικό για δημιουργία.', 'warning');
            return;
        }
        if (window.confirm(`Θέλετε να δημιουργήσετε νέο χρήστη με email: ${email};`)) {
            handleAuth(createUserWithEmailAndPassword);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', }} >
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <form onSubmit={handleSignIn}>
                    <Stack spacing={3}>
                        <Typography variant="h5" component="h1" textAlign="center">
                            Σύνδεση
                        </Typography>
                        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
                        <TextField label="Κωδικός" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
                        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                            {loading ? 'Σύνδεση...' : 'Είσοδος'}
                        </Button>
                        <Button variant="outlined" size="small" fullWidth disabled={loading} onClick={handleSignUp}>
                            Δημιουργία Νέου Χρήστη
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}