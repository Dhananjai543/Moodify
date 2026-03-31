import { clearTokens } from '../auth/tokenStore';

export default function UserProfile({ user, onLogout }) {
  const profileImage = user.images?.[0]?.url;

  const handleLogout = () => {
    clearTokens();
    onLogout();
  };

  return (
    <header className="glass-header flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt={user.display_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-glow/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-headline bg-emerald-deep/30 text-emerald-glow ring-2 ring-emerald-glow/20">
              {user.display_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-glow border-2 border-surface" />
        </div>
        <span className="text-sm font-medium font-body text-on-surface">{user.display_name}</span>
      </div>
      <button
        onClick={handleLogout}
        className="btn-ghost text-xs py-1.5 px-5 rounded-full cursor-pointer font-body"
      >
        Logout
      </button>
    </header>
  );
}
