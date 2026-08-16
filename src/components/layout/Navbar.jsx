import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  User, 
  LogOut, 
  Heart, 
  Package, 
  Menu, 
  X, 
  ShieldCheck,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil keluar dari akun');
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Gagal keluar:', err);
      toast.error('Gagal keluar dari akun');
    }
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-1 sm:py-1.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Slogan */}
          <Link to="/" onClick={closeMenus} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-100 group-hover:bg-teal-700 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Buktip
              </span>
              <span className="text-[10px] text-gray-500 font-normal tracking-normal mt-0.5">
                Bukti Asli, Beli Tenang
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 transition"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>

            <Link 
              to="/semua-iklan" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Katalog HP</span>
            </Link>

            <Link 
              to="/tentang" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 transition"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Cara Kerja</span>
            </Link>
            
            <Link 
              to="/favorit" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-500 transition"
              title="Iklan Favorit"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Favorit</span>
            </Link>
            
            <Link 
              to="/pasang-iklan" 
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pasang Iklan</span>
            </Link>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
                    {profile?.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {profile?.nama_lengkap || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link
                      to="/profil"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      to="/pasang-iklan"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition font-medium"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Pasang Iklan</span>
                    </Link>
                    <Link
                      to="/iklan-saya"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition"
                    >
                      <Package className="w-4 h-4" />
                      <span>Iklan Saya</span>
                    </Link>
                    <Link
                      to="/favorit"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Favorit</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 rounded-lg hover:bg-slate-50 transition"
                  >
                    Masuk
                  </Link>
                )}
                {location.pathname !== '/daftar' && (
                  <Link
                    to="/daftar"
                    className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
                  >
                    Daftar
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </Link>
          <Link
            to="/semua-iklan"
            onClick={closeMenus}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
          >
            <Smartphone className="w-5 h-5" />
            <span>Katalog HP</span>
          </Link>
          <Link
            to="/tentang"
            onClick={closeMenus}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Cara Kerja</span>
          </Link>
          <Link
            to="/pasang-iklan"
            onClick={closeMenus}
            className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-orange-600 hover:bg-orange-50 rounded-lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Pasang Iklan</span>
          </Link>

          <div className="border-t border-slate-100 pt-2">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/iklan-saya"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
                >
                  <Package className="w-5 h-5" />
                  <span>Iklan Saya</span>
                </Link>
                <Link
                  to="/favorit"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
                >
                  <Heart className="w-5 h-5" />
                  <span>Favorit</span>
                </Link>
                <Link
                  to="/profil"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg"
                >
                  <User className="w-5 h-5" />
                  <span>Profil</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 pt-1">
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                  >
                    Masuk
                  </Link>
                )}
                {location.pathname !== '/daftar' && (
                  <Link
                    to="/daftar"
                    onClick={closeMenus}
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-center"
                  >
                    Daftar
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
