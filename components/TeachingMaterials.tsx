
import React, { useState, useEffect } from 'react';
import { TeachingMaterial } from '../types';
import { getMaterials, saveMaterial, deleteMaterial } from '../services/storageService';

export const TeachingMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<TeachingMaterial | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'RPP/Modul' | 'Silabus/ATP' | 'Media' | 'Lainnya'>('RPP/Modul');
  const [type, setType] = useState<'PDF' | 'DOC' | 'LINK'>('PDF');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [linkInput, setLinkInput] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = getMaterials();
    // Sort by date (newest first)
    setMaterials(data.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let fileData = '';
    let fileSize = '';
    let fileName = '';

    if (type === 'LINK') {
      fileData = linkInput;
      // Ensure link has protocol
      if (!/^https?:\/\//i.test(fileData)) {
          fileData = 'https://' + fileData;
      }
      fileSize = 'External';
      fileName = 'Link Web/Drive';
    } else if (fileInput) {
      // Limit file size for LocalStorage (e.g., 500KB limit to be safe)
      if (fileInput.size > 500 * 1024) {
        alert('Maaf, untuk penyimpanan lokal browser, ukuran file dibatasi maksimal 500KB. Gunakan opsi "Link Eksternal" (Google Drive) untuk file besar.');
        setLoading(false);
        return;
      }

      fileName = fileInput.name;
      fileSize = (fileInput.size / 1024).toFixed(1) + ' KB';
      
      // Convert to Base64
      fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileInput);
      });
    }

    const newMaterial: TeachingMaterial = {
      id: Date.now().toString(),
      title,
      category,
      type,
      uploadDate: new Date().toISOString().split('T')[0],
      fileData,
      fileName,
      fileSize
    };

    saveMaterial(newMaterial);
    refreshData();
    resetForm();
    setLoading(false);
    setShowForm(false);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('RPP/Modul');
    setType('PDF');
    setFileInput(null);
    setLinkInput('');
  };

  const handleDelete = (id: string) => {
    if(confirm('Hapus perangkat ajar ini?')) {
        deleteMaterial(id);
        refreshData();
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'PDF': return '📕';
        case 'DOC': return '📘';
        case 'LINK': return '🔗';
        default: return '📄';
    }
  };

  const isPreviewable = (item: TeachingMaterial) => {
      // Allow preview for PDF
      if (item.type === 'PDF') return true;
      // Allow preview for DOC *IF* it is our simulated HTML format
      if (item.type === 'DOC' && item.fileData?.startsWith('data:text/html')) return true;
      // Allow preview for HTML data uris generally
      if (item.fileData && item.fileData.startsWith('data:text/html')) return true;
      
      return false;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="text-dark fw-bold">Perangkat Pembelajaran</h2>
            <p className="text-muted mb-0">Arsip RPP, Modul Ajar, ATP, dan Media Pembelajaran.</p>
        </div>
        <button 
            className={`btn ${showForm ? 'btn-secondary' : 'btn-success'} shadow-sm`}
            onClick={() => setShowForm(!showForm)}
        >
            {showForm ? 'Batal' : '➕ Upload Perangkat'}
        </button>
      </div>

      {showForm && (
        <div className="card shadow border-0 mb-4 border-start border-4 border-success animate__animated animate__fadeIn">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Upload Dokumen Baru</h5>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Judul Perangkat</label>
                        <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Contoh: Modul Ajar Bab 2" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Kategori</label>
                        <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                            <option>RPP/Modul</option>
                            <option>Silabus/ATP</option>
                            <option>Media</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tipe File</label>
                        <div className="btn-group w-100" role="group">
                            <input type="radio" className="btn-check" name="filetype" id="type1" checked={type === 'PDF'} onChange={() => setType('PDF')} />
                            <label className="btn btn-outline-danger" htmlFor="type1">PDF</label>

                            <input type="radio" className="btn-check" name="filetype" id="type2" checked={type === 'DOC'} onChange={() => setType('DOC')} />
                            <label className="btn btn-outline-primary" htmlFor="type2">Word</label>

                            <input type="radio" className="btn-check" name="filetype" id="type3" checked={type === 'LINK'} onChange={() => setType('LINK')} />
                            <label className="btn btn-outline-secondary" htmlFor="type3">Link / Drive</label>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label">File / Link</label>
                        {type === 'LINK' ? (
                            <input type="url" className="form-control" placeholder="https://drive.google.com/..." value={linkInput} onChange={e => setLinkInput(e.target.value)} required />
                        ) : (
                            <input type="file" className="form-control" accept={type === 'PDF' ? '.pdf' : '.doc,.docx'} onChange={handleFileChange} required />
                        )}
                        {type !== 'LINK' && <div className="form-text text-danger small">* Maks 500KB (Gunakan Link untuk file besar)</div>}
                    </div>

                    <div className="col-12 text-end">
                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Dokumen'}
                        </button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewMaterial && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050}} tabIndex={-1}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style={{height: '95vh'}}>
            <div className="modal-content h-100 shadow-lg">
              <div className="modal-header bg-light py-2">
                <div className="d-flex align-items-center">
                    <span className="me-2 fs-5">{getIcon(previewMaterial.type)}</span>
                    <h6 className="modal-title fw-bold text-truncate mb-0" style={{maxWidth: '80%'}}>
                        {previewMaterial.title}
                    </h6>
                </div>
                <button type="button" className="btn-close" onClick={() => setPreviewMaterial(null)}></button>
              </div>
              <div className="modal-body p-0 bg-dark d-flex align-items-center justify-content-center">
                 {/* Support for both PDF (base64) and HTML (data:text/html) previews via iframe */}
                 <iframe 
                      src={previewMaterial.fileData} 
                      width="100%" 
                      height="100%" 
                      style={{border: 'none', backgroundColor: '#fff'}}
                      title="Document Preview"
                 >
                   <p className="text-white text-center mt-5">Browser Anda tidak mendukung preview dokumen ini.</p>
                 </iframe>
              </div>
              <div className="modal-footer py-2 bg-light justify-content-between">
                 <span className="text-muted small">File: {previewMaterial.fileName}</span>
                 <div>
                    <a href={previewMaterial.fileData} download={previewMaterial.fileName} className="btn btn-success btn-sm me-2">
                        ⬇️ Download Asli
                    </a>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreviewMaterial(null)}>Tutup</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Materials */}
      <div className="row g-3">
        {materials.length === 0 ? (
            <div className="col-12">
                <div className="text-center py-5 text-muted bg-white rounded border border-dashed">
                    <span className="fs-1 d-block mb-2">📂</span>
                    <p className="mb-0">Belum ada perangkat ajar yang diupload.</p>
                </div>
            </div>
        ) : (
            materials.map(item => (
                <div key={item.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                        <div className="card-body d-flex flex-column">
                            <div className="d-flex align-items-start justify-content-between mb-2">
                                <span className="fs-1">{getIcon(item.type)}</span>
                                <div className="dropdown">
                                    <button 
                                        className="btn btn-light btn-sm rounded-circle text-danger" 
                                        onClick={() => handleDelete(item.id)}
                                        title="Hapus File"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h6 className="fw-bold text-dark mb-1 text-truncate" title={item.title}>{item.title}</h6>
                            <div className="mb-3">
                                <span className="badge bg-light text-secondary border me-1">{item.category}</span>
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>{item.fileSize}</small>
                            </div>
                            
                            <div className="mt-auto">
                                <small className="text-muted d-block mb-2" style={{fontSize: '0.75rem'}}>
                                    📅 {new Date(item.uploadDate).toLocaleDateString('id-ID')}
                                </small>
                                
                                {item.type === 'LINK' ? (
                                    <a href={item.fileData} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm w-100 fw-bold">
                                        🔗 Buka Link
                                    </a>
                                ) : (
                                    <div className="d-flex gap-2">
                                        {/* Show Preview button if content allows it */}
                                        {isPreviewable(item) ? (
                                            <button 
                                                onClick={() => setPreviewMaterial(item)} 
                                                className="btn btn-outline-success btn-sm w-100 fw-bold"
                                            >
                                                👁️ Lihat File
                                            </button>
                                        ) : (
                                            /* Disable preview for non-previewable files (empty placeholders or corrupt) */
                                            (!item.fileData) && (
                                                <button disabled className="btn btn-light btn-sm w-100 text-muted">File Kosong</button>
                                            )
                                        )}
                                        
                                        {item.fileData && (
                                            <a 
                                                href={item.fileData} 
                                                download={item.fileName} 
                                                className={`btn btn-sm w-100 fw-bold ${isPreviewable(item) ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                            >
                                                {isPreviewable(item) ? '⬇️ Unduh' : '⬇️ Download Word'}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
