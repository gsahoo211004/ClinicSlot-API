import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../api/client';
import AppointmentCard from '../components/AppointmentCard';

export default function AppointmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/appointments/me', true);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id) => {
    setCancellingId(id);
    setError('');
    try {
      await apiPatch(`/appointments/${id}/cancel`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="appointments-page">
      <h1>My appointments</h1>
      {error && <p className="error banner">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length === 0 && <p className="muted">No appointments yet. Book a slot from the home page.</p>}
      <div className="appointment-list">
        {items.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onCancel={cancel}
            cancelling={cancellingId === a.id}
          />
        ))}
      </div>
    </div>
  );
}
