
import React, { useState, useEffect, useMemo } from 'react';
import { Student, GradeData, Classroom } from '../types';
import { getClasses, getStudentsByClass, getGradeByStudent, saveGrade, getUserProfile } from '../services/storageService';
import { KKM, WEIGHTS, SCHOOL_NAME, KEMENAG_LOGO_URL, KOP_ADDRESS } from '../constants';

export const GradingSheet: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeData>>({});
  
  // Save status indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const clsStudents = getStudentsByClass(selectedClass);
      setStudents(clsStudents);
      const gradeMap: Record<string, GradeData> = {};
      clsStudents.forEach(s => {
        gradeMap[s.id] = getGradeByStudent(s.id);
      });
      setGrades(gradeMap);
    }
  }, [selectedClass]);

  const triggerAutoSave = (updatedGrade: GradeData) => {
      setSaveStatus('saving');
      saveGrade(updatedGrade);
      setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }, 600);
  };

  const handleGradeChange = (studentId: string, field: 'formatif' | 'sumatif', index: number, value: string) => {
    const numVal = parseFloat(value) || 0;
    const currentGrade = { ...grades[studentId] };
    if (field === 'formatif') {
      const newF = [...currentGrade.formatif];
      newF[index] = numVal;
      currentGrade.formatif = newF;
    } else {
      const newS = [...currentGrade.sumatif];
      newS[index] = numVal;
      currentGrade.sumatif = newS;
    }
    setGrades(prev => ({ ...prev, [studentId]: currentGrade }));
    triggerAutoSave(currentGrade);
  };

  const handleSasChange = (studentId: string, field: 'sasNonTes' | 'sasTes', value: string) => {
    const numVal = parseFloat(value) || 0;
    const currentGrade = { ...grades[studentId], [field]: numVal };
    setGrades(prev => ({ ...prev, [studentId]: currentGrade }));
    triggerAutoSave(currentGrade);
  };

  const getLetterGrade = (score: number) => {
      if (score >= 90) return { letter: 'A', color: 'bg-success' };
      if (score >= 80) return { letter: 'B', color: 'bg-primary' };
      if (score >= 70) return { letter: 'C', color: 'bg-info text-dark' };
      if (score >= 60) return { letter: 'D', color: 'bg-warning text-dark' };
      return { letter: 'E', color: 'bg-danger' };
  };

  // Automated Calculations & Ranking
  const calculatedData = useMemo(() => {
    const processed = students.map(s => {
      const g = grades[s.id];
      if (!g) return null;

      const validF = g.formatif.filter(n => n > 0);
      const avgF = validF.length > 0 ? validF.reduce((a, b) => a + b, 0) / validF.length : 0;

      const validS = g.sumatif.filter(n => n > 0);
      const avgS = validS.length > 0 ? validS.reduce((a, b) => a + b, 0) / validS.length : 0;

      const sas = (g.sasNonTes + g.sasTes) / 2;

      const final = (avgF * WEIGHTS.FORMATIF) + (avgS * WEIGHTS.SUMATIF) + (sas * WEIGHTS.SAS);
      const isPassing = final >= KKM;
      const letter = getLetterGrade(final);

      return {
        ...s,
        g,
        avgF,
        avgS,
        sas,
        final,
        isPassing,
        letter
      };
    });

    const validProcessed = processed.filter(p => p !== null) as NonNullable<typeof processed[0]>[];
    const sortedByScore = [...validProcessed].sort((a, b) => b.final - a.final);
    const rankMap: Record<string, number> = {};
    sortedByScore.forEach((item, index) => {
        rankMap[item.id] = index + 1;
    });

    return validProcessed.map(item => ({
        ...item,
        rank: rankMap[item.id]
    }));

  }, [students, grades]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <div>
          <h2 className="text-dark fw-bold">Input & Rekap Nilai</h2>
          <p className="text-muted mb-0">Kelola nilai Formatif, Sumatif, dan SAS Siswa</p>
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
                <div className="d-flex align-items-center gap-2 border-start ps-3 ms-2">
                    {saveStatus === 'saving' && <span className="text-warning small fw-bold">⏳ Menyimpan...</span>}
                    {saveStatus === 'saved' && <span className="text-success small fw-bold">✅ Tersimpan</span>}
                </div>
             )}
        </div>
      </div>

      {selectedClass && (
        <div className="card shadow border-0 mb-5">
          <div className="card-body p-0">
            <div className="table-responsive" style={{maxHeight: '75vh'}}>
              <table className="table table-bordered mb-0 align-middle text-center" style={{fontSize: '0.9rem'}}>
                <thead className="sticky-header">
                  {/* ROW 1: KATEGORI UTAMA */}
                  <tr style={{borderBottom: '2px solid white'}}>
                    <th rowSpan={2} className="align-middle col-sticky-no bg-header-dark text-white">NO</th>
                    <th rowSpan={2} className="align-middle col-sticky-name text-start bg-header-dark text-white">NAMA SISWA</th>
                    <th colSpan={8} className="align-middle sticky-header bg-header-formatif text-white py-2" style={{letterSpacing: '1px'}}>FORMATIF (40%)</th>
                    <th colSpan={5} className="align-middle sticky-header bg-header-sumatif text-white py-2" style={{letterSpacing: '1px'}}>SUMATIF (30%)</th>
                    <th colSpan={2} className="align-middle sticky-header bg-header-sas text-white py-2" style={{letterSpacing: '1px'}}>SAS (30%)</th>
                    <th colSpan={3} className="align-middle sticky-header bg-header-result text-white py-2" style={{letterSpacing: '1px'}}>HASIL AKHIR</th>
                  </tr>
                  
                  {/* ROW 2: SUB-HEADER (F1, S1, dst) */}
                  <tr>
                     {[1,2,3,4,5,6,7,8].map(i => <th key={`f${i}`} className="sticky-header bg-sub-formatif" style={{minWidth: '50px'}}>F{i}</th>)}
                     {[1,2,3,4,5].map(i => <th key={`s${i}`} className="sticky-header bg-sub-sumatif" style={{minWidth: '50px'}}>S{i}</th>)}
                     <th className="sticky-header bg-sub-sas" style={{minWidth: '65px'}}>Non</th>
                     <th className="sticky-header bg-sub-sas" style={{minWidth: '65px'}}>Tes</th>
                     
                     <th className="sticky-header bg-light fw-bold text-dark border-bottom" style={{minWidth: '70px'}}>Nilai</th>
                     <th className="sticky-header bg-light fw-bold text-dark border-bottom">Pred</th>
                     <th className="sticky-header bg-light fw-bold text-dark border-bottom" style={{minWidth: '80px'}}>Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedData.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="col-sticky-no fw-bold text-secondary">{idx + 1}</td>
                      <td className="col-sticky-name text-start fw-bold text-dark">{row.name}</td>
                      
                      {/* Formatif Inputs */}
                      {row.g.formatif.map((val, i) => (
                        <td key={`f-${i}`} className="p-1 bg-light">
                          <input type="number" className="form-control form-control-sm border table-input text-center p-1" 
                                 value={val || ''} min={0} max={100}
                                 onChange={e => handleGradeChange(row.id, 'formatif', i, e.target.value)} />
                        </td>
                      ))}

                      {/* Sumatif Inputs */}
                      {row.g.sumatif.map((val, i) => (
                        <td key={`s-${i}`} className="p-1 bg-light">
                          <input type="number" className="form-control form-control-sm border table-input text-center p-1" 
                                 value={val || ''} min={0} max={100}
                                 onChange={e => handleGradeChange(row.id, 'sumatif', i, e.target.value)} />
                        </td>
                      ))}

                      {/* SAS Inputs */}
                      <td className="p-1 bg-light"><input type="number" className="form-control form-control-sm border table-input text-center p-1" value={row.g.sasNonTes || ''} onChange={e => handleSasChange(row.id, 'sasNonTes', e.target.value)} /></td>
                      <td className="p-1 bg-light"><input type="number" className="form-control form-control-sm border table-input text-center p-1" value={row.g.sasTes || ''} onChange={e => handleSasChange(row.id, 'sasTes', e.target.value)} /></td>

                      {/* Results */}
                      <td className="fw-bold bg-white border-start" style={{fontSize: '1rem'}}>{row.final.toFixed(0)}</td>
                      <td className={`text-white fw-bold ${row.letter.color}`}>{row.letter.letter}</td>
                      <td className="bg-white">
                          {row.isPassing ? <span className="badge bg-success">Tuntas</span> : <span className="badge bg-danger">Remidi</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="card-footer bg-white border-top p-3">
                <div className="row text-center text-muted small">
                    <div className="col-md-3 border-end">
                        <strong className="text-primary d-block mb-1">FORMATIF (40%)</strong>
                        Tugas Harian & Keaktifan
                    </div>
                    <div className="col-md-3 border-end">
                        <strong className="text-warning text-opacity-75 d-block mb-1" style={{color: '#fd7e14'}}>SUMATIF (30%)</strong>
                        Ulangan Harian / Materi
                    </div>
                    <div className="col-md-3 border-end">
                        <strong className="text-danger d-block mb-1">SAS (30%)</strong>
                        Sumatif Akhir Semester (Ujian)
                    </div>
                    <div className="col-md-3">
                        <strong className="text-success d-block mb-1">KKM: {KKM}</strong>
                        Batas Ketuntasan Minimal
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
