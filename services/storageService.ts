
import { Student, Classroom, GradeData, AttendanceData, JournalEntry, TeachingMaterial, Gender, UserProfile } from '../types';
import { MOCK_CLASSES } from '../constants';

// Keys
const KEYS = {
  CLASSES: 'ar_classes',
  STUDENTS: 'ar_students',
  GRADES: 'ar_grades',
  ATTENDANCE: 'ar_attendance',
  JOURNAL: 'ar_journal',
  MATERIALS: 'ar_materials',
  PROFILE: 'ar_user_profile',
  SEEDED: 'ar_seeded_v10' // Bump version
};

// Helpers
const get = <T,>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const set = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- PROFILE ---
export const getUserProfile = (): UserProfile => {
  return get<UserProfile>(KEYS.PROFILE, {
    name: 'HARMA, S.Pd.I',
    nip: '19940823 202321 2 032',
    role: 'Guru Mata Pelajaran',
    photo: '' // Empty string defaults to placeholder in UI
  });
};

export const saveUserProfile = (profile: UserProfile) => {
  set(KEYS.PROFILE, profile);
};

// Helper: Simple Gender Guesser based on Name
const guessGender = (name: string): Gender => {
  const lower = name.toLowerCase();
  const femaleKeywords = [
    'putri', 'nur', 'siti', 'zahra', 'aira', 'syifa', 'ina', 'ayu', 'nisa', 
    'aulia', 'annisa', 'suci', 'dwi', 'fika', 'gadis', 'nadia', 'nasywa', 
    'ufairah', 'qaila', 'kania', 'calista', 'aisyah', 'indah', 'amalia', 
    'sakina', 'aqilah', 'fatin', 'musdalifah', 'latisha', 'dayana', 'zalsya',
    'selfira', 'rasmi', 'syifa', 'istanyah', 'khumairah', 'batrisya', 'arundaya', 'sabira'
  ];
  
  if (femaleKeywords.some(keyword => lower.includes(keyword))) {
    return Gender.P;
  }
  return Gender.L; // Default to L if unsure/male
};

// --- DATA SISWA RAW ---
const STUDENTS_71 = [
  "A. Nurul Nazhiya Afni", "A Wahyuningsih Asram", "Andi Ahmad Aramang S", "Andi Nurfaizah",
  "Aqila Qinya", "Assyifa Mustika", "Fail Aryansyah Fajar", "Fakhirah Shakila",
  "Fausitul Anwar", "Galang Desta Saputra", "Inayah Rizqina Raasiyah", "Khaeril Anwar",
  "Mikhaila Khanza Azzahra", "Muh. Al Fiqriansyah", "Muh. Fadly Azis", "Muhammad Farit",
  "Muhammad Fikri Mubarak", "Naila Putri", "Naufal Gibrang", "Nur Agun Rizal",
  "Nur Fikar", "Putri Aira", "Raigah Ailani Zahra", "Reski Permata Sari",
  "Rifki Aditiya", "Zahra Amalia Riski"
];

const STUDENTS_72 = [
  "Ahmad Syakib Mubarak", "Aidil Syahril", "Ainul Rafiq", "Andi Dzakira Talita Zahra Absha",
  "Annisa Fausiah", "Anugerah Seftian Hamsin", "Athifatun Ihsan", "Azisah Nurfadillah",
  "Fika Firdaus", "Gadis Dwi Sakira", "Kasmi Lara Saputri", "Muh. Akbar Satria",
  "Muh. Akram", "Muh. Halif", "Muh. Reifan Mahardika", "Muhammad Alif Gibran",
  "Nabila Alivia", "Nadia Lathifa Sany", "Nadila An'nur", "Nasywa Marzilah",
  "Putri Nur Azizah Pratiwi", "Raqib Syariial", "Rifqi Almubarak", "Suci Anita Putry",
  "Zaki Safran"
];

