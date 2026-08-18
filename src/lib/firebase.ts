import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  memoryLocalCache,
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with memory cache to avoid "Database is closing/hidden" IndexedDB errors in iframes/tabs
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  }, databaseId);
} catch {
  // If already initialized, retrieve existing Firestore instance
  db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

// Initialize Firebase Auth
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
export type { User };
