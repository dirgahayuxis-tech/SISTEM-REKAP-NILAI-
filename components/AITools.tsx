import React, { useState, useRef } from 'react';
import { editImageWithGemini, searchTeachingResources, SearchResult } from '../services/geminiService';

export const AITools: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'image' | 'search'>('image');
    
    // Image Edit State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMime, setImageMime] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImage(result);
                // Extract base64 part
                setImageMime(file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!selectedImage || !prompt) return;
        setLoadingImage(true);
        try {
            // Remove data URL header for API
            const base64Data = selectedImage.split(',')[1];
            const result = await editImageWithGemini(base64Data, prompt, imageMime);
            setGeneratedImage(result);
        } catch (error) {
            alert("Gagal mengedit gambar. Pastikan API KEY valid.");
        } finally {
            setLoadingImage(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoadingSearch(true);
        try {
            const result = await searchTeachingResources(searchQuery);
            setSearchResult(result);
        } catch (error) {
             alert("Gagal mencari data.");
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <div>
            <h2 className="mb-4 text-dark">Asisten Cerdas (AI)</h2>
            
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'image' ? 'active fw-bold text-success' : 'text-secondary'}`} 
                        onClick={() => setActiveTab('image')}
                    >
                        🖼️ Edit Media Ajar
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'search' ? 'active fw-bold text-success' : 'text-secondary'}`} 
                        onClick={() => setActiveTab('search')}
                    >
                        🔍 Cari Referensi
                    </button>
                </li>
            </ul>

            {activeTab === 'image' && (
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <p className="text-muted mb-4">Upload materi ajar (foto/scan LKS) dan gunakan AI untuk memodifikasinya.</p>
                        
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">Upload Gambar</label>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                        className="form-control"
                                    />
                                </div>
                                {selectedImage && (
                                    <div className="border rounded p-2 text-center bg-light">
                                        <p className="small text-muted mb-1">Original</p>
                                        <img src={selectedImage} alt="Original" className="img-fluid" style={{maxHeight: '300px'}} />
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">Instruksi Edit</label>
                                    <textarea 
                                        className="form-control" 
                                        placeholder="Contoh: Ubah gambar menjadi sketsa pensil, atau hapus background."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        disabled={!selectedImage}
                                        rows={3}
                                    />
                                </div>
                                <button 
                                    onClick={handleGenerateImage}
                                    disabled={loadingImage || !selectedImage || !prompt}
                                    className="btn btn-success w-100 mb-3"
                                >
                                    {loadingImage ? 'Sedang memproses...' : '✨ Proses Gambar'}
                                </button>

                                {generatedImage && (
                                    <div className="border rounded p-2 text-center bg-light">
                                        <p className="small text-muted mb-1">Hasil AI</p>
                                        <img src={generatedImage} alt="Generated" className="img-fluid" style={{maxHeight: '300px'}} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <p className="text-muted">Cari referensi Kurikulum Merdeka, metode pembelajaran Bahasa Arab, atau materi terkini.</p>
                        <div className="input-group mb-4">
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Contoh: Metode fun learning bahasa arab untuk kelas 7"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button 
                                 onClick={handleSearch}
                                 disabled={loadingSearch}
                                 className="btn btn-primary px-4"
                            >
                                {loadingSearch ? '...' : 'Cari'}
                            </button>
                        </div>

                        {searchResult && (
                            <div className="bg-light p-4 rounded border">
                                <div className="mb-3" style={{whiteSpace: 'pre-line'}}>
                                    {searchResult.text}
                                </div>
                                
                                {searchResult.links.length > 0 && (
                                    <div className="border-top pt-3">
                                        <h6 className="text-muted fw-bold text-uppercase small mb-2">Sumber Referensi:</h6>
                                        <ul className="list-unstyled mb-0">
                                            {searchResult.links.map((link, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary d-flex align-items-center">
                                                        <span className="me-2">🔗</span> {link.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};