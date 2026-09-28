import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/workers')
      .then((res) => setWorkers(res.data.workers))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load workers'));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Workers</h2>
      <p className="text-gray-500 mb-6">All registered workers across sectors.</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Worker ID</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{w.name}</td>
                <td className="px-4 py-3">{w.workerId}</td>
                <td className="px-4 py-3">{w.sector}</td>
                <td className="px-4 py-3 uppercase">{w.language}</td>
                <td className="px-4 py-3">{w.phone || '—'}</td>
                <td className="px-4 py-3">{new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No workers registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
