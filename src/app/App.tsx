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
const P3Hearts = lazy(() => import('../games/p3r/pages/Hearts'));
const P3Links = lazy(() => import('../games/p3r/pages/Links'));
const P3LinkProfile = lazy(() => import('../games/p3r/pages/LinkProfile'));
const P3Classes = lazy(() => import('../games/p3r/pages/Classes'));
const P3Builds = lazy(() => import('../games/p3r/pages/Builds'));
const P3BuildView = lazy(() => import('../games/p3r/pages/BuildView'));
const P3BuildEditor = lazy(() => import('../games/p3r/pages/BuildEditor'));
const P4Home = lazy(() => import('../games/p4g/pages/Home'));
const P4Catalog = lazy(() => import('../games/p4g/pages/Catalog'));
const P4Profile = lazy(() => import('../games/p4g/pages/PersonaProfile'));
const P4Fusion = lazy(() => import('../games/p4g/pages/Fusion'));
const P4Specials = lazy(() => import('../games/p4g/pages/Specials'));
const P4SkillCards = lazy(() => import('../games/p4g/pages/SkillCards'));
const P4Builds = lazy(() => import('../games/p4g/pages/Builds'));
const P4BuildView = lazy(() => import('../games/p4g/pages/BuildView'));
const P4BuildEditor = lazy(() => import('../games/p4g/pages/BuildEditor'));
const P4Forecast = lazy(() => import('../games/p4g/pages/Forecast'));
const P4Classes = lazy(() => import('../games/p4g/pages/Classes'));
const P4Links = lazy(() => import('../games/p4g/pages/Links'));
const P4LinkProfile = lazy(() => import('../games/p4g/pages/LinkProfile'));
// Persona 5 Strikers
const P5SHome = lazy(() => import('../games/p5s/pages/Home'));
const P5SCatalog = lazy(() => import('../games/p5s/pages/Catalog'));
const P5SProfile = lazy(() => import('../games/p5s/pages/PersonaProfile'));
const P5SFusion = lazy(() => import('../games/p5s/pages/Fusion'));
const P5SBond = lazy(() => import('../games/p5s/pages/Bond'));
const P5SBuilds = lazy(() => import('../games/p5s/pages/Builds'));
const P5SBuildView = lazy(() => import('../games/p5s/pages/BuildView'));
const P5SBuildEditor = lazy(() => import('../games/p5s/pages/BuildEditor'));
// Persona 5 Tactica
const P5THome = lazy(() => import('../games/p5t/pages/Home'));
const P5TCatalog = lazy(() => import('../games/p5t/pages/Catalog'));
const P5TProfile = lazy(() => import('../games/p5t/pages/PersonaProfile'));
const P5TFusion = lazy(() => import('../games/p5t/pages/Fusion'));
const P5TParty = lazy(() => import('../games/p5t/pages/Party'));

/** Elige la pantalla según el juego de la URL. Si un juego no la tiene, muestra "no encontrado". */
function byGame(screens: Partial<Record<string, ComponentType>>) {
  return function GameScreen() {
    const { gameId = '' } = useParams();
    const Screen = screens[gameId] ?? NotFound;
    return <Screen />;
  };
}
const HomeScreen = byGame({ p5r: Home, p3r: P3Home, p4g: P4Home, p5s: P5SHome, p5t: P5THome });
const CatalogScreen = byGame({ p5r: Catalog, p3r: P3Catalog, p4g: P4Catalog, p5s: P5SCatalog, p5t: P5TCatalog });
const FusionScreen = byGame({ p5r: Fusion, p3r: P3Fusion, p4g: P4Fusion, p5s: P5SFusion, p5t: P5TFusion });
const ProfileScreen = byGame({ p5r: PersonaProfile, p3r: P3Profile, p4g: P4Profile, p5s: P5SProfile, p5t: P5TProfile });
const SpecialsScreen = byGame({ p3r: P3Specials, p4g: P4Specials });
const HeartsScreen = byGame({ p3r: P3Hearts });
const LinksScreen = byGame({ p3r: P3Links, p4g: P4Links, p5s: P5SBond });
const LinkProfileScreen = byGame({ p3r: P3LinkProfile, p4g: P4LinkProfile });
const p5rOnly = (C: ComponentType) => byGame({ p5r: C });
const ForecastScreen = byGame({ p4g: P4Forecast });
const PartyScreen = byGame({ p5t: P5TParty });
const SkillCardsScreen = byGame({ p5r: SkillCards, p4g: P4SkillCards });
const TechnicalScreen = p5rOnly(Technical);
const SchoolScreen = byGame({ p5r: School, p3r: P3Classes, p4g: P4Classes });
const ConfidantsScreen = p5rOnly(Confidants);
const ConfidantProfileScreen = p5rOnly(ConfidantProfile);
const BuildsScreen = byGame({ p5r: Builds, p3r: P3Builds, p4g: P4Builds, p5s: P5SBuilds });
const BuildViewScreen = byGame({ p5r: BuildView, p3r: P3BuildView, p4g: P4BuildView, p5s: P5SBuildView });
const BuildEditorScreen = byGame({ p5r: BuildEditor, p3r: P3BuildEditor, p4g: P4BuildEditor, p5s: P5SBuildEditor });

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
            <Route path="calculadora/corazones" element={<HeartsScreen />} />
            <Route path="calculadora/skill-cards" element={<SkillCardsScreen />} />
            <Route path="calculadora/pronostico" element={<ForecastScreen />} />
            <Route path="calculadora/persona/:personaId" element={<ProfileScreen />} />
            <Route path="tecnicos" element={<TechnicalScreen />} />
            <Route path="clases" element={<SchoolScreen />} />
            <Route path="confidentes" element={<ConfidantsScreen />} />
            <Route path="confidentes/:confidantId" element={<ConfidantProfileScreen />} />
            <Route path="vinculos" element={<LinksScreen />} />
            <Route path="vinculos/:linkId" element={<LinkProfileScreen />} />
            <Route path="ladrones" element={<PartyScreen />} />
            <Route path="ladrones/:memberId" element={<PartyScreen />} />
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
