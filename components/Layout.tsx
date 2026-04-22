
import React, { useState } from 'react';
import { ViewState, UserProfile } from '../types';
import { APP_NAME, SCHOOL_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
  userProfile: UserProfile;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, onLogout, userProfile }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: ViewState.CLASSES, label: 'Data Kelas', icon: '🏫' },
    { id: ViewState.STUDENTS, label: 'Data Siswa', icon: '👨‍🎓' },
    { id: ViewState.GRADING, label: 'Input Nilai', icon: '📝' },
    { id: ViewState.ATTENDANCE, label: 'Absensi', icon: '📅' },
    { id: ViewState.JOURNAL, label: 'Jurnal Guru', icon: '📖' },
    { id: ViewState.MATERIALS, label: 'Perangkat Ajar', icon: '📁' },
    { id: ViewState.AI_TOOLS, label: 'AI Assistant', icon: '🤖' },
  ];

  return (
    <div className="d-flex overflow-hidden">
      {/* Sidebar */}
      <nav className={`sidebar p-3 flex-column ${showSidebar ? 'show-mobile d-flex fixed-top h-100' : 'd-none d-lg-flex col-lg-2'}`}>
        <div className="sidebar-content d-flex flex-column h-100 w-100">
            <div className="text-center mb-4 pt-3 border-bottom border-secondary pb-3">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <span style={{fontSize: '1.8rem'}}>🕌</span>
                </div>
                <h5 className="font-arabic fw-bold text-gold mb-0">{APP_NAME}</h5>
                <small className="text-white-50" style={{fontSize: '0.75rem'}}>{SCHOOL_NAME}</small>
            </div>
            
            <div className="nav flex-column flex-grow-1 overflow-auto">
                {navItems.map((item) => (
                    <button
                    key={item.id}
                    onClick={() => {
                        onViewChange(item.id);
                        setShowSidebar(false);
                    }}
                    className={`nav-link text-start btn btn-link text-decoration-none ${currentView === item.id ? 'active' : ''}`}
                    >
                    <span className="me-2 text-gold">{item.icon}</span> {item.label}
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-3 border-top border-secondary">
                <button 
                    onClick={() => { onViewChange(ViewState.PROFILE); setShowSidebar(false); }}
                    className={`nav-link text-start btn btn-link text-decoration-none mb-2 ${currentView === ViewState.PROFILE ? 'active' : ''}`}
                >
                    <span className="me-2">👤</span> Profil Saya
                </button>
                <button onClick={onLogout} className="nav-link text-danger text-start w-100 btn btn-link text-decoration-none">
                    <span className="me-2">🚪</span> Logout
                </button>
            </div>
        </div>
      </nav>

      {/* Backdrop for mobile */}
      {showSidebar && <div className="fixed-top w-100 h-100 bg-dark opacity-50 d-lg-none" style={{zIndex: 1040}} onClick={() => setShowSidebar(false)}></div>}

      {/* Main Content */}
      <main className="flex-grow-1 bg-light h-100 vh-100 overflow-auto col-lg-10 p-0">
        {/* Header */}
        <header className="navbar navbar-light bg-white shadow-sm px-3 px-md-4 py-2 py-md-3 sticky-top border-bottom border-success border-opacity-25">
          <button className="btn btn-outline-success d-lg-none me-2 p-1 px-2" onClick={() => setShowSidebar(!showSidebar)}>
            ☰
          </button>
          
          <div className="d-flex align-items-center overflow-hidden">
             <div className="text-truncate">
                <h5 className="m-0 font-arabic text-success text-truncate mobile-small">
                    {currentView === ViewState.DASHBOARD ? 'Dashboard Statistik' : 
                    currentView === ViewState.CLASSES ? 'Manajemen Kelas' :
                    currentView === ViewState.STUDENTS ? 'Data Siswa' :
                    currentView === ViewState.GRADING ? 'Input & Rekap Nilai' :
                    currentView === ViewState.ATTENDANCE ? 'Presensi Siswa' :
                    currentView === ViewState.JOURNAL ? 'Jurnal Pembelajaran' :
                    currentView === ViewState.MATERIALS ? 'Perangkat Pembelajaran' :
                    currentView === ViewState.AI_TOOLS ? 'Asisten Cerdas (AI)' :
                    currentView === ViewState.PROFILE ? 'Profil Pengguna' : ''}
                </h5>
                <div className="d-flex align-items-center gap-1 gap-md-2 mt-1">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2" style={{fontSize: '0.6rem'}}>
                        ✅ Auto-Save
                    </span>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 d-none d-sm-inline-block" style={{fontSize: '0.6rem'}}>
                        💾 Lokal
                    </span>
                </div>
             </div>
          </div>

          <div className="ms-auto d-flex align-items-center" onClick={() => onViewChange(ViewState.PROFILE)} style={{cursor: 'pointer'}}>
            <div className="text-end me-2 me-md-3 d-none d-sm-block">
              <div className="fw-bold text-dark font-arabic small">{userProfile.name}</div>
              <small className="text-muted" style={{fontSize: '0.7rem'}}>{userProfile.role}</small>
            </div>
            <div className="rounded-circle border border-2 border-success p-1">
                {userProfile.photo ? (
                    <img src={userProfile.photo} alt="Profile" className="rounded-circle object-fit-cover" style={{width: '32px', height: '32px'}} />
                ) : (
                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                        {userProfile.name.charAt(0)}
                    </div>
                )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 container-fluid">
          {children}
        </div>
      </main>
    </div>
  );
};
