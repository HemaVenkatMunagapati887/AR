import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Attempts() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/attempts')
      .then((res) => setAttempts(res.data.attempts))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load attempts'));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Assessment Results</h2>
      <p className="text-gray-500 mb-6">Most recent 500 attempts across all workers and modules.</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">
                  {a.userId?.name} <span className="text-gray-400">({a.userId?.workerId})</span>
                </td>
                <td className="px-4 py-3">{a.moduleId}</td>
                <td className="px-4 py-3">
                  {a.score}/{a.maxScore} ({a.percentage}%)
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {a.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {a.syncedFromOffline ? 'Offline sync' : 'Online'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No assessment attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
