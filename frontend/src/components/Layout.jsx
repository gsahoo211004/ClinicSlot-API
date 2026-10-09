import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          ClinicSlot
        </Link>
        {isAuthenticated && (
          <nav className="nav">
            <NavLink to="/" end>Book</NavLink>
            <NavLink to="/appointments">My appointments</NavLink>
            <span className="user-email">{user?.email}</span>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        )}
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        Clinic appointment booking demo — Node.js API + React
      </footer>
    </div>
  );
}
