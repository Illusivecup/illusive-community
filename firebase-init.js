// firebase-init.js
console.log('🚀 Initializing Firebase...');

// Firebase configuration from GitHub Secrets
const firebaseConfig = {
    apiKey: "AIzaSyBB-RKr4-IIvwjyadlLJaCXKMPTAO_Qm_s",
    authDomain: "illusive-community-1.firebaseapp.com",
    databaseURL: "https://illusive-community-1-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "illusive-community-1",
    storageBucket: "illusive-community-1.firebasestorage.app",
    messagingSenderId: "434295608985",
    appId: "1:434295608985:web:1c76e46ef785e5d5528a08"
};

// Initialize Firebase immediately when this script loads
try {
    if (typeof firebase !== 'undefined') {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            console.log('ℹ️ Firebase already initialized');
        }
        
        // Make Firebase available globally
        window.firebaseApp = firebase.app();
        window.firebaseConfig = firebaseConfig;
        console.log('🔥 Firebase is ready');
    } else {
        console.error('❌ Firebase SDK not loaded');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}
