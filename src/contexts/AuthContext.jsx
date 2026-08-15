import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => { },
  daftar: async () => { },
  logout: async () => { },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mengambil profil pengguna dari tabel profiles
  const fetchProfile = async (userId) => {
    try {
      if (!userId) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Gagal memuat profil pengguna:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat memuat profil:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Mengecek sesi awal pengguna saat aplikasi dimuat
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat memeriksa sesi awal:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Berlangganan perubahan status autentikasi Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fungsi Masuk Akun
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Fungsi Daftar Akun Baru
  const daftar = async (email, password, namaLengkap) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap: namaLengkap,
        },
      },
    });
    if (error) throw error;

    if (data?.user) {
      // Otomatis buat data profil dasar di tabel profiles
      try {
        let daerahId = 1;
        const { data: daerahData } = await supabase.from('daerah').select('id').limit(1).single();
        if (daerahData?.id) daerahId = daerahData.id;

        await supabase.from('profiles').upsert({
          id: data.user.id,
          nama_lengkap: namaLengkap,
          daerah_id: daerahId,
          skor_kepercayaan: 5.0,
        });
      } catch (err) {
        console.warn('Peringatan pembuatan profil otomatis:', err.message);
      }
    }

    return data;
  };

  // Fungsi Keluar Akun
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    login,
    daftar,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook kustom untuk mengakses AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
