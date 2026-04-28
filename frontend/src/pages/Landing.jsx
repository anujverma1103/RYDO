import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import { FaArrowRight, FaCarSide, FaLocationDot, FaRoute, FaWallet } from 'react-icons/fa6';
import { AuthContext } from '../context/AuthContext';
import { dropIcon, pickupIcon } from '../components/map/RouteMap';

const heroPickup = { lat: 28.6315, lng: 77.2167 };
const heroDrop = { lat: 28.6129, lng: 77.2295 };
const heroRoute = [
  [28.6315, 77.2167],
  [28.6275, 77.2191],
  [28.6223, 77.222],
  [28.6174, 77.226],
  [28.6129, 77.2295]
];

const vehicles = [
  { name: 'Auto', rate: '₹8/km', note: 'Quick city rides' },
  { name: 'Sedan', rate: '₹12/km', note: 'Comfort everyday' },
  { name: 'SUV', rate: '₹18/km', note: 'More seats and space' }
];

/**
 * Public landing page with a live OpenStreetMap hero background.
 *
 * @returns {JSX.Element}
 */
const Landing = () => {
  const { user } = useContext(AuthContext);
  const ctaTarget = user ? (user.role === 'driver' ? '/driver' : '/passenger/book') : '/login';

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed left-0 right-0 top-0 z-[600] border-b border-white/20 bg-rydo-navy/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white">
          <Link to="/" className="text-xl font-black tracking-[0.22em]">
            RYDO
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-white/85 hover:text-white sm:block">
              Login
            </Link>
            <Link to={ctaTarget} className="primary-btn bg-white text-rydo-navy hover:bg-slate-100">
              Book Now
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-rydo-navy pt-24 text-white">
        <div className="absolute inset-0 opacity-55">
          <MapContainer center={[28.622, 77.222]} zoom={14} zoomControl={false} dragging={false} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap contributors" />
            <Marker position={[heroPickup.lat, heroPickup.lng]} icon={pickupIcon} />
            <Marker position={[heroDrop.lat, heroDrop.lng]} icon={dropIcon} />
            <Polyline positions={heroRoute} pathOptions={{ color: '#6C63FF', weight: 7, opacity: 0.9 }} />
          </MapContainer>
        </div>
        <div className="absolute inset-0 bg-rydo-navy/70" />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">Passenger and driver app</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Book Your Ride in Seconds</h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-200">
              RYDO connects passengers with nearby drivers using OpenStreetMap, Nominatim search, live Socket.io tracking, and Razorpay test payments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ctaTarget} className="primary-btn px-5 py-3">
                Start Riding
                <FaArrowRight />
              </Link>
              <Link to="/register" className="secondary-btn border-white/40 bg-white/10 px-5 py-3 text-white hover:bg-white/20">
                Create Account
              </Link>
            </div>
          </div>

          <div className="map-control-panel rounded-lg border border-white/20 bg-white/12 p-4 shadow-soft">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-white/90 p-3 text-slate-900">
                <FaLocationDot className="text-green-600" />
                Connaught Place to India Gate
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/90 p-3 text-slate-900">
                <FaRoute className="text-blue-600" />
                4.6 km route, 16 min estimate
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/90 p-3 text-slate-900">
                <FaWallet className="text-rydo-accent" />
                Razorpay test mode or cash after ride
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 grid max-w-6xl gap-4 px-4 pb-12 sm:grid-cols-3">
        {[
          ['Search', 'Choose pickup and drop with free Nominatim autocomplete.'],
          ['Select', 'Compare Auto, Sedan, and SUV fares from real route distance.'],
          ['Track', 'Follow the ride with live driver location updates.']
        ].map(([title, text], index) => (
          <div key={title} className="relative z-20 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-rydo-accent text-sm font-black text-white">{index + 1}</span>
            <h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-5 flex items-center gap-3">
          <FaCarSide className="text-2xl text-rydo-accent" />
          <h2 className="text-2xl font-black text-slate-900">Vehicle Types</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xl font-black text-slate-900">{vehicle.name}</p>
              <p className="mt-2 text-3xl font-black text-rydo-accent">{vehicle.rate}</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{vehicle.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
