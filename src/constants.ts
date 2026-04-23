import { Classroom } from "./types";

export const APP_NAME = "Sistem Rekap Nilai Bahasa Arab";
export const SCHOOL_NAME = "MTs Negeri 2 Bulukumba";
export const KEMENAG_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Logo_Kementerian_Agama_Republik_Indonesia.png/480px-Logo_Kementerian_Agama_Republik_Indonesia.png";
export const KOP_ADDRESS = "Alamat: Jl. Matahari No. 16, Tanete, Kec. Bulukumpa, Kab. Bulukumba";

export const MOCK_CLASSES: Classroom[] = [
  { id: 'c_71_new', name: '7.1', semester: 'Ganjil', academicYear: '2025/2026' },
  { id: 'c_72', name: '7.2', semester: 'Ganjil', academicYear: '2025/2026' },
  { id: 'c_73', name: '7.3', semester: 'Ganjil', academicYear: '2025/2026' },
  { id: 'c_74', name: '7.4', semester: 'Ganjil', academicYear: '2025/2026' },
  { id: 'c_75', name: '7.5', semester: 'Ganjil', academicYear: '2025/2026' },
  { id: 'c_76', name: '7.6', semester: 'Ganjil', academicYear: '2025/2026' },
];

export const ATTENDANCE_OPTIONS = ['H', 'I', 'S', 'A'];
export const TOTAL_MEETINGS = 20;

export const KKM = 72;

export const WEIGHTS = {
  FORMATIF: 0.4,
  SUMATIF: 0.3,
  SAS: 0.3
};