import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Loader from './components/Loader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useScrollToTop from './hooks/useScrollToTop.js';

import Home from './pages/Home.jsx';

const Menu = lazy(() => import('./pages/Menu.jsx'));
const Story = lazy(() => import('./pages/Story.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const Visit = lazy(() => import('./pages/Visit.jsx'));
const Reserve = lazy(() => import('./pages/Reserve.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const location = useLocation();
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Navbar />

      <div className="flex-1">
        <Suspense fallback={<Loader className="min-h-[70vh]" />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/story" element={<Story />} />
              <Route path="/events" element={<Events />} />
              <Route path="/visit" element={<Visit />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}
