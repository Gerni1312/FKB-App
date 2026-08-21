import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP7sGKxbbCESn6tfvmcxTf4ZqGJ20AB8M",
  authDomain: "fkb-app.firebaseapp.com",
  projectId: "fkb-app",
  storageBucket: "fkb-app.firebasestorage.app",
  messagingSenderId: "140623758153",
  appId: "1:140623758153:web:9ee53f7f57a2649da71098",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
