import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/workers', label: 'Workers' },
  { to: '/modules', label: 'Training Modules' },
  { to: '/attempts', label: 'Assessment Results' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/verify-lookup', label: 'Certificate Verification' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-safety-dark text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold leading-tight">Jharkhand Safety Training</h1>
          <p className="text-xs text-gray-400 mt-1">Compliance Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? 'bg-safety-orange text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <p className="text-gray-300">{user?.name}</p>
          <p className="text-gray-500 text-xs mb-2">{user?.workerId}</p>
          <button
            onClick={logout}
            className="w-full text-left text-red-400 hover:text-red-300 text-sm"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
