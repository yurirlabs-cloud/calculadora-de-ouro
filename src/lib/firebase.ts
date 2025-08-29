'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "calculadora-de-ouro",
  "appId": "1:635279012019:web:583fae55f43bff2ea400c6",
  "storageBucket": "calculadora-de-ouro.firebasestorage.app",
  "apiKey": "AIzaSyBDa-9_NxWr5Mhv8w4iiR_JpNK1XDuvyCo",
  "authDomain": "calculadora-de-ouro.firebaseapp.com",
  "messagingSenderId": "635279012019",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
