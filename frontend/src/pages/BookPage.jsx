import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

function formatSlot(slot) {
  const start = new Date(slot.startAt);
  const end = new Date(slot.endAt);
  return `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function BookPage() {
  const [city, setCity] = useState('Bangalore');
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingId, setBookingId] = useState(null);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSelectedClinic(null);
    setSelectedDoctor(null);
    setDoctors([]);
    setSlots([]);
    try {
      const data = await apiGet(`/clinics?city=${encodeURIComponent(city)}`);
      setClinics(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const selectClinic = async (clinic) => {
    setSelectedClinic(clinic);
    setSelectedDoctor(null);
    setSlots([]);
    setError('');
    setLoading(true);
    try {
      const data = await apiGet(`/clinics/${clinic.id}/doctors`);
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setError('');
    setLoading(true);
    try {
      const data = await apiGet(`/doctors/${doctor.id}/slots`);
      setSlots(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId) => {
    setBookingId(slotId);
    setError('');
    setSuccess('');
    try {
      await apiPost('/appointments', { slotId }, true);
      setSuccess('Appointment booked! View it under My appointments.');
      if (selectedDoctor) selectDoctor(selectedDoctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="book-page">
      <h1>Find a slot</h1>
      <p className="muted">Search clinics, pick a doctor, and book an open slot.</p>

      <div className="toolbar card">
        <label>
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bangalore" />
        </label>
        <button type="button" className="btn btn-primary" onClick={loadClinics} disabled={loading}>
          Search
        </button>
      </div>

      {error && <p className="error banner">{error}</p>}
      {success && <p className="success banner">{success}</p>}
      {loading && <p className="muted">Loading…</p>}

      <section className="grid-2">
        <div>
          <h2>Clinics</h2>
          {clinics.length === 0 && !loading && <p className="muted">No clinics in this city.</p>}
          <ul className="select-list">
            {clinics.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`select-item ${selectedClinic?.id === c.id ? 'active' : ''}`}
                  onClick={() => selectClinic(c)}
                >
                  <strong>{c.name}</strong>
                  <span>{c.city}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Doctors</h2>
          {!selectedClinic && <p className="muted">Select a clinic first.</p>}
          <ul className="select-list">
            {doctors.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`select-item ${selectedDoctor?.id === d.id ? 'active' : ''}`}
                  onClick={() => selectDoctor(d)}
                >
                  <strong>{d.name}</strong>
                  <span>{d.specialty}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Open slots</h2>
        {!selectedDoctor && <p className="muted">Select a doctor to see slots.</p>}
        <ul className="slot-list">
          {slots.map((slot) => (
            <li key={slot.id} className="card slot-row">
              <span>{formatSlot(slot)}</span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={bookingId === slot.id}
                onClick={() => bookSlot(slot.id)}
              >
                {bookingId === slot.id ? 'Booking…' : 'Book'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
