import { useState, useEffect } from 'react';
import { Check, X, Plus, LogOut, Trash2 } from 'lucide-react';
import { Todo } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TodoList() {

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [user]);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/todos', { headers });
      if (!res.ok) {
        console.error('Failed to load todos');
        setTodos([]);
      } else {
        const data = await res.json();
        setTodos(data || []);
      }
    } catch (err) {
      console.error('Error loading todos:', err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      id: tempId,
      user_id: user?.id || '',
      title: newTodo,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTodos((prev) => [optimisticTodo, ...prev]);
    setNewTodo('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: optimisticTodo.title }),
      });
      if (!res.ok) {
        throw new Error('Error adding todo');
      }
      const data = await res.json();
      // Replace the optimistic todo with the real one (by id)
      setTodos((prev) => prev.map((t) => (t.id === tempId ? data : t)));
      showNotification('New todo added!');
    } catch (err) {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    // Optimistically update UI
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() } : t
      )
    );
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) {
        throw new Error('Error updating todo');
      }
      const data = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? data : t)));
      showNotification('Todo updated!');
    } catch (err) {
      // Revert optimistic update
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistically remove from UI
    const prevTodos = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error('Error deleting todo');
      }
      showNotification('Todo deleted!');
    } catch (err) {
      setTodos(prevTodos);
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-green-500 font-mono text-xl">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {notification && (
        <div className="fixed top-4 right-4 border-2 border-green-500 bg-black p-4 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] animate-pulse z-50">
          <p className="text-green-400 font-mono text-sm">{notification}</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="border-4 border-green-500 bg-black p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-green-500 font-mono">TODO.EXE</h1>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 font-mono text-sm border-2 border-red-600 hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
          <p className="text-green-400 font-mono text-sm mb-4">{user?.email}</p>

          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Enter new task..."
              className="flex-1 bg-black border-2 border-green-500 text-green-400 px-4 py-2 font-mono focus:outline-none focus:border-green-300 placeholder:text-green-700"
            />
            <button
              type="submit"
              className="bg-green-500 text-black px-6 py-2 font-mono font-bold border-2 border-green-500 hover:bg-green-400 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              ADD
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="border-2 border-green-500 bg-black p-8 text-center">
              <p className="text-green-600 font-mono">No todos yet. Add one above!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="border-2 border-green-500 bg-black p-4 hover:border-green-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleTodo(todo)}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-green-500 hover:border-green-400'
                      }`}
                      title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.completed && <Check size={16} className="text-black" />}
                    </button>
                    <span
                      className={`font-mono ${
                        todo.completed
                          ? 'text-green-600 line-through'
                          : 'text-green-400'
                      }`}
                      style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                    >
                      {todo.title || <span className="text-red-500">(No title)</span>}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-green-700 font-mono">
                      Created: {new Date(todo.created_at).toLocaleString()}
                    </span>
                    {todo.completed && (
                      <span className="text-xs text-green-600 font-mono">Completed</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-400 border-2 border-red-500 hover:border-red-400 p-1 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {todos.length > 0 && (
          <div className="mt-6 border-2 border-green-500 bg-black p-4">
            <p className="text-green-400 font-mono text-sm text-center">
              TOTAL: {todos.length} | COMPLETED: {todos.filter((t) => t.completed).length} |
              PENDING: {todos.filter((t) => !t.completed).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
