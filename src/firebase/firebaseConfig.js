import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDKEfiFpIoDovgHAmfx21TaWgilbMK8eh4",
  authDomain: "prohome-af6b4.firebaseapp.com",
  projectId: "prohome-af6b4",
  storageBucket: "prohome-af6b4.firebasestorage.app",
  messagingSenderId: "442215237822",
  appId: "1:442215237822:web:2650891ee340955cd736ef",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
