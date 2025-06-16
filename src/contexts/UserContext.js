// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setLoading(true);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const processedData = { ...userData };
        Object.keys(processedData).forEach((key) => {
          if (processedData[key] instanceof Timestamp) {
            processedData[key] = processedData[key].toDate();
          }
        });
        setCurrentUser({ ...processedData, uid: user.uid });
      } else {
        console.warn(`⚠️ El usuario autenticado (${user.uid}) no tiene documento en Firestore`);
        setCurrentUser(null); // Para forzar login o registro
      }
    } else {
      setCurrentUser(null);
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, []);


  // Pasamos el setCurrentUser original
  return (
    <UserContext.Provider value={{ currentUser, loading, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};