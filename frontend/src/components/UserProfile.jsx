import { clearTokens } from '../auth/tokenStore';

export default function UserProfile({ user, onLogout }) {
  const profileImage = user.images?.[0]?.url;

  const handleLogout = () => {
    clearTokens();
    onLogout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-4">
        {profileImage ? (
          <img
            src={profileImage}
            alt={user.display_name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold">
            {user.display_name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <h2 className="text-2xl font-bold">{user.display_name}</h2>
        <p className="text-gray-400">Logged in to Spotify</p>
        <button
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-white py-2 px-6 rounded-full transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
