
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Complaint, ComplaintStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

const UserDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

useEffect(() => {
  const loadComplaints = async () => {
    try {
      // For now, this is sync, but the pattern supports async later
      const saved = localStorage.getItem('civic_complaints');
      if (saved) {
        const filtered = JSON.parse(saved).filter(
          (c: Complaint) => !c.isAnonymous || c.submittedBy === 'CurrentUser'
        );
        setComplaints(filtered);
      }
    } catch (error) {
      console.log(error);  
    }
  };

  loadComplaints();
}, []);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.IN_PROGRESS).length,
    resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500">Track and manage your submitted reports.</p>
        </div>
        <Link 
          to="/submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          File New Complaint
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Reports', value: stats.total, color: 'text-slate-900' },
          { label: 'Active Issues', value: stats.open, color: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Your Recent Activity</h2>
        </div>
        
        {complaints.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {complaints.map((item) => (
              <Link 
                key={item.id} 
                to={`/complaint/${item.id}`}
                className="block p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Category: <span className="text-slate-700 font-medium">{item.category}</span></span>
                  <span>•</span>
                  <span>Submitted: {new Date(item.dateSubmitted).toLocaleDateString()}</span>
                  {item.isAnonymous && <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">ANONYMOUS</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No complaints found. Start by filing one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
