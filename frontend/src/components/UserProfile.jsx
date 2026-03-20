import { clearTokens } from '../auth/tokenStore';

export default function UserProfile({ user, onLogout }) {
  const profileImage = user.images?.[0]?.url;

  const handleLogout = () => {
    clearTokens();
    onLogout();
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-gray-800">
      <div className="flex items-center gap-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt={user.display_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {user.display_name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{user.display_name}</span>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-white py-1.5 px-4 rounded-full transition-colors cursor-pointer"
      >
        Logout
      </button>
    </header>
  );
}
