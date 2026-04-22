
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storageService';

interface ProfileManagerProps {
  userProfile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ userProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Auto-Save Effect with Debounce
  useEffect(() => {
    if (isEditing) {
        // Jangan simpan jika data sama persis
        if (JSON.stringify(formData) === JSON.stringify(userProfile)) return;

        setSaveStatus('saving');
        const handler = setTimeout(() => {
            saveUserProfile(formData);
            onProfileUpdate(formData);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 800); // Wait 800ms after typing stops

        return () => clearTimeout(handler);
    }
  }, [formData, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fungsi untuk Memproses Foto (Resize & Compress) agar muat di LocalStorage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith('image/')) {
            alert('Mohon upload file gambar yang valid.');
            return;
        }

        const resizeAndCompressImage = (imageFile: File): Promise<string> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400; // Maksimal ukuran sisi 400px (Cukup untuk avatar)
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                        } else {
                            resolve(readerEvent.target?.result as string);
                        }
                    };
                    img.src = readerEvent.target?.result as string;
                };
                reader.readAsDataURL(imageFile);
            });
        };

        const compressedPhoto = await resizeAndCompressImage(file);
        
        // Immediate save for photo
        const updatedProfile = { ...formData, photo: compressedPhoto };
        setFormData(updatedProfile);
        saveUserProfile(updatedProfile);
        onProfileUpdate(updatedProfile);
        
      } catch (error) {
          console.error("Gagal memproses gambar:", error);
          alert("Terjadi kesalahan saat memproses gambar.");
      }
    }
  };

  const triggerFileInput = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; 
          fileInputRef.current.click();
      }
  };

  // --- BACKUP & RESTORE LOGIC ---
  const handleDownloadBackup = () => {
    const keys = ['ar_classes', 'ar_students', 'ar_grades', 'ar_attendance', 'ar_journal', 'ar_user_profile'];
    const backup: Record<string, any> = {};
    
    keys.forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw) backup[k] = JSON.parse(raw);
    });

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BACKUP_NILAI_MTSN2_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const data = JSON.parse(json);
            
            if (!data.ar_classes && !data.ar_students) {
                alert('File tidak valid! Pastikan file adalah hasil backup dari aplikasi ini.');
                return;
            }

            if (confirm('PERINGATAN: Fitur ini akan MENIMPA (MENGHAPUS) semua data yang ada saat ini dengan data dari file backup.\n\nApakah Anda yakin ingin melanjutkan?')) {
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });
                alert('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.');
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal membaca file backup. Pastikan format file benar (JSON).');
        }
    };
    reader.readAsText(file);
    if (restoreInputRef.current) restoreInputRef.current.value = ''; 
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 text-dark font-arabic">Profil Pengguna</h2>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 overflow-hidden">
            <div className="card-header bg-success text-white p-4 text-center position-relative" style={{backgroundImage: 'linear-gradient(45deg, #0f5132, #198754)'}}>
               {/* Decorative Circle Background */}
               <div style={{
                   position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', 
                   width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', 
                   borderRadius: '50%', zIndex: 0
               }}></div>
               
               <div className="position-relative" style={{zIndex: 1}}>
                   <div className="mb-3 d-inline-block p-1 bg-white rounded-circle shadow position-relative">
                        {formData.photo ? (
                            <img 
                                src={formData.photo} 
                                alt="Profile" 
                                className="rounded-circle object-fit-cover" 
                                style={{width: '120px', height: '120px'}}
                            />
                        ) : (
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary" style={{width: '120px', height: '120px', fontSize: '3rem'}}>
                                👤
                            </div>
                        )}
                        
                        {isEditing && (
                            <button 
                                type="button"
                                onClick={triggerFileInput}
                                className="btn btn-sm btn-warning position-absolute bottom-0 end-0 rounded-circle border border-white shadow-sm"
                                style={{width: '35px', height: '35px', padding: 0}}
                                title="Ganti Foto"
                            >
                                📷
                            </button>
                        )}
                   </div>
                   <h3 className="font-arabic mb-0">{formData.name}</h3>
                   <p className="opacity-75 mb-0">{formData.role}</p>
               </div>
            </div>

            <div className="card-body p-4">
              {!isEditing ? (
                <>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="text-muted small text-uppercase fw-bold mb-1">Nama Lengkap</label>
                    <div className="fs-5 fw-bold text-dark border-bottom pb-2">{userProfile.name}</div>
                  </div>
                  <div className="col-md-6">
                     <label className="text-muted small text-uppercase fw-bold mb-1">NIP</label>
                     <div className="fs-5 fw-bold text-dark border-bottom pb-2">{userProfile.nip || '-'}</div>
                  </div>
                  <div className="col-md-6">
                     <label className="text-muted small text-uppercase fw-bold mb-1">Jabatan</label>
                     <div className="fs-5 fw-bold text-dark border-bottom pb-2">{userProfile.role}</div>
                  </div>
                  <div className="col-md-6">
                     <label className="text-muted small text-uppercase fw-bold mb-1">Status Akun</label>
                     <div className="fs-5 fw-bold text-success border-bottom pb-2">✅ Aktif</div>
                  </div>
                  
                  <div className="col-12 text-center mt-4">
                    <button className="btn btn-primary px-5" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profil
                    </button>
                  </div>
                </div>

                {/* AREA BACKUP DATA */}
                <div className="mt-5 pt-4 border-top">
                    <h5 className="text-dark font-arabic mb-3">💾 Keamanan Data</h5>
                    <div className="alert alert-info border-0 shadow-sm">
                        <small>
                            Data tersimpan otomatis di browser ini. Agar data aman saat pindah perangkat atau jika laptop di-reset, silakan <strong>Download Backup</strong> secara berkala.
                        </small>
                    </div>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button onClick={handleDownloadBackup} className="btn btn-outline-success">
                            ⬇️ Download Backup Data (.json)
                        </button>
                        
                        <div className="position-relative">
                             <button className="btn btn-outline-warning text-dark" onClick={() => restoreInputRef.current?.click()}>
                                ⬆️ Restore Data dari File
                            </button>
                            <input 
                                type="file" 
                                ref={restoreInputRef} 
                                className="d-none" 
                                accept=".json" 
                                onChange={handleRestoreBackup}
                            />
                        </div>
                    </div>
                </div>
                </>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}>
                   <div className="row g-3">
                       <div className="col-12 text-center mb-3">
                           <button 
                                type="button" 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={triggerFileInput}
                            >
                                📷 Ganti Foto
                           </button>
                           <small className="d-block text-muted mt-2">Format: JPG/PNG. Ukuran akan otomatis disesuaikan.</small>
                           <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="d-none" 
                                accept="image/*"
                           />
                       </div>

                       <div className="col-md-12">
                           <label className="form-label">Nama Lengkap & Gelar</label>
                           <input 
                                type="text" 
                                name="name"
                                className="form-control" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                required 
                           />
                       </div>

                       <div className="col-md-6">
                           <label className="form-label">NIP</label>
                           <input 
                                type="text" 
                                name="nip"
                                className="form-control" 
                                value={formData.nip} 
                                onChange={handleInputChange} 
                           />
                       </div>

                       <div className="col-md-6">
                           <label className="form-label">Jabatan</label>
                           <input 
                                type="text" 
                                name="role"
                                className="form-control" 
                                value={formData.role} 
                                onChange={handleInputChange} 
                           />
                       </div>
                   </div>

                   <div className="d-flex gap-3 justify-content-end mt-4 align-items-center">
                       {saveStatus === 'saving' && <span className="text-warning small fw-bold">⏳ Menyimpan...</span>}
                       {saveStatus === 'saved' && <span className="text-success small fw-bold">✅ Tersimpan</span>}
                       
                       <button type="button" className="btn btn-success px-4" onClick={() => setIsEditing(false)}>
                           Selesai (Tutup)
                       </button>
                   </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
