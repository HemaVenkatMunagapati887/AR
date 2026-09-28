import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Public page — intentionally does not require admin login, since this is the
// page a QR code on a worker's certificate links to for anyone to verify.
export default function Verify() {
  const { certId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/certificates/verify/${certId}`)
      .then((res) => setResult(res.data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [certId]);

  return (
    <div className="min-h-screen bg-safety-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Jharkhand Safety Training — Certificate Verification
        </p>
        <p className="font-mono text-sm text-gray-500 mb-6">{certId}</p>

        {loading && <p className="text-gray-400">Checking certificate…</p>}

        {!loading && result?.valid && (
          <div>
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-green-700">CERTIFICATE VERIFIED</h2>
            <dl className="mt-5 text-left text-sm divide-y divide-gray-100">
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Worker</dt>
                <dd className="font-medium">{result.workerName}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Module</dt>
                <dd className="font-medium">{result.moduleName?.en || result.moduleName}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Score</dt>
                <dd className="font-medium">{result.score}%</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-green-600">{result.status}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Issued</dt>
                <dd className="font-medium">{new Date(result.issuedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        )}

        {!loading && !result?.valid && (
          <div>
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✗
            </div>
            <h2 className="text-xl font-bold text-red-700">INVALID CERTIFICATE</h2>
            <p className="text-sm text-gray-500 mt-2">
              This certificate ID does not exist, or has been revoked.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-8">
          This is a hackathon training prototype, not an official government certification record.
        </p>
        <Link to="/" className="text-xs text-safety-orange hover:underline mt-2 inline-block">
          Go to admin dashboard
        </Link>
      </div>
    </div>
  );
}
