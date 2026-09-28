import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/modules')
      .then((res) => setModules(res.data.modules))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load modules'));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Training Modules</h2>
      <p className="text-gray-500 mb-6">Active AR safety training modules and their sector coverage.</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div key={m._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{m.name.en}</h3>
              <span className="text-xs bg-safety-orange/10 text-safety-orange px-2 py-1 rounded-full">
                {m.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{m.description?.en}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              {m.sectors.map((s) => (
                <span key={s} className="bg-gray-100 px-2 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>{m.questions?.length ?? '—'} assessment items</span>
              <span>Pass threshold: {m.passThreshold}%</span>
            </div>
          </div>
        ))}
        {modules.length === 0 && !error && <p className="text-gray-400">Loading…</p>}
      </div>
    </div>
  );
}
