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
    try {
      setLoading(true);

      const response = await complaintApi.getComplaints();

      const result = response as {
        data: {
          data?: Complaint[];
        } | Complaint[];
      };

      const complaintsData = Array.isArray(result.data)
        ? result.data
        : result.data.data || [];

      setComplaints(complaintsData);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: ComplaintStatus
  ) => {
    try {
      await complaintApi.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm(
        'Are you sure you want to delete this complaint?'
      );

      if (!confirmed) return;

      await complaintApi.deleteComplaint(id);

      setComplaints((prev) =>
        prev.filter((complaint) => complaint.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const filtered =
    filter === 'ALL'
      ? complaints
      : complaints.filter((c) => c.status === filter);

  const handleFilterChange = (value: string) => {
    if (value === 'ALL') {
      setFilter('ALL');
    } else {
      setFilter(value as ComplaintStatus);
    }
  };

  if (loading) {
    return <div className="p-6">Loading complaints...</div>;
  }

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
          <option value="CLOSED">Closed</option>
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
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        c.id,
                        e.target.value as ComplaintStatus
                      )
                    }
                    className="border text-xs px-2 py-1 rounded"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  <Link
                    to={`/complaint/${c.id}`}
                    className="text-blue-600 text-xs"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-white text-xs bg-red-500 hover:bg-red-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-400"
                >
                  No complaints found
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