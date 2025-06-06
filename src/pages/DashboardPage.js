// src/pages/DashboardPage.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import Navbar from "../components/Navigation/Navbar";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ModuleCard from "../components/Modules/ModuleCard";

// Asumo que tus SVGs están configurados para ser importados como ReactComponent
// Verifica las rutas y si el sufijo 'a' en 'tuerquita-llenaa' es correcto.
import { ReactComponent as TuerquitaCurrencyIcon } from '../assets/icons/tuerquita-llenaa.svg'; // Para la moneda "tuerquitas"
import { ReactComponent as VidaIcon } from '../assets/icons/tuerquita-llena.svg'; // Para las vidas

const DashboardPage = () => {
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [modulesWithStatus, setModulesWithStatus] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [errorModules, setErrorModules] = useState(null);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      // console.log("DashboardPage Effect: No currentUser after loading, redirecting to /login");
      navigate('/login', { replace: true });
    }
  }, [currentUser, userLoading, navigate]);

  useEffect(() => {
    if (currentUser) {
      const fetchModulesAndProgress = async () => {
        setLoadingModules(true);
        setErrorModules(null);
        try {
          const modulesRef = collection(db, 'modules');
          const qModules = query(modulesRef, orderBy('order', 'asc'));
          const modulesSnapshot = await getDocs(qModules);
          const allModules = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const completedModulesRef = collection(db, `users/${currentUser.uid}/completedModules`);
          const completedModulesSnapshot = await getDocs(completedModulesRef);
          const userCompletedModuleIds = new Set(completedModulesSnapshot.docs.map(doc => doc.id));

          // console.log("Todos los módulos de Firestore:", JSON.stringify(allModules, null, 2));
          // console.log("IDs de Módulos Completados por el Usuario:", Array.from(userCompletedModuleIds));

          const processedModules = allModules.map(module => {
            let isUnlocked = false;
            if (module.order === 1) {
              isUnlocked = true;
            } else {
              const previousModule = allModules.find(m => m.order === module.order - 1);
              if (previousModule && userCompletedModuleIds.has(previousModule.id)) {
                isUnlocked = true;
              }
            }
            // Aquí también podrías calcular el progreso para pasarlo a ModuleCard
            // Ejemplo:
            // const progressData = currentUser.moduleProgress?.[module.id] || { completedLessons: 0, totalLessons: module.totalLessons || 1 };
            // const progressPercentage = module.totalLessons ? (progressData.completedLessons / module.totalLessons) * 100 : 0;

            return {
                ...module,
                isUnlocked,
                // progressPercentage: isUnlocked ? progressPercentage : 0, // Solo muestra progreso si está desbloqueado
                // lessonsCompleted: progressData.completedLessons,
                // totalLessons: module.totalLessons
            };
          });

          setModulesWithStatus(processedModules);

        } catch (error) {
          console.error('Error al obtener los módulos o el progreso del usuario', error);
          setErrorModules('No se pudieron cargar los módulos.');
        } finally {
          setLoadingModules(false);
        }
      };
      fetchModulesAndProgress();
    } else {
      setLoadingModules(false);
      setModulesWithStatus([]);
    }
  }, [currentUser]);

  if (userLoading || (currentUser && loadingModules && modulesWithStatus.length === 0)) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]"> {/* Ajusta altura si navbar es más alta */}
          {/* Aquí podrías poner un spinner más elaborado */}
          <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary text-lg">Cargando tu espacio FixGo...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && !userLoading) { // Redirección ya manejada por useEffect, pero un fallback
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <p className="text-text-secondary">Redirigiendo...</p>
        </div>
      </div>
    );
  }
  
  if (errorModules) {
    return (
      <div className="min-h-screen bg-neutral-light">
       <Navbar />
       <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6">
         <div className="bg-red-100 border-l-4 border-accent-red text-accent-red p-4 rounded-md shadow-md" role="alert">
           <strong className="font-bold">¡Ups! Algo salió mal.</strong>
           <span className="block sm:inline ml-1">{errorModules} Intenta recargar la página.</span>
         </div>
       </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {currentUser && (
          <div className="bg-neutral-white p-6 md:p-8 rounded-2xl shadow-xl border border-neutral-medium mt-6 mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-2">
              ¡Bienvenido a FixGo!
            </h1>
            <p className="text-lg text-text-primary mb-6">
              Hola, <span className="font-semibold text-accent-orange">{currentUser.displayName || currentUser.email}</span>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 p-4 bg-neutral-light rounded-xl border border-neutral-medium">
              <div className="flex items-center">
                <VidaIcon className="h-7 w-7 mr-2 fill-accent-red" />
                <span className="text-2xl font-bold text-accent-red">{currentUser?.lives ?? '0'}</span>
                <span className="ml-1.5 text-sm text-text-secondary self-end leading-none pb-0.5">Vidas</span>
              </div>
              <div className="flex items-center">
                <TuerquitaCurrencyIcon className="h-7 w-7 mr-2 fill-accent-orange" /> {/* Verifica el nombre de este ícono */}
                <span className="text-2xl font-bold text-accent-orange">{currentUser?.tuerquitas ?? '0'}</span>
                <span className="ml-1.5 text-sm text-text-secondary self-end leading-none pb-0.5">Tuerquitas</span>
              </div>
              {/* Podrías añadir XP aquí también si lo deseas */}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-6">Módulos de Aprendizaje</h2>
          {modulesWithStatus.length === 0 && !loadingModules && (
             <div className="py-10 text-center bg-neutral-white border-2 border-dashed border-neutral-medium rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-neutral-medium mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5-13.5h16.5M3.75 6h16.5M3.75 18h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
                <p className="text-text-secondary text-xl font-medium">No hay módulos disponibles.</p>
                <p className="text-sm text-text-secondary mt-1">Vuelve más tarde o contacta al administrador.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {modulesWithStatus.map(module => (
              <ModuleCard
                key={module.id}
                module={module} // module ya contiene isUnlocked y los datos de progreso si los implementaste
              />
            ))}
          </div>
        </div>

        {/* Placeholder para progreso general */}
        <div className="mt-10 md:mt-12 p-6 md:p-8 bg-neutral-white rounded-2xl shadow-xl border border-neutral-medium">
            <h2 className="text-2xl font-semibold text-brand-blue mb-3">Tu Progreso General</h2>
            <div className="space-y-2">
                <p className="text-text-secondary">Aquí se mostrará un resumen de tu avance y logros en FixGo.</p>
                {/* Ejemplo: <p className="text-text-primary"><strong className="font-medium">Nivel de Experiencia:</strong> {currentUser?.xpLevel || 1}</p> */}
                <p className="text-text-primary"><strong className="font-medium text-text-secondary">Puntos XP Totales:</strong> <span className="font-bold text-accent-orange">{currentUser?.xp || 0}</span></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;