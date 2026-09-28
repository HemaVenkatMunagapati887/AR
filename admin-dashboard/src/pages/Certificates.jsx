import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/certificates')
      .then((res) => setCertificates(res.data.certificates))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load certificates'));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Certificates</h2>
      <p className="text-gray-500 mb-6">All certificates issued to workers who passed a module.</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Certificate ID</th>
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Verify</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((c) => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{c.certificateId}</td>
                <td className="px-4 py-3">
                  {c.userId?.name} <span className="text-gray-400">({c.userId?.workerId})</span>
                </td>
                <td className="px-4 py-3">{c.moduleId}</td>
                <td className="px-4 py-3">{c.percentage}%</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'VALID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(c.issuedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/verify/${c.certificateId}`}
                    className="text-safety-orange hover:underline text-xs font-medium"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No certificates issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
