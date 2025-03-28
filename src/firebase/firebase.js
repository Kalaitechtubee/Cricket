// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyB2ymhJdNavxrHFvUBsrBOnxUpkgPZ_-cg",
//     authDomain: "my-project-931a4.firebaseapp.com",
//     databaseURL: "https://my-project-931a4-default-rtdb.firebaseio.com",
//     projectId: "my-project-931a4",
//     storageBucket: "my-project-931a4.firebasestorage.app",
//     messagingSenderId: "917431750580",
//     appId: "1:917431750580:web:74e58107ee38ef3d4bece1",
//     measurementId: "G-MJQHF2Z4GZ",
//   };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// console.log("Firebase initialized successfully"); // Debugging
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB2ymhJdNavxrHFvUBsrBOnxUpkgPZ_-cg",
    authDomain: "my-project-931a4.firebaseapp.com",
    databaseURL: "https://my-project-931a4-default-rtdb.firebaseio.com",
    projectId: "my-project-931a4",
    storageBucket: "my-project-931a4.firebasestorage.app",
    messagingSenderId: "917431750580",
    appId: "1:917431750580:web:74e58107ee38ef3d4bece1",
    measurementId: "G-MJQHF2Z4GZ",
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log("Firebase initialized successfully");