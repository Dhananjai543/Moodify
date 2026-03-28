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
            <div className="min-h-screen bg-gray-950 text-white flex flex-col">
              <UserProfile user={user} onLogout={() => setUser(null)} />
              <main className="flex-1 flex items-center justify-center">
                {renderStep()}
              </main>
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
