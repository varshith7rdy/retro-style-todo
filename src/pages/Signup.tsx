import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Signup({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmail('');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-green-500 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
          <h1 className="text-4xl font-bold text-green-500 mb-2 font-mono">SIGN UP</h1>
          <p className="text-green-400 mb-8 font-mono text-sm">Create your account</p>

          {error && (
            <div className="border-2 border-red-500 bg-red-950 p-3 mb-4">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="border-2 border-green-500 bg-green-950 p-3 mb-4">
              <p className="text-green-400 font-mono text-sm">Account created! You can now login.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-green-500 font-mono mb-2 text-sm">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border-2 border-green-500 text-green-400 px-4 py-2 font-mono focus:outline-none focus:border-green-300"
                required
              />
            </div>

            <div>
              <label className="block text-green-500 font-mono mb-2 text-sm">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border-2 border-green-500 text-green-400 px-4 py-2 font-mono focus:outline-none focus:border-green-300"
                required
                minLength={6}
              />
              <p className="text-green-600 text-xs font-mono mt-1">Min. 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black font-mono font-bold py-3 px-4 border-2 border-green-500 hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOADING...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggle}
              className="text-green-400 hover:text-green-300 font-mono text-sm underline"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
