import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DEFAULT_GAME } from '../core/games';
import { GameLayout } from './GameLayout';
import { ScrollToTop } from './ScrollToTop';
import { AuthProvider } from '../core/account/AuthContext';

// Cada pantalla se carga por separado (lazy loading) para que la web sea rápida.
const Home = lazy(() => import('../games/p5r/pages/Home'));
const Catalog = lazy(() => import('../games/p5r/pages/Catalog'));
const PersonaProfile = lazy(() => import('../games/p5r/pages/PersonaProfile'));
const Fusion = lazy(() => import('../games/p5r/pages/Fusion'));
const SkillCards = lazy(() => import('../games/p5r/pages/SkillCards'));
const Technical = lazy(() => import('../games/p5r/pages/Technical'));
const School = lazy(() => import('../games/p5r/pages/School'));
const Confidants = lazy(() => import('../games/p5r/pages/Confidants'));
const ConfidantProfile = lazy(() => import('../games/p5r/pages/ConfidantProfile'));
const Account = lazy(() => import('./Account'));
const MyProfile = lazy(() => import('./MyProfile'));
const Builds = lazy(() => import('../games/p5r/pages/Builds'));
const BuildView = lazy(() => import('../games/p5r/pages/BuildView'));
const BuildEditor = lazy(() => import('../games/p5r/pages/BuildEditor'));
const Admin = lazy(() => import('./Admin'));
const About = lazy(() => import('./About'));
const NotFound = lazy(() => import('./NotFound'));

/**
 * Rutas.
 * Se usa HashRouter (URLs con #/) porque GitHub Pages no soporta rutas internas.
 * Hoy solo P5R tiene pantallas; los otros juegos se suman con sus propias rutas.
 */
export function App() {
  return (
    <AuthProvider>
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="container" style={{ padding: '64px 0' }}>Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={`/${DEFAULT_GAME}`} replace />} />
          <Route path="/:gameId" element={<GameLayout />}>
            <Route index element={<Home />} />
            <Route path="calculadora" element={<Catalog />} />
            <Route path="calculadora/fusionar" element={<Fusion />} />
            <Route path="calculadora/skill-cards" element={<SkillCards />} />
            <Route path="calculadora/persona/:personaId" element={<PersonaProfile />} />
            <Route path="tecnicos" element={<Technical />} />
            <Route path="clases" element={<School />} />
            <Route path="confidentes" element={<Confidants />} />
            <Route path="confidentes/:confidantId" element={<ConfidantProfile />} />
            <Route path="builds" element={<Builds />} />
            <Route path="builds/nueva" element={<BuildEditor />} />
            <Route path="builds/:buildId" element={<BuildView />} />
            <Route path="builds/:buildId/editar" element={<BuildEditor />} />
            <Route path="admin" element={<Admin />} />
            <Route path="cuenta" element={<Account />} />
            <Route path="perfil" element={<MyProfile />} />
            <Route path="sobre-nosotros" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
    </AuthProvider>
  );
}
