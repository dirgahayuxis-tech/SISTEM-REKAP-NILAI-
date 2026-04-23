
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  STUDENTS = 'STUDENTS',
  GRADING = 'GRADING',
  ATTENDANCE = 'ATTENDANCE',
  JOURNAL = 'JOURNAL',
  MATERIALS = 'MATERIALS',
  AI_TOOLS = 'AI_TOOLS',
  PROFILE = 'PROFILE'
}

export enum Gender {
  L = 'L',
  P = 'P'
}

export interface UserProfile {
  name: string;
  nip: string;
  role: string;
  photo: string; // Base64 string
}

export interface Classroom {
  id: string;
  name: string;
  semester: string;
  academicYear: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: Gender;
  classId: string;
}

export interface GradeData {
  studentId: string;
  classId: string;
  formatif: number[]; // F1-F8
  sumatif: number[]; // S1-S5
  sasNonTes: number;
  sasTes: number;
}

export interface AttendanceData {
  studentId: string;
  classId: string;
  meetings: string[]; // "H", "I", "S", "A" or ""
}

export interface JournalEntry {
  id: string;
  date: string;
  classId: string;
  topic: string;
  activity: string;
  notes: string;
  attendanceSummary: {
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
  };
}

export interface TeachingMaterial {
  id: string;
  title: string;
  category: 'RPP/Modul' | 'Silabus/ATP' | 'Media' | 'Lainnya';
  type: 'PDF' | 'DOC' | 'LINK';
  uploadDate: string;
  fileData?: string; // Base64 for small files or URL for links
  fileName?: string;
  fileSize?: string;
}

export interface GradeResult {
  avgFormatif: number;
  avgSumatif: number;
  nilaiSas: number;
  nilaiRapor: number;
  isPassing: boolean;
  gradeLetter: string;
}
