import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import UserProfile from './components/UserProfile';
import MicButton from './components/MicButton';
import TranscriptEditor from './components/TranscriptEditor';
import GenerateButton from './components/GenerateButton';
import MoodLoader from './components/MoodLoader';
import ResultsPage from './components/ResultsPage';
import ErrorToast from './components/ErrorToast';
import AnimatedBackground from './components/AnimatedBackground';
import { analyzeMood, createPlaylist } from './services/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth/tokenStore';

function App() {
  const [user, setUser] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [inputMode, setInputMode] = useState('voice');
  const [step, setStep] = useState('record');
  const [moodData, setMoodData] = useState(null);
  const [error, setError] = useState(null);

  const handleReRecord = () => {
    setTranscript('');
    setInputMode('voice');
    setStep('record');
  };

  const handleConfirm = (text) => {
    setTranscript(text);
    setStep('confirmed');
  };

  const handleGenerate = async () => {
    setStep('generating');
    setError(null);

    try {
      const mood = await analyzeMood(transcript);
      setMoodData(mood);
      setStep('results');
    } catch (err) {
      if (err.code === 'REVOKED') {
        clearTokens();
        setUser(null);
        setStep('record');
        return;
      }
      setError(err.message || 'Something went wrong');
      setStep('confirmed');
    }
  };

  const handleAddToSpotify = async () => {
    const playlist = await createPlaylist({
      access_token: getAccessToken(),
      refresh_token: getRefreshToken(),
      songs: moodData.songs,
      playlist_name: moodData.playlist_name,
      playlist_description: moodData.playlist_description,
      mood: moodData.mood,
    });

    if (playlist.new_access_token) {
      setTokens({ access_token: playlist.new_access_token, refresh_token: getRefreshToken(), expires_in: 3600 });
    }

    return playlist;
  };

  const handleEdit = () => {
    setStep('record');
  };

  const handleTryAgain = () => {
    setTranscript('');
    setInputMode('voice');
    setStep('record');
    setMoodData(null);
    setError(null);
  };

  const renderStep = () => {
    if (step === 'results' && moodData) {
      return (
        <ResultsPage
          mood={moodData.mood}
          playlistName={moodData.playlist_name}
          playlistDescription={moodData.playlist_description}
          songs={moodData.songs}
          onAddToSpotify={handleAddToSpotify}
          onTryAgain={handleTryAgain}
          accessToken={getAccessToken()}
        />
      );
    }

    if (step === 'generating') {
      return <MoodLoader />;
    }

    if (step === 'confirmed') {
      return (
        <GenerateButton
          transcript={transcript}
          onGenerate={handleGenerate}
          onEdit={handleEdit}
        />
      );
    }

    if (transcript || inputMode === 'text') {
      return (
        <TranscriptEditor
          transcript={transcript}
          onTranscriptChange={setTranscript}
          onReRecord={handleReRecord}
          onConfirm={handleConfirm}
          isTypingMode={inputMode === 'text'}
        />
      );
    }

    return (
      <MicButton
        onRecordingComplete={setTranscript}
        onTypeInstead={() => setInputMode('text')}
      />
    );
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <div className="min-h-screen text-on-surface flex flex-col relative overflow-hidden">
              <AnimatedBackground />
              {/* Aurora overlays */}
              <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
                <div
                  className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 70%)',
                    animation: 'aurora-drift 12s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute bottom-[-30%] right-[-15%] w-[50vw] h-[50vw] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,237,125,0.04) 0%, transparent 70%)',
                    animation: 'aurora-drift 15s ease-in-out infinite 3s',
                  }}
                />
              </div>
              <div className="relative z-10 flex flex-col min-h-screen">
                <UserProfile user={user} onLogout={() => setUser(null)} />
                <main className="flex-1 flex items-center justify-center">
                  {renderStep()}
                </main>
              </div>
              {error && (
                <ErrorToast
                  message={error}
                  onRetry={handleGenerate}
                  onDismiss={() => setError(null)}
                />
              )}
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
