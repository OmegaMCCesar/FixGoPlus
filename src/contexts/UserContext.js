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

      // Mantenemos el chequeo para saltar si el estado ya está actualizado
      if (user && currentUser?.uid === user.uid) {
          if(loading) setLoading(false);
          return;
      }

      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData && Object.keys(userData).length > 0) {
              const processedData = { ...userData };
              Object.keys(processedData).forEach(key => {
                if (processedData[key] instanceof Timestamp) {
                  processedData[key] = processedData[key].toDate();
                }
              });
              setCurrentUser(processedData);
          } else {
              console.warn("UserContext: Firestore data read was empty/invalid for existing user:", user.uid, "Data:", userData);
              setCurrentUser({ uid: user.uid, email: user.email, displayName: user.displayName || '' }); // Set minimal state
          }
        } else {
          // --- ELSE BLOCK SIMPLIFICADO ---
          // Documento no existe. Durante el registro, esto es una race condition.
          // Register.js ya habrá llamado (o llamará pronto) a setDoc y setCurrentUser.
          // No hacemos NADA aquí para evitar el error y la redundancia.
          // Simplemente esperamos a que Register.js termine y actualice el estado.
          // Si esto ocurre en otro momento (ej. recarga de página), indica un problema de datos.
          console.warn(`UserContext: User document for ${user.uid} does NOT exist. Assuming Register.js will handle initial state or data is missing.`);
          // Podríamos temporalmente no hacer nada o poner null.
          // NO llamar a setCurrentUser aquí evita el error .toDate().
          // Si el usuario existe en Auth pero no en DB, algo está mal.
          // Considera poner null para forzar login si esto pasa fuera del registro.
          // setCurrentUser(null); // Opcional: podría causar un breve parpadeo si Register.js tarda. Por ahora no hacemos nada.
          // --- FIN ELSE BLOCK SIMPLIFICADO ---
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
        unsubscribe();
    }
  }, [currentUser, loading]); // Añadimos loading a dependencias por si acaso

  // Pasamos el setCurrentUser original
  return (
    <UserContext.Provider value={{ currentUser, loading, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};