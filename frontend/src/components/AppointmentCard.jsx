export default function AppointmentCard({ appointment, onCancel, cancelling }) {
  const slot = appointment.slot;
  const doctor = slot?.doctor;
  const clinic = doctor?.clinic;
  const start = slot?.startAt ? new Date(slot.startAt) : null;

  return (
    <article className="card appointment-card">
      <div>
        <h3>{clinic?.name || 'Clinic'}</h3>
        <p className="muted">{clinic?.city}</p>
        <p>
          <strong>{doctor?.name}</strong> — {doctor?.specialty}
        </p>
        {start && (
          <p className="slot-time">
            {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        <span className={`badge badge-${appointment.status.toLowerCase()}`}>{appointment.status}</span>
      </div>
      {appointment.status === 'CONFIRMED' && (
        <button
          type="button"
          className="btn btn-danger"
          disabled={cancelling}
          onClick={() => onCancel(appointment.id)}
        >
          {cancelling ? 'Cancelling…' : 'Cancel'}
        </button>
      )}
    </article>
  );
}
