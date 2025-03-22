// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9trG-bolv_025Ej-UTbjNTV7Syed50OE",
  authDomain: "codetracker-6f03b.firebaseapp.com",
  projectId: "codetracker-6f03b",
  storageBucket: "codetracker-6f03b.firebasestorage.app",
  messagingSenderId: "638595239359",
  appId: "1:638595239359:web:35d26cb8a62b5ba3ca650a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export {app}