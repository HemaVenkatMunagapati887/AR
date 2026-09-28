import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Workers from './pages/Workers';
import Modules from './pages/Modules';
import Attempts from './pages/Attempts';
import Certificates from './pages/Certificates';
import VerifyLookup from './pages/VerifyLookup';
import Verify from './pages/Verify';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify/:certId" element={<Verify />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="workers" element={<Workers />} />
        <Route path="modules" element={<Modules />} />
        <Route path="attempts" element={<Attempts />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="verify-lookup" element={<VerifyLookup />} />
      </Route>
    </Routes>
  );
}
