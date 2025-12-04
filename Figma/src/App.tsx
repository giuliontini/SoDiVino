import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { WinePreferencesInput } from './components/WinePreferencesInput';
import { MainChatInterface } from './components/MainChatInterface';
import { PersonaSelector } from './components/PersonaSelector';
import { WineListUpload } from './components/WineListUpload';
import { ResultsPage } from './components/ResultsPage';
import { WineDetailsModal } from './components/WineDetailsModal';

type Page = 'landing' | 'preferences' | 'main' | 'persona' | 'upload' | 'results' | 'settings';
export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string;
  traits: string[];
}

export interface Wine {
  id: string;
  name: string;
  winery: string;
  year: number;
  region: string;
  country: string;
  type: string;
  price: number;
  matchScore: number;
  flavorProfile: string[];
  tastingNotes: string;
  pairings: string[];
  imageUrl: string;
  reasoning: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isNewUser, setIsNewUser] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [userPreferences, setUserPreferences] = useState<string>('');

  // Check if user is returning
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited === 'true') {
      setIsNewUser(false);
      setCurrentPage('main');
    }
  }, []);

  const handleStart = () => {
    if (isNewUser) {
      setCurrentPage('preferences');
    } else {
      setCurrentPage('main');
    }
  };

  const handlePreferencesSubmit = (preferences: string) => {
    setUserPreferences(preferences);
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('userPreferences', preferences);
    setIsNewUser(false);
    setCurrentPage('main');
  };

  const handleLogout = () => {
    // Don't clear hasVisited, just go back to main
    setCurrentPage('main');
  };

  const handleSettingsClick = () => {
    setCurrentPage('settings');
  };

  const handlePreferencesClick = () => {
    setCurrentPage('preferences');
  };

  // Legacy handlers for old flow (kept for compatibility)
  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setCurrentPage('upload');
  };

  const handleWineListUpload = () => {
    setCurrentPage('results');
  };

  const handleWineSelect = (wine: Wine) => {
    setSelectedWine(wine);
  };

  const handleCloseModal = () => {
    setSelectedWine(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6]">
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <LandingPage key="landing" onStart={handleStart} />
        )}
        {currentPage === 'preferences' && (
          <WinePreferencesInput key="preferences" onSubmit={handlePreferencesSubmit} />
        )}
        {currentPage === 'main' && (
          <MainChatInterface 
            key="main" 
            onLogout={handleLogout}
            onSettingsClick={handleSettingsClick}
            onPreferencesClick={handlePreferencesClick}
          />
        )}
        {currentPage === 'settings' && (
          <SettingsPage key="settings" onBack={() => setCurrentPage('main')} />
        )}
        {/* Legacy pages - kept for compatibility */}
        {currentPage === 'persona' && (
          <PersonaSelector key="persona" onSelectPersona={handlePersonaSelect} />
        )}
        {currentPage === 'upload' && (
          <WineListUpload 
            key="upload" 
            persona={selectedPersona!}
            onUploadComplete={handleWineListUpload} 
          />
        )}
        {currentPage === 'results' && (
          <ResultsPage 
            key="results" 
            persona={selectedPersona!}
            onWineSelect={handleWineSelect}
          />
        )}
      </AnimatePresence>

      <WineDetailsModal 
        wine={selectedWine}
        isOpen={!!selectedWine}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// Settings Page Component
function SettingsPage({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-8"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#8b4049] hover:text-[#6d323a] transition-colors"
        >
          ← Back to Main
        </button>
        <div className="bg-white/60 backdrop-blur-lg border border-white/80 rounded-3xl p-8">
          <h1 className="text-[#2c2c2c] font-serif mb-6">Settings</h1>
          <p className="text-[#6b6b6b]">Settings options coming soon...</p>
        </div>
      </div>
    </motion.div>
  );
}