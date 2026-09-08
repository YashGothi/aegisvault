import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import GeneratorModal from './components/GeneratorModal';
import AuditModal from './components/AuditModal';

export default function App() {
  const { user, loading } = useAuth();

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Triggering new item modal from Generator
  const [itemModalOpenFromGen, setItemModalOpenFromGen] = useState(false);
  const [prefilledPassword, setPrefilledPassword] = useState('');

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleUseGeneratedPassword = (pw) => {
    setPrefilledPassword(pw);
    setItemModalOpenFromGen(true);
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p>Initializing secure vault session...</p>
      </div>
    );
  }

  return (
    <>
      {/* Background Ambient Glows */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>
      <div className="glow-sphere sphere-3"></div>

      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenGenerator={() => setGeneratorModalOpen(true)}
        onOpenAudit={() => setAuditModalOpen(true)}
      />

      <main className="main-layout">
        {!user ? (
          <Hero onOpenAuth={handleOpenAuth} />
        ) : (
          <Dashboard
            isItemModalOpen={itemModalOpenFromGen}
            prefillPassword={prefilledPassword}
            onItemModalClose={() => {
              setItemModalOpenFromGen(false);
              setPrefilledPassword('');
            }}
            onStatsUpdated={setDashboardStats}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Generator Modal */}
      <GeneratorModal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        onUsePassword={handleUseGeneratedPassword}
      />

      {/* Security Audit Modal */}
      <AuditModal
        isOpen={auditModalOpen}
        stats={dashboardStats}
        onClose={() => setAuditModalOpen(false)}
      />
    </>
  );
}
