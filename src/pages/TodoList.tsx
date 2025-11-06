import { useState, useEffect } from 'react';
import { Check, X, Plus, LogOut, Trash2 } from 'lucide-react';
import { supabase, Todo } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadTodos();
    subscribeToTodos();
  }, []);

  const loadTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading todos:', error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const subscribeToTodos = () => {
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((current) => [payload.new as Todo, ...current]);
            showNotification('New todo added!');
          } else if (payload.eventType === 'UPDATE') {
            setTodos((current) =>
              current.map((todo) =>
                todo.id === payload.new.id ? (payload.new as Todo) : todo
              )
            );
            showNotification('Todo updated!');
          } else if (payload.eventType === 'DELETE') {
            setTodos((current) => current.filter((todo) => todo.id !== payload.old.id));
            showNotification('Todo deleted!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { error } = await supabase.from('todos').insert({
      title: newTodo,
      user_id: user?.id,
    });

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTodo('');
    }
  };

  const toggleTodo = async (todo: Todo) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed, updated_at: new Date().toISOString() })
      .eq('id', todo.id);

    if (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
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
                    >
                      {todo.completed && <Check size={16} className="text-black" />}
                    </button>
                    <span
                      className={`font-mono ${
                        todo.completed
                          ? 'text-green-600 line-through'
                          : 'text-green-400'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-400 border-2 border-red-500 hover:border-red-400 p-1 transition-colors"
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
