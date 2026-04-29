import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function List() {
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    api.get("/changes").then(({ data }) => setChanges(data));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Regulatory Changes</h2>
        <Link to="/changes/new" className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">+ New Change</Link>
      </div>

      <div className="grid gap-4">
        {changes.map(c => (
          <div key={c.id} className="bg-white rounded shadow p-4 flex items-center justify-between">
            <div>
              <Link to={`/changes/${c.id}`} className="text-lg font-medium text-blue-600 hover:underline">{c.title}</Link>
              <div className="text-sm text-gray-600">{c.source} • {c.effectiveDate}</div>
            </div>
            <div className="text-sm font-medium">
              <span className="px-2 py-1 rounded text-white " style={{ backgroundColor: c.status === 'PENDING' ? '#f59e0b' : c.status === 'APPROVED' ? '#10b981' : '#6b7280' }}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
