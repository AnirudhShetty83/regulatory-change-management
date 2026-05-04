import { useState } from 'react';
import axios from 'axios';

export default function FormPage() {
  const [formData, setFormData] = useState({ title: '', category: '', status: 'Pending' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setErrors({ title: 'Title is required' });
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/create`, formData);
      alert('Success!');
    } catch (err) {
      setErrors({ submit: 'Failed to save record.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-[#1B4F8A]">Create New Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" name="title" onChange={handleChange} className="w-full p-2 border rounded" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <button type="submit" className="w-full bg-[#1B4F8A] text-white font-bold py-2 px-4 rounded">
          Save Record
        </button>
      </form>
    </div>
  );
}