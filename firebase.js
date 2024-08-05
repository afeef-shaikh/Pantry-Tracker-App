// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAe9SqCayiIvGcp-v6IMQEd8IZQNrxgbI",
  authDomain: "inventory-management-e400d.firebaseapp.com",
  projectId: "inventory-management-e400d",
  storageBucket: "inventory-management-e400d.appspot.com",
  messagingSenderId: "440352866497",
  appId: "1:440352866497:web:c512c7f7956044d40bd440",
  measurementId: "G-J1MLB1PCME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};