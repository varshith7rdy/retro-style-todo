import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-green-500 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
          <h1 className="text-4xl font-bold text-green-500 mb-2 font-mono">LOGIN</h1>
          <p className="text-green-400 mb-8 font-mono text-sm">Access your todo list</p>

          {error && (
            <div className="border-2 border-red-500 bg-red-950 p-3 mb-4">
              <p className="text-red-400 font-mono text-sm">{error}</p>
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black font-mono font-bold py-3 px-4 border-2 border-green-500 hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOADING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggle}
              className="text-green-400 hover:text-green-300 font-mono text-sm underline"
            >
              Need an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