const STUDENTS_73 = [
  "Ainul Saputri", "Altamis Ahmad Wahid", "Aufa Awliya", "Aufah Dea Firzanah",
  "Calista Lailani Anora", "Febriansyah", "Fudhail", "Ghaida Prativi Zasmi",
  "Haikal", "Indriani", "Isna", "Kafka Aderal Alby", "Kania Thalyta Futry",
  "Muh Bayu Batara", "Muh Fajar", "Muh Febrial Al-Faqih", "Muh Abilal Azriam",
  "Muh Ali Dzaky Al Hadi", "Muh Farid Farsyam", "Muh Yusuf", "Nur Isfa Inda",
  "Nurul Aisyah", "Nurul Awauliyah", "Qaila Putri Syahdania", "Rifkatun Najia",
  "Ufairah Nurafitah Akbar"
];

const STUDENTS_74 = [
  "A. Rahmat Hidayat", "Abid Waldaan", "Abizar Al Ghifari Usriadi", "Achmad Hariry",
  "Ahmad Fadli", "Al Maura Nur Hafizah", "Aldi", "Alina Putri", "Andi Muh. Faturrahman",
  "As Zahratul Qalbi", "Asifa Anggun Maulidini", "Aura Anwar", "Ayska Zalfa Naqiyya",
  "Dika Pratama", "Khayla Qisya Aulia Asrul", "Muh. Ahzan", "Muh. Resky Aditya Saputra",
  "Muh. Akbar", "Mulani Syahrir", "Nur Safira", "Nur Saqilah", "Nurainun",
  "Rizky Pratama Ramadhan", "Suci Ramadani", "Syakia Zalzabila"
];

const STUDENTS_75 = [
  "Alfira Mutmainnah", "Alisha Kaira Wilda", "Andi Muh. Raihan", "Aqilah Qaezenah Zahra",
  "Ariqha Azzahra", "Arya", "Fadil Maulana", "Fatin Auliya Ahmad", "M. Alif Hidayat",
  "M. Safwan Hidayat", "Muh. Ical Akfiansyah", "Muh. Ilyas", "Muh. Fatah",
  "Muhammad Khadir Yakin", "Muhammad Syawal", "Musdalifah", "Nur Afika", "Nur Selfiani",
  "Nur Suhada", "Nur Syazwani", "Nurwahda", "Rastika", "Refan", "Reski Amelia",
  "Sahra Awalia Firli", "Sakina"
];

const STUDENTS_76 = [
  "A. Latisha Zalfa Alifiyah", "Adam Hidayat", "Agis Ainun Agustam", "Andi Alfiyah Istanyah",
  "Aqilah Khumairah", "Aryanto", "Aulia Sri Ramadhani", "Dayana Batrisya Arwana",
  "Muh Risqullah Amirul", "Muh. adzan", "Muh. Rezki", "Muh. Adwan Alhabsy",
  "Muhammad Abidzar", "Muhammad Afif Kholid", "Muhammad Aiman", "Muhammad Iqbal",
  "Nur Arizka Maharani", "Nuraizah Aquraeni", "Purwa Aura Arundaya", "Rasmi Inayah",
  "Selfira Amanda Putri", "Syahwal Al-Kasman", "Syifa Azzahra Sabrin", "Zalsya Sabira Maulidya"
];

