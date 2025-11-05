// Auto-generated Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue, off, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBB-RKr4-IIvwjyadlLJaCXKMPTAO_Qm_s",
  authDomain: "illusive-community-1.firebaseapp.com",
  databaseURL: "https://illusive-community-1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "illusive-community-1",
  storageBucket: "illusive-community-1.firebasestorage.app",
  messagingSenderId: "434295608985",
  appId: "1:434295608985:web:1c76e46ef785e5d5528a08"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

window.firebase = {
  auth, database, storage, ref, set, get, update, push, onValue, off, remove,
  storageRef, uploadBytes, getDownloadURL, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};

console.log('Firebase initialized');
