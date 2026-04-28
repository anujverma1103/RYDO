import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaCarSide, FaChartLine, FaClock, FaHome, FaPowerOff, FaUser } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const passengerLinks = [
  { to: '/passenger', label: 'Home', icon: FaHome },
  { to: '/passenger/book', label: 'Book', icon: FaCarSide },
  { to: '/passenger/history', label: 'History', icon: FaClock },
  { to: '/passenger/profile', label: 'Profile', icon: FaUser }
];

const driverLinks = [
  { to: '/driver', label: 'Home', icon: FaHome },
  { to: '/driver/earnings', label: 'Earnings', icon: FaChartLine },
  { to: '/driver/profile', label: 'Profile', icon: FaUser }
];

/**
 * Responsive application shell with desktop sidebar and mobile bottom nav.
 *
 * @param {{role: 'passenger'|'driver'}} props - Shell props.
 * @returns {JSX.Element}
 */
const Sidebar = ({ role }) => {
  const { logout, user } = useContext(AuthContext);
  const links = role === 'driver' ? driverLinks : passengerLinks;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
      isActive ? 'bg-white text-rydo-navy' : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold ${
      isActive ? 'text-rydo-accent' : 'text-slate-500'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-rydo-navy px-4 py-5 text-white md:flex">
        <div className="mb-8">
          <p className="text-2xl font-black tracking-[0.22em]">RYDO</p>
          <p className="mt-1 text-sm text-slate-300">{user?.name}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} end={link.to === `/${role}`} className={navLinkClass}>
                <Icon />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <button type="button" onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
          <FaPowerOff />
          Logout
        </button>
      </aside>

      <main className="min-h-screen pb-20 md:ml-64 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} end={link.to === `/${role}`} className={mobileLinkClass}>
              <Icon className="text-base" />
              {link.label}
            </NavLink>
          );
        })}
        <button type="button" onClick={logout} className="flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold text-slate-500">
          <FaPowerOff className="text-base" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
