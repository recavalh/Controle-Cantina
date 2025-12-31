// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzptBKBR3K9btC0cVJSId4xK6mQm_q0A8",
    authDomain: "app-cantina-escolas.firebaseapp.com",
    projectId: "app-cantina-escolas",
    storageBucket: "app-cantina-escolas.firebasestorage.app",
    messagingSenderId: "765440696608",
    appId: "1:765440696608:web:2a2404221377516f68b745"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
