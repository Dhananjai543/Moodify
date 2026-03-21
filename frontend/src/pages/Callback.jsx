import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieveCodeVerifier, clearCodeVerifier } from '../auth/pkce';
import { exchangeToken, fetchUserProfile } from '../services/spotify';
import { setTokens } from '../auth/tokenStore';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <a href="/" className="text-[#1DB954] hover:underline">Back to login</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <p className="text-gray-400 text-lg">Logging you in...</p>
    </div>
  );
}
