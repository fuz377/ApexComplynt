import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { complaintApi } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  const fetchData = async () => {
    setLoading(true);
    const data = await complaintApi.getComplaints();
    setComplaints(data);
    setLoading(false);
  };

 useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const data = await complaintApi.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  const handleUpdateStatus = async (id: string, status: ComplaintStatus) => {
    await complaintApi.updateStatus(id, status);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    // const confirmed = confirm('Delete this complaint?');
    // if (!confirmed) return;

    const all = await complaintApi.getComplaints();
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem('civic_complaints', JSON.stringify(updated));
    fetchData();
  };

  const filtered = filter === 'ALL'
    ? complaints
    : complaints.filter(c => c.status === filter);

  if (loading) return <div className="p-6">Loading...</div>;

  const handleFilterChange = (value: string) => {
  if (value === 'ALL') {
    setFilter('ALL');
  } else {
    setFilter(value as ComplaintStatus);
  }
};
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>

        <select
  value={filter}
  onChange={(e) => handleFilterChange(e.target.value)}
  className="border px-3 py-1 text-sm rounded"
>
          <option value="ALL">All</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-400">{c.id}</div>
                </td>
                  <td className="p-3">
    {c.isAnonymous ? 'Anonymous' : c.submittedBy}
  </td>

                <td className="p-3">{c.category}</td>

                <td className="p-3">
                  <StatusBadge status={c.status} />
                </td>

                <td className="p-3 text-right space-x-2">

                  {/* STATUS CHANGE */}
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleUpdateStatus(c.id, e.target.value as ComplaintStatus)
                    }
                    className="border text-xs px-2 py-1 rounded"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  {/* VIEW */}
                  <Link
                    to={`/complaint/${c.id}`}
                    className="text-blue-600 text-xs"
                  >
                    View
                  </Link>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-white text-xs bg-red-500 hover:bg-red-800 hover:text-white cursor-pointer"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No complaints
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;