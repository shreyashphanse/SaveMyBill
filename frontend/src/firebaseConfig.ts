// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnRnPMPDI55jzUQXu9wjY29Ey4RVYt_H8",
  authDomain: "savemybill-9cd2e.firebaseapp.com",
  projectId: "savemybill-9cd2e",
  storageBucket: "savemybill-9cd2e.appspot.com", // ⚠️ check this, should end with .appspot.com
  messagingSenderId: "510283637005",
  appId: "1:510283637005:web:0e96a6c82ed922fb0b1044",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
