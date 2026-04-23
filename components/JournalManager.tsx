
import React, { useState, useEffect } from 'react';
import { JournalEntry, Classroom } from '../types';
import { getClasses, getJournals, saveJournal, getUserProfile } from '../services/storageService';
import { SCHOOL_NAME, KEMENAG_LOGO_URL, KOP_ADDRESS } from '../constants';

export const JournalManager: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Status penyimpanan draft
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saved'>('idle');

  const defaultForm = {
    date: new Date().toISOString().split('T')[0],
    attendanceSummary: { hadir: 0, izin: 0, sakit: 0, alfa: 0 }
  };

  const [form, setForm] = useState<Partial<JournalEntry>>(defaultForm);

  useEffect(() => {
    setClasses(getClasses());
    setEntries(getJournals().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // LOAD DRAFT: Cek apakah ada tulisan yang belum disimpan sebelumnya
    const savedDraft = localStorage.getItem('ar_journal_draft');
    if (savedDraft) {
        try {
            const parsed = JSON.parse(savedDraft);
            setForm(parsed);
            // Jika ada draft, otomatis buka formnya
            if (Object.keys(parsed).length > 2) setShowForm(true); 
        } catch (e) {
            console.error("Gagal memuat draft jurnal", e);
        }
    }
  }, []);

  // AUTO-SAVE DRAFT: Setiap kali form berubah, simpan ke local storage sementara
  useEffect(() => {
      if (showForm) {
          localStorage.setItem('ar_journal_draft', JSON.stringify(form));
          setDraftStatus('saved');
          const timer = setTimeout(() => setDraftStatus('idle'), 1000);
          return () => clearTimeout(timer);
      }
  }, [form, showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic || !form.classId) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: form.date!,
      classId: form.classId!,
      topic: form.topic!,
      activity: form.activity || '',
      notes: form.notes || '',
      attendanceSummary: {
        hadir: Number(form.attendanceSummary?.hadir) || 0,
        izin: Number(form.attendanceSummary?.izin) || 0,
        sakit: Number(form.attendanceSummary?.sakit) || 0,
        alfa: Number(form.attendanceSummary?.alfa) || 0,
      }
    };

    saveJournal(entry);
    setEntries([entry, ...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Reset Form & Hapus Draft
    setShowForm(false);
    setForm(defaultForm);
    localStorage.removeItem('ar_journal_draft');
    
    alert("Jurnal berhasil disimpan permanen.");
  };

  // --- Export Functions (PROFESSIONAL FORMAT) ---
  const handleExport = (type: 'excel' | 'word' | 'print') => {
    const userProfile = getUserProfile();
    const fileName = `Jurnal_Mengajar_${new Date().toISOString().split('T')[0]}`;
    const dateStr = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

    let tableRows = '';
    entries.forEach((entry, idx) => {
        const className = classes.find(c => c.id === entry.classId)?.name || '-';
        const entryDate = new Date(entry.date).toLocaleDateString('id-ID');
        tableRows += `
            <tr>
                <td style="text-align:center; border:1px solid #000;">${idx + 1}</td>
                <td style="text-align:center; border:1px solid #000;">${entryDate}</td>
                <td style="text-align:center; border:1px solid #000;">${className}</td>
                <td style="border:1px solid #000;">${entry.topic}</td>
                <td style="border:1px solid #000;">${entry.activity}</td>
                <td style="text-align:center; font-size: 10pt; border:1px solid #000;">H:${entry.attendanceSummary.hadir}, I:${entry.attendanceSummary.izin}, S:${entry.attendanceSummary.sakit}, A:${entry.attendanceSummary.alfa}</td>
                <td style="border:1px solid #000;">${entry.notes}</td>
            </tr>
        `;
    });

    const contentHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>${fileName}</title>
            <style>
                @page { size: A4 portrait; margin: 2cm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; }
                
                /* KOP SURAT STYLE */
                .kop-table { width: 100%; border-bottom: 3px double #000; margin-bottom: 20px; }
                .kop-table td { border: none; padding: 0; vertical-align: middle; }
                .kop-logo { width: 90px; text-align: center; }
                .kop-text { text-align: center; }
                .kop-text h4 { margin: 0; font-size: 14pt; font-weight: normal; margin-bottom: 2px; }
                .kop-text h3 { margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .kop-text h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .kop-text p { margin: 0; font-size: 10pt; font-style: italic; }

                table.data-table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 20px; font-size: 11pt; }
                table.data-table th { border: 1px solid #000; padding: 5px; vertical-align: top; background-color: #f2f2f2; font-weight: bold; text-align: center; }
                table.data-table td { border: 1px solid #000; padding: 5px; vertical-align: top; }
                
                .title-doc { text-align: center; font-weight: bold; text-decoration: underline; font-size: 12pt; margin-top: 10px; margin-bottom: 5px; }
                .sub-title { text-align: center; margin-bottom: 20px; }

                .signature-section { margin-top: 30px; width: 100%; page-break-inside: avoid; }
                .signature-table { width: 100%; border: none; }
                .signature-table td { border: none; text-align: center; vertical-align: top; padding: 0; }
            </style>
        </head>
        <body>
            <!-- KOP SURAT -->
            <table class="kop-table">
                <tr>
                    <td class="kop-logo">
                        <img src="${KEMENAG_LOGO_URL}" width="80" height="auto" alt="Logo">
                    </td>
                    <td class="kop-text">
                        <h4>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h4>
                        <h3>KANTOR KEMENTERIAN AGAMA KABUPATEN BULUKUMBA</h3>
                        <h2>${SCHOOL_NAME.toUpperCase()}</h2>
                        <p>${KOP_ADDRESS}</p>
                    </td>
                </tr>
            </table>

            <div class="title-doc">JURNAL MENGAJAR GURU</div>
            <div class="sub-title">Mata Pelajaran: Bahasa Arab | Tahun Pelajaran 2024/2025</div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="12%">Tanggal</th>
                        <th width="8%">Kelas</th>
                        <th width="20%">Materi / TP</th>
                        <th width="25%">Kegiatan Pembelajaran</th>
                        <th width="15%">Absensi</th>
                        <th width="15%">Catatan</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>

            <div class="signature-section">
                <table class="signature-table">
                    <tr>
                        <td width="50%">
                            Mengetahui,<br>
                            Kepala Madrasah,<br><br><br><br>
                            <b><u>( ........................... )</u></b><br>
                            NIP. ...........................
                        </td>
                        <td width="50%">
                            Bulukumba, ${dateStr}<br>
                            Guru Mata Pelajaran,<br><br><br><br>
                            <strong><u>${userProfile.name}</u></strong><br>
                            NIP. ${userProfile.nip || '-'}
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;

    if (type === 'print') {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(contentHTML);
            doc.close();
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }
        setTimeout(() => document.body.removeChild(iframe), 1000);
        return;
    }

    let mimeType = type === 'excel' ? 'application/vnd.ms-excel' : 'application/msword';
    let extension = type === 'excel' ? 'xls' : 'doc';

    const blob = new Blob([contentHTML], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    a.click();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h2 className="text-dark">Jurnal Mengajar Harian</h2>
        <div className="d-flex gap-2">
            <button onClick={() => setShowForm(!showForm)} className={`btn ${showForm ? 'btn-secondary' : 'btn-success'}`}>
                {showForm ? 'Batal' : '+ Tulis Jurnal'}
            </button>
            <div className="dropdown">
                <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    📥 Backup Data
                </button>
                <ul className="dropdown-menu">
                    <li><button className="dropdown-item" onClick={() => handleExport('excel')}>📊 Export Excel (Rapi)</button></li>
                    <li><button className="dropdown-item" onClick={() => handleExport('word')}>📄 Export Word (Rapi)</button></li>
                    <li><button className="dropdown-item" onClick={() => handleExport('print')}>🖨️ Print / PDF</button></li>
                </ul>
            </div>
        </div>
      </div>

      {showForm && (
        <div className="card shadow mb-4 border-top border-success border-4 no-print animate__animated animate__fadeIn">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-center fw-bold mb-0">{SCHOOL_NAME} - Form Jurnal</h5>
                {draftStatus === 'saved' && <span className="badge bg-light text-success border">✅ Auto-Saved (Draft)</span>}
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Tanggal</label>
                        <input type="date" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Kelas</label>
                        <select className="form-select" value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} required>
                            <option value="">Pilih Kelas</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Materi / TP</label>
                        <input type="text" className="form-control" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} required />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Kegiatan Pembelajaran</label>
                        <textarea className="form-control" rows={3} value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="form-label mb-1">Rekap Absensi (Jumlah Siswa)</label>
                        <div className="row g-2">
                            <div className="col">
                                <input type="number" placeholder="Hadir" className="form-control text-center border-success" value={form.attendanceSummary?.hadir} onChange={e => setForm({...form, attendanceSummary: {...form.attendanceSummary!, hadir: parseInt(e.target.value)}})} />
                            </div>
                            <div className="col">
                                <input type="number" placeholder="Izin" className="form-control text-center border-info" value={form.attendanceSummary?.izin} onChange={e => setForm({...form, attendanceSummary: {...form.attendanceSummary!, izin: parseInt(e.target.value)}})} />
                            </div>
                            <div className="col">
                                <input type="number" placeholder="Sakit" className="form-control text-center border-warning" value={form.attendanceSummary?.sakit} onChange={e => setForm({...form, attendanceSummary: {...form.attendanceSummary!, sakit: parseInt(e.target.value)}})} />
                            </div>
                            <div className="col">
                                <input type="number" placeholder="Alfa" className="form-control text-center border-danger" value={form.attendanceSummary?.alfa} onChange={e => setForm({...form, attendanceSummary: {...form.attendanceSummary!, alfa: parseInt(e.target.value)}})} />
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Catatan Khusus</label>
                        <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <button type="submit" className="btn btn-success w-100">Simpan Jurnal Permanen</button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3">
        {entries.length === 0 ? (
            <div className="text-center py-5 text-muted">
                Belum ada data jurnal. Silakan buat jurnal baru.
            </div>
        ) : (
            entries.map(entry => (
            <div key={entry.id} className="col-12">
                <div className="card shadow-sm h-100 hover-shadow break-inside-avoid">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
                            <div>
                                <h5 className="fw-bold text-success mb-1">{entry.topic}</h5>
                                <small className="text-muted">
                                    {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • 
                                    Kelas: {classes.find(c => c.id === entry.classId)?.name || '?'}
                                </small>
                            </div>
                        </div>
                        <p className="card-text text-dark mb-3" style={{whiteSpace: 'pre-line'}}>
                            <strong>Kegiatan:</strong> {entry.activity}
                        </p>
                        <div className="bg-light p-2 rounded d-flex gap-3 small mb-2">
                            <span className="fw-bold text-success">✅ H: {entry.attendanceSummary.hadir}</span>
                            <span className="fw-bold text-info">ℹ️ I: {entry.attendanceSummary.izin}</span>
                            <span className="fw-bold text-warning">🏥 S: {entry.attendanceSummary.sakit}</span>
                            <span className="fw-bold text-danger">❌ A: {entry.attendanceSummary.alfa}</span>
                        </div>
                        {entry.notes && (
                            <div className="alert alert-warning py-1 px-2 small mb-0 fst-italic">
                                Note: {entry.notes}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
