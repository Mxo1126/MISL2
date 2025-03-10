// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    query,
    where,
    orderBy,
    getDocs,
    Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHp475iwXcfvoY_fCNi7UdCTnJhFdsCn0",
    authDomain: "misl-website-45fd4.firebaseapp.com",
    projectId: "misl-website-45fd4",
    storageBucket: "misl-website-45fd4.appspot.com",
    messagingSenderId: "873219625145",
    appId: "1:873219625145:web:aadc18cde409a29a0fcb68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
};
