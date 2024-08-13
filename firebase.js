// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuY_507RTawuYbx4v3-Th3TR3wNs3WlvE",
  authDomain: "hspantryapp-b847e.firebaseapp.com",
  projectId: "hspantryapp-b847e",
  storageBucket: "hspantryapp-b847e.appspot.com",
  messagingSenderId: "236564160623",
  appId: "1:236564160623:web:b5be74c4d203da06e6ad9a",
  measurementId: "G-C7RQ73BW0B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export {app, firebaseConfig}