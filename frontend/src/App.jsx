import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import UserProfile from './components/UserProfile';
import MicButton from './components/MicButton';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col">
              <UserProfile user={user} onLogout={() => setUser(null)} />
              <main className="flex-1 flex items-center justify-center">
                <MicButton />
              </main>
            </div>
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/callback"
        element={<Callback onLoginSuccess={setUser} />}
      />
    </Routes>
  );
}

export default App;
