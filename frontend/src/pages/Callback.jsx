import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieveCodeVerifier, clearCodeVerifier } from '../auth/pkce';
import { exchangeToken, fetchUserProfile } from '../services/spotify';
import { setTokens } from '../auth/tokenStore';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Callback({ onLoginSuccess }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authError = params.get('error');

      if (authError) {
        setError(`Authorization denied: ${authError}`);
        return;
      }

      if (!code) {
        setError('No authorization code found');
        return;
      }

      const verifier = retrieveCodeVerifier();
      if (!verifier) {
        setError('Missing code verifier — please try logging in again');
        return;
      }

      try {
        const tokenData = await exchangeToken(code, verifier);
        console.log('Token response:', { scope: tokenData.scope, token_type: tokenData.token_type, has_access_token: !!tokenData.access_token });
        clearCodeVerifier();
        setTokens(tokenData);

        const profile = await fetchUserProfile(tokenData.access_token);
        onLoginSuccess(profile);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        setError(err.message);
      }
    };

    handleCallback();
  }, [navigate, onLoginSuccess]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-on-surface relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-red-400 text-lg font-body">{error}</p>
          <a href="/" className="text-emerald-glow hover:text-emerald-dim transition-colors font-body">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-on-surface relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '3px solid transparent',
              borderTopColor: '#00FF87',
              animation: 'spin-slow 1s linear infinite',
            }}
          />
        </div>
        <p className="text-on-surface-variant text-lg font-body">Logging you in...</p>
      </div>
    </div>
  );
}
