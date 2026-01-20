
import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { storage } from './utils/storage';
import Login from './components/Auth';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.init();
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
