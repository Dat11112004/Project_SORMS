interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { className: string; label: string }> = {
  // Check-in statuses
  PendingCheckIn: { className: 'badge-warning', label: 'Pending Check-In' },
  CheckedIn: { className: 'badge-success', label: 'Checked In' },
  PendingCheckOut: { className: 'badge-warning', label: 'Pending Check-Out' },
  CheckedOut: { className: 'badge-info', label: 'Checked Out' },
  Rejected: { className: 'badge-danger', label: 'Rejected' },
  // Service request statuses
  Pending: { className: 'badge-warning', label: 'Pending' },
  Approved: { className: 'badge-success', label: 'Approved' },
  InProgress: { className: 'badge-info', label: 'In Progress' },
  Completed: { className: 'badge-success', label: 'Completed' },
  // Report statuses
  Reviewed: { className: 'badge-success', label: 'Reviewed' },
  // Room statuses
  Available: { className: 'badge-success', label: 'Available' },
  Occupied: { className: 'badge-warning', label: 'Occupied' },
  Maintenance: { className: 'badge-danger', label: 'Maintenance' },
  // Active
  Active: { className: 'badge-success', label: 'Active' },
  Inactive: { className: 'badge-danger', label: 'Inactive' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const mapped = statusMap[status] || { className: 'badge-default', label: status };
  return <span className={`badge ${mapped.className}`}>{mapped.label}</span>;
}
