import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    projectId: "feedportal-2026",
    appId: "1:435997442968:web:2667c5b2eeac85d65ee1ed",
    storageBucket: "feedportal-2026.firebasestorage.app",
    apiKey: "AIzaSyDJ1-1P3CrbPbVucsehkGe_Fi92fO-WSMk",
    authDomain: "feedportal-2026.firebaseapp.com",
    messagingSenderId: "435997442968",
    measurementId: "G-ZVVLTX4K1P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
