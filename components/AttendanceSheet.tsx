
import React, { useState, useEffect } from 'react';
import { Classroom, Student, AttendanceData } from '../types';
import { getClasses, getStudentsByClass, getAttendanceByStudent, saveAttendance, getUserProfile } from '../services/storageService';
import { ATTENDANCE_OPTIONS, TOTAL_MEETINGS, SCHOOL_NAME, KEMENAG_LOGO_URL, KOP_ADDRESS } from '../constants';

export const AttendanceSheet: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceData>>({});
  
  // Save status indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const clsStudents = getStudentsByClass(selectedClass);
      setStudents(clsStudents);
      const attMap: Record<string, AttendanceData> = {};
      clsStudents.forEach(s => {
        attMap[s.id] = getAttendanceByStudent(s.id);
      });
      setAttendance(attMap);
    }
  }, [selectedClass]);

  // Helper untuk efek visual menyimpan
  const triggerAutoSave = (updatedAttendance: AttendanceData) => {
      setSaveStatus('saving');
      saveAttendance(updatedAttendance);
      
      // Simulasi delay sedikit agar user melihat status "Saving..."
      setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000); 
      }, 600);
  };

  const handleStatusChange = (studentId: string, meetingIndex: number, status: string) => {
    const current = { ...attendance[studentId] };
    const newMeetings = [...current.meetings];
    newMeetings[meetingIndex] = status;
    current.meetings = newMeetings;
    
    setAttendance(prev => ({ ...prev, [studentId]: current }));
    triggerAutoSave(current);
  };

  // --- FITUR BARU: SET SEMUA HADIR ---
  // (Disembunyikan dari UI, fungsi tetap ada jika dibutuhkan nanti)
  const handleMarkAllPresent = (meetingIndex: number) => {
    if(!confirm(`Set semua siswa menjadi 'Hadir' (H) untuk pertemuan ke-${meetingIndex + 1}?`)) return;

    const newAttendanceMap = { ...attendance };
    students.forEach(s => {
        const current = { ...newAttendanceMap[s.id] };
        // Hanya update jika belum diisi atau ingin ditimpa
        const newMeetings = [...current.meetings];
        newMeetings[meetingIndex] = 'H';
        current.meetings = newMeetings;
        
        newAttendanceMap[s.id] = current;
        saveAttendance(current); // Save to storage per student
    });
    setAttendance(newAttendanceMap);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const countStatus = (meetings: string[], status: string) => meetings.filter(m => m === status).length;

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'H': return 'bg-att-H';
      case 'I': return 'bg-att-I';
      case 'S': return 'bg-att-S';
      case 'A': return 'bg-att-A';
      default: return 'bg-white';
    }
  };

  // --- Export Functions (PROFESSIONAL FORMAT) ---
  const handleExport = (type: 'excel' | 'word' | 'print') => {
    if (!selectedClass) return;
    const userProfile = getUserProfile();
    const className = classes.find(c => c.id === selectedClass)?.name || 'Kelas';
    const dateStr = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    const fileName = `Absensi_${className.replace(/\s+/g, '_')}`;

    // 1. Generate Table Header for Meetings
    let meetingHeaders = '';
    for (let i = 1; i <= TOTAL_MEETINGS; i++) {
        meetingHeaders += `<th width="20" style="text-align:center; font-size:8pt; border:1px solid #000; background-color: #fff;">${i}</th>`;
    }

    // 2. Generate Rows
    let tableRows = '';
    students.forEach((s, idx) => {
        const att = attendance[s.id];
        let meetingCells = '';
        if (att) {
            att.meetings.forEach(m => {
                meetingCells += `<td style="text-align:center; font-size:9pt; border:1px solid #000;">${m || '-'}</td>`;
            });
            const h = countStatus(att.meetings, 'H');
            const i = countStatus(att.meetings, 'I');
            const sakit = countStatus(att.meetings, 'S');
            const a = countStatus(att.meetings, 'A');

            tableRows += `
                <tr>
                    <td style="text-align:center; border:1px solid #000;">${idx + 1}</td>
                    <td style="text-align:left; border:1px solid #000; white-space:nowrap; padding-left: 5px;">${s.name}</td>
                    ${meetingCells}
                    <td style="text-align:center; font-weight:bold; border:1px solid #000;">${h}</td>
                    <td style="text-align:center; border:1px solid #000;">${i}</td>
                    <td style="text-align:center; border:1px solid #000;">${sakit}</td>
                    <td style="text-align:center; color:red; font-weight: bold; border:1px solid #000;">${a}</td>
                </tr>
            `;
        }
    });

    // 3. Generate Content
    const contentHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>${fileName}</title>
            <style>
                @page { size: A4 landscape; margin: 1cm; }
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

                table.data-table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 20px; font-size: 9pt; table-layout: fixed; }
                table.data-table th { border: 1px solid #000; padding: 2px; background-color: #d9d9d9; font-weight: bold; text-align: center; vertical-align: middle; }
                table.data-table td { border: 1px solid #000; }
                
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

            <div class="title-doc">REKAP ABSENSI SISWA</div>
            <div class="sub-title">Kelas: ${className} | Tahun Pelajaran 2024/2025</div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th rowspan="2" width="3%">No</th>
                        <th rowspan="2" width="15%">Nama Siswa</th>
                        <th colspan="${TOTAL_MEETINGS}">Pertemuan Ke-</th>
                        <th colspan="4">Rekapitulasi</th>
                    </tr>
                    <tr>
                        ${meetingHeaders}
                        <th width="3%">H</th><th width="3%">I</th><th width="3%">S</th><th width="3%">A</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>

            <div style="margin-bottom: 20px; font-size: 10pt;">
                <strong>Keterangan:</strong> H = Hadir, I = Izin, S = Sakit, A = Alfa
            </div>

            <div class="signature-section">
                <table class="signature-table">
                    <tr>
                        <td width="70%"></td>
                        <td width="30%">
                            Bulukumba, ${dateStr}<br>
                            Guru Mata Pelajaran,<br>
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
        <div>
          <h2 className="text-dark fw-bold">Absensi Siswa</h2>
          <p className="text-muted mb-0">Rekap kehadiran siswa per pertemuan</p>
        </div>
        <div className="d-flex gap-2 align-items-center bg-white p-2 rounded shadow-sm border">
            <span className="fw-bold text-secondary px-2">Pilih Kelas:</span>
            <select 
                className="form-select border-secondary fw-bold"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{minWidth: '150px'}}
            >
                <option value="">-- Pilih --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            {selectedClass && (
                <div className="d-flex align-items-center gap-2 ps-3 border-start">
                    {/* Auto Save Status Indicator */}
                    {saveStatus === 'saving' && <span className="text-warning small fw-bold">⏳ Menyimpan...</span>}
                    {saveStatus === 'saved' && <span className="text-success small fw-bold">✅ Tersimpan</span>}

                    <div className="dropdown">
                        <button className="btn btn-outline-primary dropdown-toggle btn-sm ms-2" type="button" data-bs-toggle="dropdown">
                            📥 Backup Data
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => handleExport('excel')}>📊 Export Excel (Rapi)</button></li>
                            <li><button className="dropdown-item" onClick={() => handleExport('word')}>📄 Export Word (Rapi)</button></li>
                            <li><button className="dropdown-item" onClick={() => handleExport('print')}>🖨️ Print / PDF</button></li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
      </div>

      {selectedClass && (
        <div className="card shadow border-0 mb-5">
          <div className="card-body p-0">
             {/* Legend */}
             <div className="p-3 border-bottom bg-white d-flex gap-3 flex-wrap align-items-center">
                <span className="fw-bold text-dark">Keterangan:</span>
                <span className="badge bg-att-H text-dark border px-3 py-2">H = Hadir</span>
                <span className="badge bg-att-I text-dark border px-3 py-2">I = Izin</span>
                <span className="badge bg-att-S text-dark border px-3 py-2">S = Sakit</span>
                <span className="badge bg-att-A text-dark border px-3 py-2">A = Alfa</span>
             </div>

            <div className="table-responsive" style={{maxHeight: '75vh'}}>
                <table id="attendance-table" className="table table-bordered mb-0 align-middle text-center" style={{fontSize: '0.9rem'}}>
                    <thead className="sticky-header">
                    <tr style={{borderBottom: '2px solid white'}}>
                        <th rowSpan={2} className="align-middle col-sticky-no bg-header-dark text-white">NO</th>
                        <th rowSpan={2} className="align-middle col-sticky-name text-start bg-header-dark text-white">
                            NAMA SISWA (A-Z)
                        </th>
                        <th colSpan={TOTAL_MEETINGS} className="text-center py-2 bg-secondary text-white sticky-header">PERTEMUAN KE-</th>
                        <th colSpan={4} className="text-center bg-header-dark text-white sticky-header">TOTAL</th>
                    </tr>
                    <tr>
                        {Array.from({ length: TOTAL_MEETINGS }).map((_, i) => (
                        <th key={i} className="small text-muted sticky-header bg-light align-bottom p-1 border-bottom" style={{minWidth: '45px'}}>
                            <div className="fw-bold text-dark mb-1">{i + 1}</div>
                        </th>
                        ))}
                        <th className="bg-success text-white sticky-header">H</th>
                        <th className="bg-warning text-dark sticky-header">I</th>
                        <th className="bg-info text-white sticky-header">S</th>
                        <th className="bg-danger text-white sticky-header">A</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.map((s, idx) => {
                        const att = attendance[s.id];
                        if (!att) return null;
                        return (
                        <tr key={s.id}>
                            <td className="col-sticky-no fw-bold text-secondary">{idx + 1}</td>
                            <td className="col-sticky-name text-start fw-bold text-dark">{s.name}</td>
                            {Array.from({ length: TOTAL_MEETINGS }).map((_, i) => (
                            <td key={i} className="p-0 bg-light align-middle">
                                <select 
                                    className={`form-control border-0 clean-select shadow-none w-100 h-100 py-1 ${getStatusClass(att.meetings[i])}`}
                                    style={{fontSize: '0.9rem', height: '35px', borderRadius: 0}}
                                    value={att.meetings[i] || ''}
                                    onChange={(e) => handleStatusChange(s.id, i, e.target.value)}
                                >
                                    <option value="">-</option>
                                    {ATTENDANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </td>
                            ))}
                            <td className="fw-bold bg-white">{countStatus(att.meetings, 'H')}</td>
                            <td className="bg-white">{countStatus(att.meetings, 'I')}</td>
                            <td className="bg-white">{countStatus(att.meetings, 'S')}</td>
                            <td className="fw-bold text-danger bg-white">{countStatus(att.meetings, 'A')}</td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
    