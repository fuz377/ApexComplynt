
import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [ComplaintStatus.OPEN]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [ComplaintStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ComplaintStatus.RESOLVED]: 'bg-green-100 text-green-700 border-green-200',
    [ComplaintStatus.CLOSED]: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
