import { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } from '../auth/pkce';
import { buildAuthUrl } from '../services/spotify';

export default function Login() {
  const handleLogin = async () => {
    const verifier = generateCodeVerifier();
    storeCodeVerifier(verifier);
    const challenge = await generateCodeChallenge(verifier);
    window.location.href = buildAuthUrl(challenge);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-4">
          Mood<span className="text-[#1DB954]">ify</span>
        </h1>
        <p className="text-gray-400 text-xl sm:text-2xl mb-10 max-w-md">
          Speak your mood, get a playlist.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-3.5 px-10 rounded-full text-lg transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Get Started with Spotify
        </button>
      </section>

      {/* How it works */}
      <section className="pb-16 px-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-500 mb-10">
          How it works
        </h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#1DB954]">
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
                <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">Speak</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tell us how you feel. Use your voice or type it out.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#1DB954]">
                <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 .55 2.02L3.3 13.27a1 1 0 0 0 .26 1.39l2.12 1.42a1 1 0 0 0 1.24-.1l4.3-4.05A4 4 0 1 0 12 2Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                <path d="M19.5 13a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM7 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">AI Analyzes</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our AI reads your mood and picks songs that match your vibe.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#1DB954]">
                <path d="M15 2H9a1 1 0 0 0-1 1v14a1 1 0 0 0 1.5.87L12 16.3l2.5 1.57A1 1 0 0 0 16 17V3a1 1 0 0 0-1-1Z" />
                <path d="M5 5a1 1 0 0 0-1 1v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a1 1 0 0 0-1-1h-1v12a3 3 0 0 1-1.66 2.68 3 3 0 0 1-3.17-.18L12 18.54l-2.17 1.36A3 3 0 0 1 6 17.64V5Z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">Playlist Created</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A real Spotify playlist lands in your account, ready to play.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
