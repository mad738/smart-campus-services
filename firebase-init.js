import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc, query, where, onSnapshot, deleteDoc, orderBy, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyoWJfSq7ppubeiNj3cIpvtERMmtsoDn4",
  authDomain: "smart-campus-services-f1857.firebaseapp.com",
  projectId: "smart-campus-services-f1857",
  storageBucket: "smart-campus-services-f1857.firebasestorage.app",
  messagingSenderId: "741457806645",
  appId: "1:741457806645:web:26a0e7259061d21fb8387c",
  measurementId: "G-FDV3XXJJDJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, doc, getDoc, setDoc, collection, addDoc, updateDoc, query, where, onSnapshot, deleteDoc, orderBy, serverTimestamp, limit };
