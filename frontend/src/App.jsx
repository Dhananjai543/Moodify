import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import UserProfile from './components/UserProfile';
import MicButton from './components/MicButton';
import TranscriptEditor from './components/TranscriptEditor';
import GenerateButton from './components/GenerateButton';
import MoodLoader from './components/MoodLoader';

function App() {
  const [user, setUser] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [inputMode, setInputMode] = useState('voice');
  const [step, setStep] = useState('record');

  const handleReRecord = () => {
    setTranscript('');
    setInputMode('voice');
    setStep('record');
  };

  const handleConfirm = (text) => {
    setTranscript(text);
    setStep('confirmed');
  };

  const handleGenerate = () => {
    setStep('generating');
  };

  const handleEdit = () => {
    setStep('record');
  };

  const renderStep = () => {
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
