import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import type { ComponentType } from 'react';
import { DEFAULT_GAME } from '../core/games';
import { GameLayout } from './GameLayout';
import { ScrollToTop } from './ScrollToTop';
import { AuthProvider } from '../core/account/AuthContext';
import { L, useLang } from '../i18n';

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

// Persona 3 Reload
const P3Home = lazy(() => import('../games/p3r/pages/Home'));
const P3Catalog = lazy(() => import('../games/p3r/pages/Catalog'));
const P3Profile = lazy(() => import('../games/p3r/pages/PersonaProfile'));
const P3Fusion = lazy(() => import('../games/p3r/pages/Fusion'));
const P3Specials = lazy(() => import('../games/p3r/pages/Specials'));

/** Elige la pantalla según el juego de la URL. Si un juego no la tiene, muestra "no encontrado". */
function byGame(screens: Partial<Record<string, ComponentType>>) {
  return function GameScreen() {
    const { gameId = '' } = useParams();
    const Screen = screens[gameId] ?? NotFound;
    return <Screen />;
  };
}
const HomeScreen = byGame({ p5r: Home, p3r: P3Home });
const CatalogScreen = byGame({ p5r: Catalog, p3r: P3Catalog });
const FusionScreen = byGame({ p5r: Fusion, p3r: P3Fusion });
const ProfileScreen = byGame({ p5r: PersonaProfile, p3r: P3Profile });
const SpecialsScreen = byGame({ p3r: P3Specials });
const p5rOnly = (C: ComponentType) => byGame({ p5r: C });
const SkillCardsScreen = p5rOnly(SkillCards);
const TechnicalScreen = p5rOnly(Technical);
const SchoolScreen = p5rOnly(School);
const ConfidantsScreen = p5rOnly(Confidants);
const ConfidantProfileScreen = p5rOnly(ConfidantProfile);
const BuildsScreen = p5rOnly(Builds);
const BuildViewScreen = p5rOnly(BuildView);
const BuildEditorScreen = p5rOnly(BuildEditor);

/**
 * Rutas.
 * Se usa HashRouter (URLs con #/) porque GitHub Pages no soporta rutas internas.
 * Hoy solo P5R tiene pantallas; los otros juegos se suman con sus propias rutas.
 */
export function App() {
  // Al cambiar el idioma se vuelve a dibujar todo con los textos nuevos.
  const lang = useLang();
  return (
    <AuthProvider key={lang}>
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="container" style={{ padding: '64px 0' }}>{L('Cargando…', 'Loading…')}</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={`/${DEFAULT_GAME}`} replace />} />
          <Route path="/:gameId" element={<GameLayout />}>
            <Route index element={<HomeScreen />} />
            <Route path="calculadora" element={<CatalogScreen />} />
            <Route path="calculadora/fusionar" element={<FusionScreen />} />
            <Route path="calculadora/especiales" element={<SpecialsScreen />} />
            <Route path="calculadora/skill-cards" element={<SkillCardsScreen />} />
            <Route path="calculadora/persona/:personaId" element={<ProfileScreen />} />
            <Route path="tecnicos" element={<TechnicalScreen />} />
            <Route path="clases" element={<SchoolScreen />} />
            <Route path="confidentes" element={<ConfidantsScreen />} />
            <Route path="confidentes/:confidantId" element={<ConfidantProfileScreen />} />
            <Route path="builds" element={<BuildsScreen />} />
            <Route path="builds/nueva" element={<BuildEditorScreen />} />
            <Route path="builds/:buildId" element={<BuildViewScreen />} />
            <Route path="builds/:buildId/editar" element={<BuildEditorScreen />} />
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
