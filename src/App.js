// src/App.js
import './index.css';
import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Importa Outlet
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { UserContext } from './contexts/UserContext';
import DashboardPage from './pages/DashboardPage';
import LevelsPage from './pages/LevelsPage';
import LessonPage from './components/Lesson/LessonPage';
import UserProfilePage from './profile/UserProfilePage';
import StorePage from './Store/StorePage';
import CancelPage from './pages/cancel';
// Importa los componentes de Admin
//solo apara añadir algo mas 

import AdminDashboard from './components/Admin/AdminDashboard';
import LessonContentEditor from './components/Admin/LessonContentEditor';
import { Toaster } from 'react-hot-toast';
import LevelDetailPage from './pages/LevelDetailPage';
import ModulesAdminPage from './components/Admin/ModulesAdminPage';
import LevelsAdminPage from './components/Admin/LevelsAdminPage';
import LessonsAdminPage from './components/Admin/LessonsAdminPage';
import PasswordResetPage from './components/Auth/PasswordResetPage';
import UserProfileEditPage from './profile/UserProfileEditPage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/Navigation/Footer';
import TermsPage from './pages/Static/TermsPage';
import SuccessPage from './pages/success';
import Ranking from './pages/Ranking';

// Componente para proteger rutas de Admin
const ProtectedRouteAdmin = () => {
  const { currentUser, loading } = useContext(UserContext);

  if (loading) {
    return <div>Verificando acceso...</div>; // Muestra carga mientras verifica
  }

  // Si terminó de cargar y el usuario NO es admin, redirige a inicio
  // O podrías redirigir a una página de "Acceso Denegado"
  if (!currentUser?.isAdmin) {
    console.log("ProtectedRouteAdmin: Acceso denegado.");
    return <Navigate to="/" replace />;
  }

  // Si es admin, permite el acceso al contenido anidado (Outlet)
  console.log("ProtectedRouteAdmin: Acceso concedido.");
  return <Outlet />; // Outlet renderiza el componente de la ruta hija
};

function App() {
  console.log("Importando componentes de Admin...");
  // Quitamos el contexto de aquí, cada ruta/componente lo usa si lo necesita
  return (
    <Router>
      <Toaster position="top-right" />
      {/* Podrías tener un componente Layout aquí que incluya el Navbar */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />

        {/* Rutas Protegidas para Usuarios Normales (usando el método anterior) */}
        {/* Nota: movimos la protección de '/' a DENTRO de DashboardPage */}
        <Route path='/' element={<DashboardPage />} />
        {/* Para las otras, podrías crear un ProtectedRoute similar o mantener el ternario */}
        <Route path='/modules/:moduleId' element={<ProtectedRoute><LevelsPage /></ProtectedRoute>} />
        <Route path='/levels/:levelId/lessons/:lessonId' element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path='/profile/edit' element={<ProtectedRoute><UserProfileEditPage editMode={true} /></ProtectedRoute>} />
        <Route path="/levels/:levelId" element={<ProtectedRoute><LevelDetailPage /></ProtectedRoute>} />
        <Route path='/store' element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
        <Route path='/success' element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
        <Route path='/cancel' element={<ProtectedRoute><CancelPage /></ProtectedRoute>} />
        <Route path='/rankings' element={<ProtectedRoute><Ranking /></ProtectedRoute>} /> {/* Podrías tener una página de rankings específica */}

        {/* Rutas Protegidas para Administradores */}
        <Route element={<ProtectedRouteAdmin />}> {/* Elemento padre que protege */}
           <Route path="/admin" element={<AdminDashboard />} /> {/* Ruta base del admin */}
           <Route path='/admin/modules' element={<ModulesAdminPage />} /> {/* Dashboard de Admin */}
           <Route path="/admin/modules/:moduleId/levels" element={<LevelsAdminPage />}/>
           <Route path="/admin/levels/:levelId/lessons" element={<LessonsAdminPage />} />
           <Route path="/admin/lessons/edit/:lessonId" element={<LessonContentEditor />} /> {/* Editor */}
           {/* Aquí añadirías más rutas de admin: /admin/modules, /admin/levels, etc. */}
        </Route>

        {/* Ruta Catch-all (opcional) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

// Componente genérico para proteger rutas de usuario logueado (si no lo tienes ya)
// Si usas el método de protección dentro de cada página, no necesitas este.
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useContext(UserContext);
     if (loading) {
         return <div>Cargando...</div>;
     }
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
};


export default App;