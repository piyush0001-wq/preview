// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDs3cpTFaG7BDQJjfee0i4-pH08-9kQ9lY",
//   authDomain: "preview-b39c4.firebaseapp.com",
//   projectId: "preview-b39c4",
//   storageBucket: "preview-b39c4.firebasestorage.app",
//   messagingSenderId: "668361118194",
//   appId: "1:668361118194:web:3f9e2812faf18db697db6b",
//   measurementId: "G-G8NK7M7B72"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
apiKey: "AIzaSyCmxzJjeOWcC9qOyhmvem-HeLwOahYXOMI",
  authDomain: "photogallery-8af5b.firebaseapp.com",
  projectId: "photogallery-8af5b",
  storageBucket: "photogallery-8af5b.appspot.com",
  messagingSenderId: "663744057824",
  appId: "1:663744057824:web:6b28e2419a9d5b7479db85"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
