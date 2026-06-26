import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import { Loader } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';

// Route-level code splitting: each page is fetched only when first visited,
// keeping the initial bundle small.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pregnancy = lazy(() => import('./pages/Pregnancy'));
const Babies = lazy(() => import('./pages/Babies'));
const Wellness = lazy(() => import('./pages/Wellness'));
const School = lazy(() => import('./pages/School'));
const Tools = lazy(() => import('./pages/Tools'));
const Community = lazy(() => import('./pages/Community'));
const Assistant = lazy(() => import('./pages/Assistant'));

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return <Loader />;
  if (!user) return <Login />;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/pregnancy" element={<Pregnancy />} />
          <Route path="/babies" element={<Babies />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/school" element={<School />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/community" element={<Community />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
