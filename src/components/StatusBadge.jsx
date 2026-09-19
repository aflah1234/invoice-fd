import React from 'react';

const statusMap = {
  pending:    { cls: 'badge-yellow', label: 'Pending',    emoji: '⏳' },
  confirmed:  { cls: 'badge-blue',   label: 'Confirmed',  emoji: '✅' },
  processing: { cls: 'badge-purple', label: 'Processing', emoji: '⚙️' },
  completed:  { cls: 'badge-green',  label: 'Completed',  emoji: '🎉' },
  cancelled:  { cls: 'badge-red',    label: 'Cancelled',  emoji: '✕'  },
};

export default function StatusBadge({ status, showDot = true }) {
  const s = statusMap[status] || { cls: 'badge-gray', label: status || '—', emoji: '•' };
  return (
    <span className={`badge ${s.cls}`}>
      {showDot && <span className="badge-dot" />}
      {s.label}
    </span>
  );
}
