import React, { useEffect, useState } from 'react';
import api from '../api';
import StatCard from '../components/StatCard';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load stats'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-gray-500">Loading…</p>;

  const complianceRate =
    stats.totalWorkers > 0 ? Math.round((stats.trainedWorkers / stats.totalWorkers) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Compliance Overview</h2>
      <p className="text-gray-500 mb-6">Live snapshot of worker safety training compliance.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Workers" value={stats.totalWorkers} />
        <StatCard label="Trained Workers" value={stats.trainedWorkers} accent="text-green-600" />
        <StatCard label="Pending Training" value={stats.pendingWorkers} accent="text-amber-600" />
        <StatCard label="Certificates Issued" value={stats.certificatesIssued} accent="text-safety-orange" />
        <StatCard label="Total Modules" value={stats.totalModules} />
        <StatCard label="Total Attempts" value={stats.totalAttempts} />
        <StatCard label="Passed Attempts" value={stats.passedAttempts} accent="text-green-600" />
        <StatCard label="Failed Attempts" value={stats.failedAttempts} accent="text-red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Overall Compliance Rate</h3>
          <span className="text-sm font-medium">{complianceRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-safety-orange h-3 rounded-full transition-all"
            style={{ width: `${complianceRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Share of registered workers who have passed at least one safety module.
        </p>
      </div>
    </div>
  );
}
