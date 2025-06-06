// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBICkqs7BuUzQb0CAGMcRcTVGDmN_QDb8k",
    authDomain: "fixgo-301b6.firebaseapp.com",
    databaseURL: "https://fixgo-301b6-default-rtdb.firebaseio.com",
    projectId: "fixgo-301b6",
    storageBucket: "fixgo-301b6.firebasestorage.app",
    messagingSenderId: "953256585321",
    appId: "1:953256585321:web:502dd37f26ea5ed0471af8",
    measurementId: "G-G18SNZW8B4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db,  };