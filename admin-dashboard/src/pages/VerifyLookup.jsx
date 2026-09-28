import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyLookup() {
  const [certId, setCertId] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (certId.trim()) navigate(`/verify/${certId.trim()}`);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Certificate Verification</h2>
      <p className="text-gray-500 mb-6">
        Enter a certificate ID (or scan the QR code on a worker's certificate) to verify it.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
        <input
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="JH-SAFE-2026-00001"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-safety-orange"
        />
        <button className="bg-safety-orange text-white font-semibold px-5 rounded-lg hover:opacity-90">
          Verify
        </button>
      </form>
    </div>
  );
}
