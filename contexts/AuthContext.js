import { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider } from '@/db';
import db from '@/db';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                
                if (userDoc.exists()) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...userDoc.data()
                    });
                } else {
                    const newUserData = {
                        email: firebaseUser.email,
                        username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        photoURL: firebaseUser.photoURL || '/assets/avatar.svg',
                        level: 1,
                        carbonCredits: 100,
                        carbonScore: 0,
                        highestRank: null,
                        totalGames: 0,
                        wins: 0,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                    };
                    
                    await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
                    
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...newUserData
                    });
                }
                
                await updateDoc(doc(db, 'users', firebaseUser.uid), {
                    lastLogin: serverTimestamp()
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    };

    const signUpWithEmail = async (email, password, username) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            
            const userData = {
                email,
                username,
                photoURL: '/assets/avatar.svg',
                level: 1,
                carbonCredits: 100,
                carbonScore: 0,
                highestRank: null,
                totalGames: 0,
                wins: 0,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };
            
            await setDoc(doc(db, 'users', result.user.uid), userData);
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Sign-up error:', error);
            return { success: false, error: error.message };
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Sign-in error:', error);
            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/');
            return { success: true };
        } catch (error) {
            console.error('Sign-out error:', error);
            return { success: false, error: error.message };
        }
    };

    const updateUserProfile = async (updates) => {
        if (!user) return { success: false, error: 'No user logged in' };
        
        try {
            await updateDoc(doc(db, 'users', user.uid), updates);
            setUser(prev => ({ ...prev, ...updates }));
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
