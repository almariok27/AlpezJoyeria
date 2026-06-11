import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDBfc4YKlOEXkbi1AlbSB-1WNr0DMTHPuw",
    authDomain: "alpezjoyeria.firebaseapp.com",
    projectId: "alpezjoyeria",
    storageBucket: "alpezjoyeria.firebasestorage.app",
    messagingSenderId: "913690220524",
    appId: "1:913690220524:web:8e501c65a4657f0cb192c9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);