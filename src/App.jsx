import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Beranda from './pages/Beranda';
import DetailIklan from './pages/DetailIklan';
import PasangIklan from './pages/PasangIklan';
import SuksesPasangIklan from './pages/SuksesPasangIklan';
import Login from './pages/Login';
import Daftar from './pages/Daftar';
import Profil from './pages/Profil';
import IklanSaya from './pages/IklanSaya';
import Favorit from './pages/Favorit';
import Tentang from './pages/Tentang';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Beranda />,
      },
      {
        path: 'iklan/:id',
        element: <DetailIklan />,
      },
      {
        path: 'pasang-iklan',
        element: (
          <ProtectedRoute>
            <PasangIklan />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pasang-iklan/sukses',
        element: (
          <ProtectedRoute>
            <SuksesPasangIklan />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'daftar',
        element: <Daftar />,
      },
      {
        path: 'profil',
        element: (
          <ProtectedRoute>
            <Profil />
          </ProtectedRoute>
        ),
      },
      {
        path: 'iklan-saya',
        element: (
          <ProtectedRoute>
            <IklanSaya />
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorit',
        element: (
          <ProtectedRoute>
            <Favorit />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tentang',
        element: <Tentang />,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#334155',
            color: '#ffffff',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          },
        }} 
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
