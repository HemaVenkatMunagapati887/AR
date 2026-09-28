import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [workerId, setWorkerId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(workerId, password);
    if (ok) navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-safety-dark px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-center">Jharkhand Safety Training</h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">Admin Compliance Dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Worker ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-safety-orange"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="ADMIN001"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-safety-orange"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-safety-orange text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">
          Demo credentials: ADMIN001 / Admin@12345 (see backend .env.example)
        </p>
      </div>
    </div>
  );
}
