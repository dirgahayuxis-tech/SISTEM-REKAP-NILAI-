
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClassManager } from './components/ClassManager';
import { StudentManager } from './components/StudentManager';
import { GradingSheet } from './components/GradingSheet';
import { AttendanceSheet } from './components/AttendanceSheet';
import { JournalManager } from './components/JournalManager';
import { TeachingMaterials } from './components/TeachingMaterials';
import { AITools } from './components/AITools';
import { Login } from './components/Login';
import { ProfileManager } from './components/ProfileManager';
import { ViewState, UserProfile } from './types';
import { getUserProfile } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  
  // Simulate checking session on mount
  useEffect(() => {
    const session = localStorage.getItem('ar_app_session');
    if (session === 'active') {
      setIsAuthenticated(true);
      setCurrentView(ViewState.DASHBOARD);
      // Load fresh profile
      setUserProfile(getUserProfile());
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('ar_app_session', 'active');
    setIsAuthenticated(true);
    setCurrentView(ViewState.DASHBOARD);
    setUserProfile(getUserProfile());
  };

  const handleLogout = () => {
    localStorage.removeItem('ar_app_session');
    setIsAuthenticated(false);
    setCurrentView(ViewState.LOGIN);
  };

  const handleProfileUpdate = (updated: UserProfile) => {
      setUserProfile(updated);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.CLASSES:
        return <ClassManager />;
      case ViewState.STUDENTS:
        return <StudentManager />;
      case ViewState.GRADING:
        return <GradingSheet />;
      case ViewState.ATTENDANCE:
        return <AttendanceSheet />;
      case ViewState.JOURNAL:
        return <JournalManager />;
      case ViewState.MATERIALS:
        return <TeachingMaterials />;
      case ViewState.AI_TOOLS:
        return <AITools />;
      case ViewState.PROFILE:
        return <ProfileManager userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout}
        userProfile={userProfile}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
