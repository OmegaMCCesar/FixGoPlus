// src/pages/DashboardPage.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import Navbar from "../components/Navigation/Navbar";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ModuleCard from "../components/Modules/ModuleCard";
import { ReactComponent as TuerquitaIcon } from '../assets/icons/tuerquita-llenaa.svg';
import { ReactComponent as VidaIcon } from '../assets/icons/tuerquita-llena.svg';

const DashboardPage = () => {
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [modulesWithStatus, setModulesWithStatus] = useState([]);
  const [, setLoadingModules] = useState(true);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, userLoading, navigate]);

  useEffect(() => {
    if (currentUser) {
      const fetchModulesAndProgress = async () => {
        try {
          const modulesRef = collection(db, 'modules');
          const qModules = query(modulesRef, orderBy('order', 'asc'));
          const modulesSnapshot = await getDocs(qModules);
          const allModules = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const completedModulesRef = collection(db, `users/${currentUser.uid}/completedModules`);
          const completedModulesSnapshot = await getDocs(completedModulesRef);
          const userCompletedModuleIds = new Set(completedModulesSnapshot.docs.map(doc => doc.id));

          const levelsAll = currentUser.levels || [];

          const processedModules = allModules.map(module => {
            const levels = levelsAll.filter(l => l.moduleId === module.id);
            const isAdiamantado = userCompletedModuleIds.has(module.id);

            let isUnlocked = module.order === 1;
            if (!isUnlocked) {
              const prev = allModules.find(m => m.order === module.order - 1);
              isUnlocked = prev && userCompletedModuleIds.has(prev.id);
            }

            return { ...module, isUnlocked, isAdiamantado };
          });

          setModulesWithStatus(processedModules);
        } catch (error) {
          console.error("Error cargando módulos:", error);
        } finally {
          setLoadingModules(false);
        }
      };

      fetchModulesAndProgress();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />

      {currentUser && (
        <div className="bg-white shadow-md rounded-xl mx-4 mt-6 mb-4 p-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-left mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-brand-blue">¡Hola, {currentUser.displayName || 'Técnico'}!</h1>
            <p className="text-text-secondary text-sm">Bienvenido de nuevo a tu panel de aprendizaje.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-brand-blue font-semibold">
              <TuerquitaIcon className="w-6 h-6" /> <span>{currentUser.tuerquitas ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-accent-red font-semibold">
              <VidaIcon className="w-6 h-6" /> <span>{currentUser.lives ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-6">Módulos de Aprendizaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {modulesWithStatus.map(module => {
            const base = "relative rounded-2xl transition-all duration-300 overflow-hidden p-4 bg-white";
            const locked = "border border-neutral-medium opacity-60 cursor-not-allowed";
            const unlocked = "border border-brand-blue hover:shadow-xl hover:-translate-y-1";
            const adiamantado = `
              border-2 border-transparent
              bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400
              bg-[length:200%_200%]
              animate-[shine_4s_linear_infinite]
            `;

            const finalClass = `${base} ${
              module.isAdiamantado ? adiamantado :
              module.isUnlocked ? unlocked :
              locked
            }`;

            return (
              <div key={module.id} className={finalClass}>
                <ModuleCard module={module} />
                {module.isAdiamantado && (
                  <div className="absolute top-2 right-2 text-cyan-400 text-xs font-semibold bg-white px-2 py-1 rounded-full shadow">
                    Adiamantado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
