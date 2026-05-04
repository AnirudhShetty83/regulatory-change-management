import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    api.get("/changes").then(({ data }) => {
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === "PENDING").length,
      });
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Total Changes</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/changes" className="text-blue-600 hover:underline">View All Changes</Link>
      </div>
    </div>
  );
}
