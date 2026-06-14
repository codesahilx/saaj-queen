import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            "AIzaSyDHT0YpF2NdgZWb43SvPbGyxtnGlaKJGL8",
  authDomain:        "saaj-queen.firebaseapp.com",
  projectId:         "saaj-queen",
  storageBucket:     "saaj-queen.firebasestorage.app",
  messagingSenderId: "762853287511",
  appId:             "1:762853287511:web:5af2f8e94a718e8057e512",
  measurementId:     "G-4YLXWP64DJ",
};

const app = initializeApp(firebaseConfig);

export const auth           = getAuth(app);
export const db             = getFirestore(app);
export const storage        = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics      = getAnalytics(app);

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ADMIN_WHATSAPP = '919082541454';
export const ADMIN_EMAIL    = 'saajqueen454@gmail.com';
