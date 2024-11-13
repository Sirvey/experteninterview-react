import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-9YX7N3SS9nVfrMLgSZRCTWSwIbebVgE",
  authDomain: "bachelorabeit-interviews.firebaseapp.com",
  projectId: "bachelorabeit-interviews",
  storageBucket: "bachelorabeit-interviews.firebasestorage.app",
  messagingSenderId: "724106285565",
  appId: "1:724106285565:web:96692d593c8952b8f04994",
  measurementId: "G-JZ2M7HHRJW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);