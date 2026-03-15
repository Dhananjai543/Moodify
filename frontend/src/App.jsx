import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import UserProfile from './components/UserProfile';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <UserProfile user={user} onLogout={() => setUser(null)} /> : <Login />}
      />
      <Route
        path="/callback"
        element={<Callback onLoginSuccess={setUser} />}
      />
    </Routes>
  );
}

export default App;
