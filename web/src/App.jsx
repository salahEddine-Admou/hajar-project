import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import { Loader } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pregnancy from './pages/Pregnancy';
import Babies from './pages/Babies';
import Wellness from './pages/Wellness';
import School from './pages/School';
import Tools from './pages/Tools';
import Community from './pages/Community';
import Assistant from './pages/Assistant';

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return <Loader />;
  if (!user) return <Login />;

  return (
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
  );
}
