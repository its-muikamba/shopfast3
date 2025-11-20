
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------
// 1. Create a project at https://console.firebase.google.com/
// 2. Add a "Web App" to your project.
// 3. Copy the 'firebaseConfig' object and paste it below.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
// We wrap this in a try-catch because it will fail without real keys
let db: any = null;
let auth: any = null;

try {
    // Simple check to see if keys have been added
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase config pending. Application running in LocalStorage mode.");
    }
} catch (e) {
    console.error("Error initializing Firebase:", e);
}

export { db, auth };

/**
 * Subscribes to a Firestore collection and returns real-time updates.
 * This replaces localStorage 'storage' events.
 * 
 * @param collectionName The name of the collection (e.g., 'restaurants', 'orders')
 * @param callback Function to call with the new data
 * @returns Unsubscribe function
 */
export const subscribeToCollection = <T>(collectionName: string, callback: (data: T[]) => void) => {
    if (!db) return () => {}; // No-op if no DB

    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: T[] = [];
        querySnapshot.forEach((doc) => {
            items.push(doc.data() as T);
        });
        callback(items);
    });
    return unsubscribe;
};

/**
 * Saves or updates a document in Firestore.
 * This replaces localStorage.setItem()
 * 
 * @param collectionName 
 * @param id 
 * @param data 
 */
export const saveDocument = async <T>(collectionName: string, id: string, data: T) => {
    if (!db) {
        // Fallback to console log in dev mode
        // console.log(`[Mock Firebase] Saving to ${collectionName}/${id}`, data);
        return;
    }
    try {
        await setDoc(doc(db, collectionName, id), data as any);
    } catch (e) {
        console.error("Error saving document:", e);
    }
};

/**
 * Updates specific fields of a document.
 */
export const updateDocument = async (collectionName: string, id: string, data: any) => {
    if (!db) return;
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, data);
}

/**
 * Deletes a document.
 */
export const deleteDocument = async (collectionName: string, id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, collectionName, id));
}