// Reconstructed ATP Document Content (HTML)
const ATP_CONTENT_HTML = `data:text/html;charset=utf-8,` + encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
<title>ATP Bahasa Arab Kelas 7</title>
<style>
  body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; background: white; max-width: 900px; margin: auto; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
  h2, h3, h4 { text-align: center; margin: 5px 0; color: #000; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th, td { border: 1px solid #000; padding: 8px; vertical-align: top; font-size: 11pt; }
  th { background-color: #e8e8e8; font-weight: bold; text-align: center; }
  .no-border td { border: none; padding: 4px; }
  .justify { text-align: justify; line-height: 1.4; }
  .center { text-align: center; }
  .arabic { font-family: 'Traditional Arabic', 'Amiri', serif; font-size: 14pt; direction: rtl; }
  .signatures { display: flex; justify-content: space-between; margin-top: 60px; page-break-inside: avoid; }
  .sig-block { text-align: center; width: 45%; }
</style>
</head>
<body>
  <h2>ALUR TUJUAN PEMBELAJARAN (ATP)</h2>
  <h3>MATA PELAJARAN : BAHASA ARAB</h3>
  <hr style="border-top: 3px double #000; margin: 20px 0;">
  
  <table class="no-border" style="width: auto; margin-bottom: 20px;">
    <tr><td width="150"><strong>Nama Madrasah</strong></td><td>: MTsN 2 Bulukumba</td></tr>
    <tr><td><strong>Nama Guru</strong></td><td>: Harma, S.Pd.I</td></tr>
    <tr><td><strong>Mata Pelajaran</strong></td><td>: Bahasa Arab</td></tr>
    <tr><td><strong>Fase / Kelas</strong></td><td>: D - VII</td></tr>
    <tr><td><strong>Tahun Penyusunan</strong></td><td>: 2025/ 2026</td></tr>
  </table>

  <h4>CAPAIAN PEMBELAJARAN BAHASA ARAB FASE D</h4>
  <p class="justify">
    Pada akhir fase D, peserta didik mempunyai kemampuan mengeksplorasi informasi serta membangun interaksi dengan teks sebagai alat komunikasi global sesuai dengan tujuan dan konteks sosial, mampu merefleksi berbagai jenis teks visual atau teks multimoda yang tersurat dan tersirat serta dapat menghubungkan dan memaparkannya melalui tulisan dalam paragraf sederhana pada berbagai jenis teks dan membuat urutan yang terhubung secara logis untuk mengungkapkan gagasan sesuai dengan struktur teks secara tulis dan lisan untuk penguatan karakter.
  </p>
  <!-- Content truncated for brevity, same as before -->
  <h4>ALUR TUJUAN PEMBELAJARAN (ATP)</h4>
  <table>
    <thead>
      <tr>
        <th width="5%">No</th>
        <th width="15%">Lingkup Materi</th>
        <th width="45%">Alur Tujuan Pembelajaran</th>
        <th width="20%">Gramatikal</th>
        <th width="15%">Alokasi Waktu</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Perkenalan</td>
        <td>
          1.1 Peserta didik mampu menjelaskan fungsi sosial, struktur teks dan unsur kebahasaan bunyi, kata, makna dan gramatikal dari teks sederhana yang berkaitan dengan tema: <span class="arabic">التعارف</span><br><br>
          1.2 Peserta didik mampu mempraktekkan memperkenalkan diri dan orang lain dengan menggunakan kata tanya secara lisan maupun tulisan.
        </td>
        <td>Mubtada' Khabar</td>
        <td class="center">20 JP</td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-block">
      Mengetahui,<br>Kepala Madrasah<br><br><br><br><br>
      <strong><u>Drs. SABIL, M.Pd.I</u></strong><br>
      NIP. 19660602 1199403 1 002
    </div>
    <div class="sig-block">
      Tanete, Januari 2026<br>Guru Mata Pelajaran<br><br><br><br><br>
      <strong><u>Harma, S.Pd.I</u></strong><br>
      NIP. 19940823 202321 2 032
    </div>
  </div>
</body>
</html>
`);

// Reconstructed DOC Content (Simulated Word View)
const RPP_CONTENT_HTML = `data:text/html;charset=utf-8,` + encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
<title>Modul Ajar Bahasa Arab</title>
<style>
  body { 
    font-family: 'Calibri', 'Arial', sans-serif; 
    background-color: #f0f0f0; 
    margin: 0; 
    padding: 20px; 
    display: flex; 
    justify-content: center; 
  }
  .page {
    background: white;
    width: 21cm;
    min-height: 29.7cm;
    padding: 2.5cm;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    box-sizing: border-box;
  }
  h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
  h2 { font-size: 14pt; text-align: center; margin-bottom: 30px; font-weight: bold; }
  h3 { font-size: 12pt; margin-top: 15px; margin-bottom: 5px; background-color: #eee; padding: 5px; border-left: 5px solid #0f5132; }
  p, li { font-size: 11pt; line-height: 1.5; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  td { padding: 5px; vertical-align: top; }
  .arabic { font-family: 'Times New Roman', serif; font-size: 14pt; }
</style>
</head>
<body>
  <div class="page">
    <h1>MODUL AJAR (RPP)</h1>
    <h2>KURIKULUM MERDEKA</h2>
    
    <h3>A. IDENTITAS MODUL</h3>
    <table>
      <tr><td width="150">Nama Penyusun</td><td>: Harma, S.Pd.I</td></tr>
      <tr><td>Satuan Pendidikan</td><td>: MTsN 2 Bulukumba</td></tr>
      <tr><td>Mata Pelajaran</td><td>: Bahasa Arab</td></tr>
      <tr><td>Kelas / Fase</td><td>: VII (Tujuh) / D</td></tr>
      <tr><td>Materi Pokok</td><td>: Perkenalan (<span class="arabic">التعارف</span>)</td></tr>
      <tr><td>Alokasi Waktu</td><td>: 2 x 40 Menit</td></tr>
    </table>

    <h3>B. KOMPETENSI AWAL</h3>
    <p>Peserta didik telah memiliki kemampuan dasar membaca huruf hijaiyah bersambung dan mengenal beberapa kosakata dasar terkait sapaan sehari-hari.</p>

    <h3>C. PROFIL PELAJAR PANCASILA & RAHMATAN LIL ALAMIN</h3>
    <ul>
        <li>Beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia.</li>
        <li>Berkebinekaan global.</li>
        <li>Mandiri dan Gotong Royong.</li>
    </ul>

    <h3>D. TUJUAN PEMBELAJARAN</h3>
    <ol>
        <li>Melalui kegiatan menyimak, peserta didik dapat mengidentifikasi bunyi kata, frasa, dan kalimat bahasa Arab yang berkaitan dengan topik <strong>At-Ta'aruf</strong> dengan benar.</li>
        <li>Melalui demonstrasi, peserta didik dapat melakukan tindak tutur memperkenalkan diri dan orang lain menggunakan susunan gramatikal <em>Mubtada' Khabar</em> dengan percaya diri.</li>
    </ol>
    
    <h3>E. KEGIATAN PEMBELAJARAN</h3>
    <p><strong>1. Pendahuluan (10 Menit)</strong><br>
    Guru membuka salam, berdoa bersama, memeriksa kehadiran, dan memberikan apersepsi tentang pentingnya saling mengenal.</p>
    
    <p><strong>2. Kegiatan Inti (60 Menit)</strong><br>
    - <em>Mengamati:</em> Peserta didik menyimak pelafalan kosakata tentang perkenalan.<br>
    - <em>Menanya:</em> Guru memancing pertanyaan terkait cara berkenalan dalam bahasa Arab.<br>
    - <em>Mencoba:</em> Peserta didik berlatih melafalkan hiwar (percakapan) secara berpasangan.<br>
    - <em>Mengasosiasi:</em> Peserta didik menghubungkan kata tanya (Man, Hal, Min Aina) dengan jawaban yang tepat.</p>
    
    <p><strong>3. Penutup (10 Menit)</strong><br>
    Guru memberikan penguatan, refleksi pembelajaran, menyampaikan materi pertemuan berikutnya, dan menutup dengan doa.</p>
  </div>
</body>
</html>
`);

// Initial Seeder
export const seedDatabase = () => {
  const isSeeded = localStorage.getItem(KEYS.SEEDED);

  if (!isSeeded) {
    console.log("Seeding initial database (v10)...");
    
    // 1. Seed Classes
    set(KEYS.CLASSES, MOCK_CLASSES);

    let allStudents: Student[] = [];

    // Helper to generate student objects
    const createStudents = (names: string[], classId: string) => {
      return names.map((name, index) => ({
        id: `s_${classId}_${index + 1}`,
        nisn: '', 
        name: name,
        gender: guessGender(name),
        classId: classId
      }));
    };

    // 2. Generate Students for all classes
    allStudents = [
      ...createStudents(STUDENTS_71, 'c_71_new'),
      ...createStudents(STUDENTS_72, 'c_72'),
      ...createStudents(STUDENTS_73, 'c_73'),
      ...createStudents(STUDENTS_74, 'c_74'),
      ...createStudents(STUDENTS_75, 'c_75'),
      ...createStudents(STUDENTS_76, 'c_76'),
    ];

    set(KEYS.STUDENTS, allStudents);
    
    // 3. Seed Example Teaching Material
    const materials: TeachingMaterial[] = [
        {
            id: 'mat_001',
            title: 'Modul Ajar Bahasa Arab - Bab 1: Perkenalan (التعارف)',
            category: 'RPP/Modul',
            type: 'DOC', // Marked as DOC but using HTML simulation for preview
            uploadDate: '2025-07-15',
            fileName: 'Modul_Ajar_7_Bab1.docx',
            fileSize: '1.2 MB',
            fileData: RPP_CONTENT_HTML
        },
        {
            id: 'mat_002',
            title: 'ALUR TUJUAN PEMBELAJARAN (ATP) B. ARAB KELAS 7',
            category: 'Silabus/ATP',
            type: 'PDF',
            uploadDate: new Date().toISOString().split('T')[0], // Today
            fileName: 'ATP_Bahasa_Arab_Fase_D_Kelas_7.pdf',
            fileSize: '845 KB',
            fileData: ATP_CONTENT_HTML 
        }
    ];
    set(KEYS.MATERIALS, materials);

    // Update Profile default NIP matching the document
    set(KEYS.PROFILE, {
        name: 'HARMA, S.Pd.I',
        nip: '19940823 202321 2 032',
        role: 'Guru Mata Pelajaran',
        photo: ''
    });

    // Clear old data to prevent conflicts if version bumped
    localStorage.removeItem(KEYS.GRADES);
    localStorage.removeItem(KEYS.ATTENDANCE);
    
    // Mark as seeded
    localStorage.setItem(KEYS.SEEDED, 'true');
    
    // Clean up old version keys if any
    localStorage.removeItem('ar_seeded_v1');
    localStorage.removeItem('ar_seeded_v2');
    localStorage.removeItem('ar_seeded_v3');
    localStorage.removeItem('ar_seeded_v4');
    localStorage.removeItem('ar_seeded_v5');
    localStorage.removeItem('ar_seeded_v6');
    localStorage.removeItem('ar_seeded_v7');
    localStorage.removeItem('ar_seeded_v8');
    localStorage.removeItem('ar_seeded_v9');
    
    // Force reload to apply changes if it was a hot reload
    console.log("Database seeded successfully.");
  }
};

// Classes
export const getClasses = (): Classroom[] => get(KEYS.CLASSES, []);
export const saveClass = (cls: Classroom) => {
  const classes = getClasses();
  const idx = classes.findIndex(c => c.id === cls.id);
  if (idx >= 0) classes[idx] = cls;
  else classes.push(cls);
  set(KEYS.CLASSES, classes);
};
export const deleteClass = (id: string) => {
  const classes = getClasses().filter(c => c.id !== id);
  set(KEYS.CLASSES, classes);
  
  // Cascade Delete Students
  const rawStudents = get(KEYS.STUDENTS, [] as Student[]);
  const newStudents = rawStudents.filter(s => s.classId !== id);
  set(KEYS.STUDENTS, newStudents);
};

// Students
export const getStudents = (): Student[] => {
  const students = get(KEYS.STUDENTS, [] as Student[]);
  // A. PERBAIKAN URUTAN NAMA SISWA: Wajib A-Z
  return students.sort((a, b) => a.name.localeCompare(b.name));
};

export const getStudentsByClass = (classId: string): Student[] => {
  return getStudents().filter(s => s.classId === classId);
};

export const saveStudent = (student: Student) => {
  const rawStudents = get(KEYS.STUDENTS, [] as Student[]);
  const idx = rawStudents.findIndex(s => s.id === student.id);
  
  if (idx >= 0) rawStudents[idx] = student;
  else rawStudents.push(student);
  
  set(KEYS.STUDENTS, rawStudents);
};

export const deleteStudent = (id: string) => {
  // Hapus dari daftar siswa
  const rawStudents = get(KEYS.STUDENTS, [] as Student[]);
  const newStudents = rawStudents.filter(s => s.id !== id);
  set(KEYS.STUDENTS, newStudents);

  // CASCADE DELETE: Hapus Data Nilai terkait
  const rawGrades = get(KEYS.GRADES, [] as GradeData[]);
  const newGrades = rawGrades.filter(g => g.studentId !== id);
  set(KEYS.GRADES, newGrades);

  // CASCADE DELETE: Hapus Data Absensi terkait
  const rawAttendance = get(KEYS.ATTENDANCE, [] as AttendanceData[]);
  const newAttendance = rawAttendance.filter(a => a.studentId !== id);
  set(KEYS.ATTENDANCE, newAttendance);
};

// Grades
export const getGrades = (): GradeData[] => get(KEYS.GRADES, []);
export const getGradeByStudent = (studentId: string): GradeData => {
  const grades = getGrades();
  const found = grades.find(g => g.studentId === studentId);
  if (found) return found;
  return {
    studentId,
    classId: '',
    formatif: Array(8).fill(0),
    sumatif: Array(5).fill(0),
    sasNonTes: 0,
    sasTes: 0,
  };
};
export const saveGrade = (grade: GradeData) => {
  const grades = getGrades();
  const idx = grades.findIndex(g => g.studentId === grade.studentId);
  if (idx >= 0) grades[idx] = grade;
  else grades.push(grade);
  set(KEYS.GRADES, grades);
};

// Attendance
export const getAttendance = (): AttendanceData[] => get(KEYS.ATTENDANCE, []);
export const getAttendanceByStudent = (studentId: string): AttendanceData => {
  const list = getAttendance();
  const found = list.find(a => a.studentId === studentId);
  if (found) return found;
  return { studentId, classId: '', meetings: Array(20).fill('') };
};
export const saveAttendance = (data: AttendanceData) => {
  const list = getAttendance();
  const idx = list.findIndex(a => a.studentId === data.studentId);
  if (idx >= 0) list[idx] = data;
  else list.push(data);
  set(KEYS.ATTENDANCE, list);
};

// Journal
export const getJournals = (): JournalEntry[] => get(KEYS.JOURNAL, []);
export const saveJournal = (entry: JournalEntry) => {
  const list = getJournals();
  const idx = list.findIndex(j => j.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  set(KEYS.JOURNAL, list);
};

// Materials (Perangkat Ajar)
export const getMaterials = (): TeachingMaterial[] => get(KEYS.MATERIALS, []);
export const saveMaterial = (item: TeachingMaterial) => {
  const list = getMaterials();
  const idx = list.findIndex(m => m.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  set(KEYS.MATERIALS, list);
};
export const deleteMaterial = (id: string) => {
    const list = getMaterials().filter(m => m.id !== id);
    set(KEYS.MATERIALS, list);
};

seedDatabase();
