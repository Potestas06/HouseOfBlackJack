// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3IiGtplFr6kJW2PGM2dIbqNejCLQ1N-E",
  authDomain: "houseofblackjack.firebaseapp.com",
  projectId: "houseofblackjack",
  storageBucket: "houseofblackjack.firebasestorage.app",
  messagingSenderId: "708299657346",
  appId: "1:708299657346:web:7deab9f820344b9442e49b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
