import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Complaint, ComplaintStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { complaintApi } from '../services/api';

const PublicTracker: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        const response = await complaintApi.getComplaints();
        const result = response as {
          data: { data?: Complaint[] } | Complaint[];
        };

        const complaintsData = Array.isArray(result.data)
          ? result.data
          : result.data.data || [];

        // Filter out anonymous complaints for public view
        const publicComplaints = complaintsData.filter(c => !c.isAnonymous);
        setComplaints(publicComplaints);
        setFilteredComplaints(publicComplaints);
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    // Filter by status
    if (filter !== 'ALL') {
      filtered = filtered.filter(c => c.status === filter);
    }

    // Filter by category
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(lowerSearch) ||
          c.description.toLowerCase().includes(lowerSearch) ||
          c.submittedBy.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredComplaints(filtered);
  }, [complaints, filter, searchTerm, categoryFilter]);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === ComplaintStatus.OPEN).length,
    inProgress: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
    resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
    closed: complaints.filter(c => c.status === ComplaintStatus.CLOSED).length,
  };

  const categories = ['ALL', ...new Set(complaints.map(c => c.category))];

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="text-slate-500">Loading public complaints...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Public Complaint Tracker</h1>
        <p className="text-slate-500 mt-2">Track all public complaints and their status in real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-900' },
          { label: 'Open', value: stats.open, color: 'bg-blue-100 text-blue-900' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-100 text-amber-900' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-900' },
          { label: 'Closed', value: stats.closed, color: 'bg-slate-300 text-slate-900' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-4 rounded-lg text-center`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, description, or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ComplaintStatus | 'ALL')}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value={ComplaintStatus.OPEN}>Open</option>
            <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
            <option value={ComplaintStatus.RESOLVED}>Resolved</option>
            <option value={ComplaintStatus.CLOSED}>Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800">
            Complaints ({filteredComplaints.length})
          </h2>
        </div>

        {filteredComplaints.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaint/${complaint.id}`}
                className="block p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg hover:text-blue-600 transition-colors">
                      {complaint.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                    {complaint.category}
                  </span>
                  <span className="font-medium text-slate-700">
                    By: {complaint.submittedBy}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(complaint.dateSubmitted).toLocaleDateString()}
                  </span>
                  <span className="ml-auto text-xs text-slate-400">
                    Priority: <span className={complaint.priority === 'HIGH' || complaint.priority === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-slate-600'}>{complaint.priority}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 font-medium">No complaints found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracker;