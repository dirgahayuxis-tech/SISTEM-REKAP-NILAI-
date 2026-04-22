
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getClasses, getStudents, getGrades } from '../services/storageService';
import { KKM, WEIGHTS } from '../constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    passRate: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0
  });

  const [barData, setBarData] = useState<any>(null);
  const [pieData, setPieData] = useState<any>(null);
  const [distData, setDistData] = useState<any>(null);

  useEffect(() => {
    const classes = getClasses();
    const students = getStudents();
    const grades = getGrades();

    let totalScore = 0;
    let passedCount = 0;
    let failedCount = 0;
    let gradedCount = 0;
    let maxScore = 0;
    let minScore = 100;

    const classLabels: string[] = [];
    const classAvgScores: number[] = [];

    // Distribution Buckets
    let distA = 0; // 90-100
    let distB = 0; // 80-89
    let distC = 0; // 72-79
    let distD = 0; // < 72

    classes.forEach(cls => {
      classLabels.push(cls.name);
      const clsStudents = students.filter(s => s.classId === cls.id);
      let clsTotal = 0;
      let clsGraded = 0;

      clsStudents.forEach(student => {
        const grade = grades.find(g => g.studentId === student.id);
        if (grade) {
          const avgF = grade.formatif.reduce((a, b) => a + b, 0) / (grade.formatif.filter(n => n > 0).length || 1);
          const avgS = grade.sumatif.reduce((a, b) => a + b, 0) / (grade.sumatif.filter(n => n > 0).length || 1);
          const sas = (grade.sasNonTes + grade.sasTes) / 2;
          const final = (avgF * WEIGHTS.FORMATIF) + (avgS * WEIGHTS.SUMATIF) + (sas * WEIGHTS.SAS);
          
          if (final > 0) {
            totalScore += final;
            clsTotal += final;
            gradedCount++;
            clsGraded++;
            
            if (final > maxScore) maxScore = final;
            if (final < minScore) minScore = final;

            if (final >= KKM) {
              passedCount++;
            } else {
              failedCount++;
            }

            // Distribution
            if (final >= 90) distA++;
            else if (final >= 80) distB++;
            else if (final >= KKM) distC++;
            else distD++;
          }
        }
      });
      
      classAvgScores.push(clsGraded > 0 ? parseFloat((clsTotal / clsGraded).toFixed(1)) : 0);
    });

    setStats({
      totalClasses: classes.length,
      totalStudents: students.length,
      passRate: gradedCount > 0 ? Math.round((passedCount / gradedCount) * 100) : 0,
      averageScore: gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0,
      highestScore: gradedCount > 0 ? Math.round(maxScore) : 0,
      lowestScore: gradedCount > 0 && minScore !== 100 ? Math.round(minScore) : 0
    });

    // Bar Chart: Rata-rata Kelas
    setBarData({
      labels: classLabels,
      datasets: [
        {
          label: 'Rata-rata Nilai',
          data: classAvgScores,
          backgroundColor: 'rgba(25, 135, 84, 0.7)',
          borderColor: 'rgba(25, 135, 84, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    });

    // Pie Chart: Ketuntasan
    setPieData({
      labels: ['Tuntas (>= KKM)', 'Remedial (< KKM)'],
      datasets: [
        {
          data: [passedCount, failedCount],
          backgroundColor: [
            'rgba(25, 135, 84, 0.8)', // Islamic Green
            'rgba(220, 53, 69, 0.8)', // Red
          ],
          borderColor: ['#fff', '#fff'],
          borderWidth: 2,
        },
      ],
    });

    // Bar Chart: Distribusi Predikat
    setDistData({
      labels: ['A (90-100)', 'B (80-89)', 'C (72-79)', 'D (< 72)'],
      datasets: [
        {
          label: 'Jumlah Siswa',
          data: [distA, distB, distC, distD],
          backgroundColor: [
            'rgba(25, 135, 84, 0.9)', // A
            'rgba(13, 110, 253, 0.8)', // B
            'rgba(255, 193, 7, 0.8)', // C
            'rgba(220, 53, 69, 0.8)', // D
          ],
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    });

  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
         <h2 className="text-dark font-arabic mb-0">Dashboard Statistik</h2>
         <span className="text-muted small">Tahun Pelajaran 2024/2025</span>
      </div>

      {/* Info Cards Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{borderLeft: '4px solid #0f5132'}}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-muted text-uppercase small mb-1" style={{fontSize: '0.7rem'}}>Total Kelas</h6>
                    <h2 className="mb-0 fw-bold text-dark">{stats.totalClasses}</h2>
                  </div>
                  <div className="bg-success bg-opacity-10 text-success p-2 p-md-3 rounded-circle">
                    🏫
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{borderLeft: '4px solid #198754'}}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-muted text-uppercase small mb-1" style={{fontSize: '0.7rem'}}>Total Siswa</h6>
                    <h2 className="mb-0 fw-bold text-dark">{stats.totalStudents}</h2>
                  </div>
                  <div className="bg-success bg-opacity-10 text-success p-2 p-md-3 rounded-circle">
                    👨‍🎓
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{borderLeft: '4px solid #ffc107'}}>
            <div className="card-body p-3">
               <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-muted text-uppercase small mb-1" style={{fontSize: '0.7rem'}}>Rata-rata</h6>
                    <h2 className="mb-0 fw-bold text-dark">{stats.averageScore}</h2>
                  </div>
                  <div className="bg-warning bg-opacity-10 text-warning p-2 p-md-3 rounded-circle">
                    📊
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
           <div className="card h-100 border-0 shadow-sm" style={{borderLeft: '4px solid #0dcaf0'}}>
            <div className="card-body p-3">
               <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title text-muted text-uppercase small mb-1" style={{fontSize: '0.7rem'}}>Ketuntasan</h6>
                    <h2 className="mb-0 fw-bold text-dark">{stats.passRate}%</h2>
                  </div>
                  <div className="bg-info bg-opacity-10 text-info p-2 p-md-3 rounded-circle">
                    ✅
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Row 2 (Details) */}
       <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100 bg-success text-white" style={{backgroundImage: 'linear-gradient(45deg, #198754, #0f5132)'}}>
                  <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                          <h6 className="opacity-75 mb-0 small">Nilai Tertinggi</h6>
                          <div className="display-6 fw-bold">{stats.highestScore}</div>
                      </div>
                      <div className="text-end">
                           <h6 className="opacity-75 mb-0 small">Nilai Terendah</h6>
                           <div className="display-6 fw-bold">{stats.lowestScore}</div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                      <h6 className="text-muted fw-bold mb-2 small">Informasi Kurikulum</h6>
                      <div className="row g-2 text-center">
                          <div className="col-3 border-end">
                              <small className="text-muted d-block" style={{fontSize: '0.65rem'}}>KKM</small>
                              <strong className="text-dark small">{KKM}</strong>
                          </div>
                          <div className="col-3 border-end">
                              <small className="text-muted d-block" style={{fontSize: '0.65rem'}}>Formatif</small>
                              <strong className="text-dark small">{WEIGHTS.FORMATIF * 100}%</strong>
                          </div>
                          <div className="col-3 border-end">
                              <small className="text-muted d-block" style={{fontSize: '0.65rem'}}>Sumatif</small>
                              <strong className="text-dark small">{WEIGHTS.SUMATIF * 100}%</strong>
                          </div>
                           <div className="col-3">
                              <small className="text-muted d-block" style={{fontSize: '0.65rem'}}>SAS</small>
                              <strong className="text-dark small">{WEIGHTS.SAS * 100}%</strong>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
       </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold py-3 border-bottom">📈 Grafik Rata-rata Nilai Per Kelas</div>
            <div className="card-body">
              <div style={{minHeight: '250px'}}>
                 {barData && <Bar options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }} data={barData} />}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold py-3 border-bottom">🍰 Persentase Kelulusan</div>
            <div className="card-body d-flex align-items-center justify-content-center">
               <div style={{ width: '100%', maxWidth: '280px' }}>
                  {pieData && <Pie data={pieData} />}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
          <div className="col-12">
               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold py-3 border-bottom">📊 Distribusi Predikat Nilai Siswa (Seluruh Kelas)</div>
                    <div className="card-body">
                        <div style={{height: '250px'}}>
                            {distData && <Bar options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }}} data={distData} />}
                        </div>
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
};
