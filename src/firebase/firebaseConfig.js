import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDKEfiFpIoDovgHAmfx21TaWgilbMK8eh4",
  authDomain: "prohome-af6b4.firebaseapp.com",
  projectId: "prohome-af6b4",
  storageBucket: "prohome-af6b4.firebasestorage.app",
  messagingSenderId: "442215237822",
  appId: "1:442215237822:web:2650891ee340955cd736ef",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging qo'llab-quvvatlanmadi:", error);
    return null;
  }
}
