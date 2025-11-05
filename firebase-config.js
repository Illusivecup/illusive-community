// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue, off, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKIKi5m97FCotoA3-Y26JV-xu78gfh39E",
  authDomain: "illusive-community2.firebaseapp.com",
  databaseURL: "https://illusive-community2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "illusive-community2",
  storageBucket: "illusive-community2.firebasestorage.app",
  messagingSenderId: "650397668165",
  appId: "1:650397668165:web:5304cb4f65067c613fa42c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Экспортируем для использования в других файлах
window.firebase = {
    auth,
    database,
    storage,
    ref,
    set,
    get,
    update,
    push,
    onValue,
    off,
    remove,
    storageRef,
    uploadBytes,
    getDownloadURL,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};

console.log('🔥 Firebase успешно инициализирован');