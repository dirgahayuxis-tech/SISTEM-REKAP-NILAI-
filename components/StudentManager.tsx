
import React, { useState, useEffect } from 'react';
import { Student, Classroom, Gender } from '../types';
import { getStudents, saveStudent, deleteStudent, getClasses, getUserProfile } from '../services/storageService';
import { SCHOOL_NAME, KEMENAG_LOGO_URL, KOP_ADDRESS } from '../constants';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const defaultForm = {
    nisn: '', name: '', gender: Gender.L, classId: ''
  };

  const [form, setForm] = useState<Partial<Student>>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
    setClasses(getClasses());

    // Load Draft
    const savedDraft = localStorage.getItem('ar_student_form_draft');
    if (savedDraft) {
        try {
            setForm(JSON.parse(savedDraft));
        } catch(e){}
    }
  }, []);

  // Save Draft automatically
  useEffect(() => {
      if (!editingId) { // Only draft when creating new, not editing
         localStorage.setItem('ar_student_form_draft', JSON.stringify(form));
      }
  }, [form, editingId]);

  const refresh = () => setStudents(getStudents());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.classId) return;

    const student: Student = {
      id: editingId || Date.now().toString(),
      nisn: form.nisn || '',
      name: form.name,
      gender: form.gender || Gender.L,
      classId: form.classId
    };

    saveStudent(student);
    
    // Clear Draft
    setForm({ nisn: '', name: '', gender: Gender.L, classId: form.classId }); // Keep class selected for convenience
    localStorage.removeItem('ar_student_form_draft');
    
    setEditingId(null);
    refresh();
  };

  const handleEdit = (s: Student) => {
    setForm(s);
    setEditingId(s.id);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus data siswa: ${name}?\n\nPERINGATAN: Data nilai dan absensi siswa ini juga akan terhapus permanen.`)) {
      deleteStudent(id);
      refresh();
    }
  };

  // Filter Logic
  const filteredStudents = students.filter(s => {
    const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass ? s.classId === filterClass : true;
    return matchName && matchClass;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Export Functions (PROFESSIONAL FORMAT) ---
  const handleExport = (type: 'excel' | 'word' | 'print') => {
    const userProfile = getUserProfile();
    const className = filterClass ? classes.find(c => c.id === filterClass)?.name : 'Semua Kelas';
    const fileName = `Data_Siswa_${className.replace(/\s+/g, '_')}`;
    const dateStr = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

    // 1. Generate Rows
    let tableRows = '';
    filteredStudents.forEach((s, idx) => {
        tableRows += `
            <tr>
                <td style="text-align:center; vertical-align:middle; border: 1px solid black;">${idx + 1}</td>
                <td style="text-align:center; vertical-align:middle; border: 1px solid black; mso-number-format:'@';">${s.nisn || '-'}</td> 
                <td style="text-align:left; vertical-align:middle; padding-left:5px; border: 1px solid black;">${s.name}</td>
                <td style="text-align:center; vertical-align:middle; border: 1px solid black;">${s.gender}</td>
                <td style="text-align:center; vertical-align:middle; border: 1px solid black;">${classes.find(c => c.id === s.classId)?.name || '-'}</td>
            </tr>
        `;
    });

    // 2. Generate Full HTML Document with KOP
    const contentHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${fileName}</title>
            <style>
                @page { size: A4 portrait; margin: 2cm 2cm 2cm 2cm; }
                body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; line-height: 1.15; }
                
                /* KOP SURAT STYLE */
                .kop-table { width: 100%; border-bottom: 3px double #000; margin-bottom: 20px; }
                .kop-table td { border: none; padding: 0; vertical-align: middle; }
                .kop-logo { width: 90px; text-align: center; }
                .kop-text { text-align: center; }
                .kop-text h4 { margin: 0; font-size: 14pt; font-weight: normal; margin-bottom: 2px; }
                .kop-text h3 { margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .kop-text h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .kop-text p { margin: 0; font-size: 10pt; font-style: italic; }

                /* DATA TABLE */
                table.data-table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 20px; }
                table.data-table th { border: 1px solid #000; padding: 8px 4px; background-color: #f2f2f2; font-weight: bold; text-align: center; vertical-align: middle; }
                table.data-table td { border: 1px solid #000; padding: 5px 4px; font-size: 11pt; }
                
                .title-doc { text-align: center; font-weight: bold; text-decoration: underline; font-size: 14pt; margin-top: 15px; margin-bottom: 5px; }
                .sub-title { text-align: center; margin-bottom: 25px; font-size: 12pt; }
                
                .signature-section { margin-top: 40px; width: 100%; page-break-inside: avoid; }
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

            <div class="title-doc">DATA SISWA TAHUN PELAJARAN 2024/2025</div>
            <div class="sub-title">Kelas: ${className}</div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">NO</th>
                        <th width="20%">NISN</th>
                        <th width="45%">NAMA LENGKAP</th>
                        <th width="10%">L/P</th>
                        <th width="20%">KELAS</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>

            <div class="signature-section">
                <table class="signature-table">
                    <tr>
                        <td width="65%"></td>
                        <td width="35%">
                            Bulukumba, ${dateStr}<br>
                            Wali Kelas / Guru,<br>
                            <br><br><br><br>
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

    let mimeType = '';
    let extension = '';

    if (type === 'excel') {
        mimeType = 'application/vnd.ms-excel';
        extension = 'xls';
    } else if (type === 'word') {
        mimeType = 'application/msword';
        extension = 'doc';
    }

    const blob = new Blob([contentHTML], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    a.click();
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 no-print">
         <h2 className="text-dark mb-0 fw-bold">Data Siswa</h2>
         <div className="dropdown w-100 w-sm-auto">
            <button className="btn btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
                📥 Backup Data
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item" onClick={() => handleExport('excel')}>📊 Export Excel</button></li>
                <li><button className="dropdown-item" onClick={() => handleExport('word')}>📄 Export Word</button></li>
                <li><button className="dropdown-item" onClick={() => handleExport('print')}>🖨️ Print / PDF</button></li>
            </ul>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Input */}
        <div className="col-lg-4 no-print">
          <div className="card shadow-sm border-0">
             <div className="card-header bg-success text-white fw-bold d-flex justify-content-between">
              <span>{editingId ? 'Edit Siswa' : 'Tambah Siswa'}</span>
              {!editingId && form.name && <span className="badge bg-light text-dark small">Draft Saved</span>}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                 <div className="mb-3">
                  <label className="form-label">NISN</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nisn}
                    onChange={e => setForm({...form, nisn: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Jenis Kelamin</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={e => setForm({...form, gender: e.target.value as Gender})}
                  >
                    <option value={Gender.L}>Laki-laki</option>
                    <option value={Gender.P}>Perempuan</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Kelas</label>
                  <select
                    className="form-select"
                    value={form.classId}
                    onChange={e => setForm({...form, classId: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kelas...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1">
                      {editingId ? 'Update' : 'Simpan'}
                    </button>
                     {editingId && (
                        <button 
                            type="button" 
                            onClick={() => { setEditingId(null); setForm(defaultForm); localStorage.removeItem('ar_student_form_draft'); }}
                            className="btn btn-secondary"
                        >
                            Batal
                        </button>
                    )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* List & Search */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
             <div className="card-header bg-white p-3 no-print">
                <div className="row g-2">
                    <div className="col-md-7">
                        <input
                            type="text"
                            placeholder="🔍 Cari nama siswa..."
                            className="form-control"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-5">
                        <select
                            className="form-select"
                            value={filterClass}
                            onChange={e => setFilterClass(e.target.value)}
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
             </div>
             
              <div className="table-responsive">
                <table id="student-table" className="table table-hover table-striped mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                        <th className="ps-3">NISN</th>
                        <th>Nama</th>
                        <th>L/P</th>
                        <th>Kelas</th>
                        <th className="text-end pe-3 no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map(s => (
                        <tr key={s.id}>
                            <td className="ps-3 small text-muted">{s.nisn}</td>
                            <td className="fw-bold">{s.name}</td>
                            <td>{s.gender}</td>
                            <td>
                                <span className="badge bg-light text-dark border">
                                    {classes.find(c => c.id === s.classId)?.name || '-'}
                                </span>
                            </td>
                            <td className="text-end pe-3 no-print">
                                <button onClick={() => handleEdit(s)} className="btn btn-sm btn-link text-decoration-none">Edit</button>
                                <button onClick={() => handleDelete(s.id, s.name)} className="btn btn-sm btn-link text-danger text-decoration-none">Hapus</button>
                            </td>
                        </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-4 text-muted">Tidak ada data siswa ditemukan</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
             
             {/* Pagination */}
             {totalPages > 1 && (
                 <div className="card-footer bg-white d-flex justify-content-end no-print">
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}>Previous</button>
                            </li>
                            {Array.from({length: totalPages}, (_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}>Next</button>
                            </li>
                        </ul>
                    </nav>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
