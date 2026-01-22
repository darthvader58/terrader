import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF",
};

let app;
let db;
let auth;
let googleProvider;

// Initialize Firebase
if (typeof window !== 'undefined') {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
        db = getFirestore(app);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Helper function to get db instance
export const getDb = () => {
    if (!db && typeof window !== 'undefined') {
        try {
            app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
            db = getFirestore(app);
        } catch (error) {
            console.error("Error getting Firestore instance:", error);
        }
    }
    return db;
};

export { auth, googleProvider, db };
export default db;
