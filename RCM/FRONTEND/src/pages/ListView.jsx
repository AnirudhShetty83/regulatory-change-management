import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ListView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/all`);
        setRecords(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Ensure the Java backend is running.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading data...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;
  if (records.length === 0) return <div className="p-8 text-center text-gray-500 mt-20">No Records Found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#1B4F8A]">Regulatory Changes</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase border-b-2 bg-gray-50">
            <tr>
              <th className="px-6 py-4 border-b">ID</th>
              <th className="px-6 py-4 border-b">Title</th>
              <th className="px-6 py-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{record.id}</td>
                <td className="px-6 py-4 font-medium">{record.title}</td>
                <td className="px-6 py-4">{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}