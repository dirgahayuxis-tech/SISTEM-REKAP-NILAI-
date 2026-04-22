import React, { useState } from 'react';
import { SCHOOL_NAME, APP_NAME } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '230894') {
      onLogin();
    } else {
      setError('Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden" 
         style={{
             backgroundColor: '#0b3d26',
             backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px), radial-gradient(#d4af37 0.5px, #0b3d26 0.5px)',
             backgroundSize: '30px 30px',
             backgroundPosition: '0 0, 15px 15px'
         }}>
      
      {/* Decorative background glow */}
      <div className="position-absolute" 
           style={{
               width: '800px', 
               height: '800px', 
               background: 'radial-gradient(circle, rgba(21, 87, 36, 0.6) 0%, rgba(11, 61, 38, 0) 70%)', 
               top: '50%', 
               left: '50%', 
               transform: 'translate(-50%, -50%)',
               zIndex: 0,
               pointerEvents: 'none'
           }}>
      </div>

      <div className="card shadow-lg p-0 border-0" style={{maxWidth: '420px', width: '90%', borderRadius: '20px', zIndex: 1, overflow: 'hidden'}}>
        {/* Header Islami */}
        <div className="card-header text-center py-4 position-relative" style={{backgroundColor: '#0f5132', borderBottom: '4px solid #d4af37'}}>
             <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm position-relative" 
                  style={{width: '80px', height: '80px', marginTop: '-10px', border: '3px solid #d4af37'}}>
                <span style={{fontSize: '2.5rem'}}>🕌</span>
             </div>
             <h4 className="fw-bold font-arabic text-white mt-3 mb-1" style={{letterSpacing: '1px'}}>{APP_NAME}</h4>
             <p className="text-white-50 small mb-0 font-arabic">{SCHOOL_NAME}</p>
        </div>

        <div className="card-body p-4 bg-white">
          <div className="text-center mb-4">
            <h5 className="text-dark fw-bold font-arabic mb-1" style={{color: '#d4af37'}}>Ahlan Wa Sahlan</h5>
            <p className="text-muted small">Silakan login untuk mengakses sistem</p>
          </div>
          
          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-4">
                <label className="form-label text-uppercase small fw-bold text-secondary" style={{fontSize: '0.75rem'}}>Password Guru</label>
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">🔑</span>
                    <input 
                        type="password" 
                        className="form-control form-control-lg border-start-0 bg-light" 
                        placeholder="Masukan Kode Akses"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{fontSize: '1rem'}}
                    />
                </div>
            </div>
            
            {error && (
                <div className="alert alert-danger py-2 small text-center border-0 bg-danger bg-opacity-10 text-danger mb-4">
                    ⚠️ {error}
                </div>
            )}
            
            <button 
                type="submit" 
                className="btn w-100 btn-lg fw-bold text-white shadow-sm" 
                style={{
                    backgroundColor: '#d4af37', 
                    border: 'none',
                    backgroundImage: 'linear-gradient(to right, #d4af37, #b8962e)'
                }}
            >
                MASUK SISTEM
            </button>
          </form>
        </div>
        
        {/* Footer dengan Hadits/Quote */}
        <div className="card-footer bg-light text-center py-3 border-0">
             <small className="text-muted fst-italic d-block px-3" style={{fontSize: '0.75rem', lineHeight: '1.4'}}>
                "Barangsiapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju surga."
             </small>
             <div className="mt-2" style={{height: '2px', width: '50px', background: '#d4af37', margin: '0 auto'}}></div>
        </div>
      </div>
    </div>
  );
};