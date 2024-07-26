import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, auth } from 'firebase/auth';
import { getStorage, storage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDXddyPkrFf0tOas9ZbPEyJyp3Q-rtRD30",
  authDomain: "nist-atndn.firebaseapp.com",
  databaseURL: "https://nist-atndn-default-rtdb.firebaseio.com",
  projectId: "nist-atndn",
  storageBucket: "nist-atndn.appspot.com",
  messagingSenderId: "684263793837",
  appId: "1:684263793837:web:98b7b2775742c7046b26c",
};
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);


export { db, auth, storage,collection, addDoc};