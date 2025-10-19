import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !supabaseUrl || !supabaseKey) {
        setError('All fields are required.');
        return;
    }
    setLoading(true);
    const result = await signup(username, password, supabaseUrl, supabaseKey);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };
  
  const formInputStyle = "w-full px-3 py-2 mt-1 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Create Your Account</h1>
            <p className="text-textSecondary mt-2">Connect to your own database for full control.</p>
        </div>

        <div className="bg-primary-light border-l-4 border-primary text-primary-dark p-4 rounded-md">
            <p className="text-sm">
                First time setup? Follow our guide to create your database.
                <Link to="/instructions" className="font-bold underline ml-2 whitespace-nowrap">
                    View Instructions
                </Link>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={formInputStyle} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={formInputStyle} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary">Supabase Project URL</label>
            <input type="text" placeholder="https://xxxxxxxx.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} className={formInputStyle} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary">Supabase Anon Key</label>
            <input type="text" placeholder="eyJhbGciOi..." value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} className={formInputStyle} required />
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-hover disabled:bg-gray-400">
                {loading ? 'Verifying & Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
         <p className="text-sm text-center text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
      </div>
    </div>
  );
};

export default SignupPage;