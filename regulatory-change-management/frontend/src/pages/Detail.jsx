import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Detail() {
  const { id } = useParams();
  const [change, setChange] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/changes/${id}`).then(({ data }) => setChange(data));
  }, [id]);

  const handleDelete = async () => {
    await api.delete(`/changes/${id}`);
    navigate("/changes");
  };

  if (!change) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl bg-white rounded shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{change.title}</h2>
          <div className="text-sm text-gray-600">{change.source} • {change.effectiveDate}</div>
        </div>
        <div className="space-x-2">
          <Link to={`/changes/${id}/edit`} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</Link>
          <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
        </div>
      </div>

      <div className="mt-4 text-gray-800">{change.description}</div>

      <div className="mt-4 text-sm text-gray-600">Status: <span className="font-medium">{change.status}</span></div>
    </div>
  );
}
