import React from 'react';

const statusMap = {
  pending:    { cls: 'badge-yellow', label: 'Pending' },
  confirmed:  { cls: 'badge-blue',   label: 'Confirmed' },
  processing: { cls: 'badge-purple', label: 'Processing' },
  completed:  { cls: 'badge-green',  label: 'Completed' },
  cancelled:  { cls: 'badge-red',    label: 'Cancelled' },
};

export default function StatusBadge({ status }) {
  const s = statusMap[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
