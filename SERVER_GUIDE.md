# PANDUAN IMPLEMENTASI LARAVEL 10/11 - KELAS 7.6

Dokumen ini berisi kode backend lengkap untuk **MTs Negeri 2 Bulukumba**.
Fokus: Import Data Siswa Kelas 7.6 & Input Nilai dengan rumus khusus.

---

## 1. Database Seeder (Insert Kelas & Siswa)

Simpan di: `database/seeders/Kelas76Seeder.php`

Fitur:
- Cek apakah kelas 7.6 ada (Create if not exist).
- Insert 24 Siswa.
- Hindari duplikasi.
- Buat record Nilai & Kehadiran kosong (agar siap diinput).
- Menggunakan Transaction.

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\Nilai;
use App\Models\Kehadiran;

class Kelas76Seeder extends Seeder
{
    public function run()
    {
        $tahunAjaran = '2025/2026';
        $semester = 'Ganjil';
        $namaKelas = '7.6';

        $siswa76 = [
            "A. Latisha Zalfa Alifiyah", "Adam Hidayat", "Agis Ainun Agustam", "Andi Alfiyah Istanyah",
            "Aqilah Khumairah", "Aryanto", "Aulia Sri Ramadhani", "Dayana Batrisya Arwana",
            "Muh Risqullah Amirul", "Muh. adzan", "Muh. Rezki", "Muh. Adwan Alhabsy",
            "Muhammad Abidzar", "Muhammad Afif Kholid", "Muhammad Aiman", "Muhammad Iqbal",
            "Nur Arizka Maharani", "Nuraizah Aquraeni", "Purwa Aura Arundaya", "Rasmi Inayah",
            "Selfira Amanda Putri", "Syahwal Al-Kasman", "Syifa Azzahra Sabrin", "Zalsya Sabira Maulidya"
        ];

        DB::beginTransaction();
        try {
            // 1. Cek / Buat Kelas
            $kelas = Kelas::firstOrCreate(
                ['nama_kelas' => $namaKelas, 'tahun_ajaran' => $tahunAjaran],
                ['semester' => $semester]
            );

            $this->command->info("Kelas $namaKelas ID: " . $kelas->id);

            foreach ($siswa76 as $nama) {
                // 2. Insert Siswa
                $siswa = Siswa::firstOrCreate(
                    [
                        'nama' => $nama, 
                        'kelas_id' => $kelas->id
                    ],
                    [
                        'jenis_kelamin' => $this->guessGender($nama),
                        'nisn' => null
                    ]
                );

                // 3. Init Record Nilai (Jika belum ada)
                Nilai::firstOrCreate(
                    ['siswa_id' => $siswa->id, 'kelas_id' => $kelas->id]
                );

                // 4. Init Record Absensi (Jika belum ada)
                // Menggunakan JSON column atau relasi, disini asumsi record kosong dibuat
                Kehadiran::firstOrCreate(
                    ['siswa_id' => $siswa->id, 'kelas_id' => $kelas->id]
                );
            }

            DB::commit();
            $this->command->info("Berhasil mengimpor 24 siswa ke kelas 7.6!");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Terjadi Error: " . $e->getMessage());
        }
    }

    private function guessGender($name) {
        $name = strtolower($name);
        $femaleKeywords = ['putri', 'nur', 'siti', 'zahra', 'aira', 'syifa', 'ina', 'ayu', 'nisa', 'latisha', 'dayana', 'aulia', 'istanyah'];
        foreach ($femaleKeywords as $k) {
            if (str_contains($name, $k)) return 'P';
        }
        return 'L';
    }
}
```

Jalankan: `php artisan db:seed --class=Kelas76Seeder`

---

## 2. Controller (Input Nilai & Hitung Otomatis)

Simpan di: `app/Http/Controllers/NilaiController.php`

Logika Perhitungan Sesuai Request:
1.  **Nilai Formatif** = Rata-rata F1-F8
2.  **Nilai Sumatif** = Rata-rata S1-S5
3.  **Nilai SAS** = (Nilai Sumatif + Non Tes + Tes) / 3
4.  **Nilai Rapor** = (Nilai Formatif + Nilai SAS) / 2

```php
<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Nilai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NilaiController extends Controller
{
    // Menampilkan Tabel Input
    public function edit($kelasId)
    {
        $kelas = Kelas::findOrFail($kelasId);
        
        // Ambil data nilai, urutkan siswa A-Z
        $dataNilai = Nilai::with('siswa')
            ->where('kelas_id', $kelasId)
            ->join('siswas', 'nilais.siswa_id', '=', 'siswas.id')
            ->orderBy('siswas.nama', 'asc')
            ->select('nilais.*') // Select nilais columns to avoid ID conflict
            ->get();

        return view('nilai.input', compact('kelas', 'dataNilai'));
    }

    // Simpan & Hitung (Bulk Update)
    public function update(Request $request, $kelasId)
    {
        $input = $request->input('nilai'); // Array of grades: [id_nilai => [f1 => 80, ...]]

        DB::beginTransaction();
        try {
            foreach ($input as $id => $d) {
                $nilai = Nilai::findOrFail($id);

                // --- 1. Rata-rata Formatif (F1-F8) ---
                $sumF = 0;
                $countF = 0;
                for ($i = 1; $i <= 8; $i++) {
                    $val = isset($d["f$i"]) ? intval($d["f$i"]) : 0;
                    $sumF += $val;
                    if ($val > 0) $countF++;
                }
                // Jika ingin pembagi tetap 8 walau nilai kosong, gunakan $div = 8;
                // Disini kita gunakan 8 sesuai standar tabel
                $rataFormatif = $sumF / 8;

                // --- 2. Rata-rata Sumatif (S1-S5) ---
                $sumS = 0;
                for ($i = 1; $i <= 5; $i++) {
                    $sumS += isset($d["s$i"]) ? intval($d["s$i"]) : 0;
                }
                $rataSumatif = $sumS / 5;

                // --- 3. Hitung SAS ---
                // Rumus: (Nilai Sumatif + Non Tes + Tes) / 3
                $nonTes = isset($d['sas_non_tes']) ? intval($d['sas_non_tes']) : 0;
                $tes = isset($d['sas_tes']) ? intval($d['sas_tes']) : 0;
                
                $nilaiSas = ($rataSumatif + $nonTes + $tes) / 3;

                // --- 4. Hitung Nilai Rapor ---
                // Rumus: (Formatif + SAS) / 2
                $nilaiRapor = ($rataFormatif + $nilaiSas) / 2;

                // --- 5. Tentukan Predikat ---
                $huruf = 'E';
                if ($nilaiRapor >= 90) $huruf = 'A';
                elseif ($nilaiRapor >= 80) $huruf = 'B';
                elseif ($nilaiRapor >= 70) $huruf = 'C';
                elseif ($nilaiRapor >= 60) $huruf = 'D';

                // --- 6. Simpan ke Database ---
                $nilai->update([
                    'f1' => $d['f1'] ?? 0, 'f2' => $d['f2'] ?? 0, 'f3' => $d['f3'] ?? 0, 'f4' => $d['f4'] ?? 0,
                    'f5' => $d['f5'] ?? 0, 'f6' => $d['f6'] ?? 0, 'f7' => $d['f7'] ?? 0, 'f8' => $d['f8'] ?? 0,
                    's1' => $d['s1'] ?? 0, 's2' => $d['s2'] ?? 0, 's3' => $d['s3'] ?? 0, 's4' => $d['s4'] ?? 0, 's5' => $d['s5'] ?? 0,
                    'sas_non_tes' => $nonTes,
                    'sas_tes' => $tes,
                    'nilai_formatif' => $rataFormatif,
                    'nilai_sumatif' => $rataSumatif,
                    'nilai_sas' => $nilaiSas,
                    'nilai_rapor' => $nilaiRapor,
                    'nilai_huruf' => $huruf
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Data Nilai Berhasil Disimpan & Dihitung!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }
}
```

---

## 3. Blade View (Tabel Input dengan Header Bertingkat)

Simpan di: `resources/views/nilai/input.blade.php`

```html
@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between mb-3">
        <h3>Input Nilai Kelas {{ $kelas->nama_kelas }}</h3>
        <button type="submit" form="formNilai" class="btn btn-success">💾 Simpan Semua Perubahan</button>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <form action="{{ route('nilai.update', $kelas->id) }}" method="POST" id="formNilai">
        @csrf
        @method('PUT')
        
        <div class="table-responsive">
            <table class="table table-bordered table-sm text-center align-middle" style="font-size: 13px;">
                <thead class="table-success text-white">
                    <tr>
                        <th rowspan="2" width="30">No</th>
                        <th rowspan="2" width="200" class="text-start ps-2">Nama Siswa</th>
                        <th colspan="8">Formatif (F1-F8)</th>
                        <th colspan="5">Sumatif (S1-S5)</th>
                        <th colspan="2">SAS</th>
                        <th colspan="3">Hasil Akhir (Auto)</th>
                    </tr>
                    <tr>
                        @for($i=1; $i<=8; $i++) <th>F{{$i}}</th> @endfor
                        @for($i=1; $i<=5; $i++) <th>S{{$i}}</th> @endfor
                        <th>Non Tes</th>
                        <th>Tes</th>
                        <th>Formatif</th>
                        <th>SAS</th>
                        <th>RAPOR</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($dataNilai as $index => $row)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td class="text-start ps-2 fw-bold">{{ $row->siswa->nama }}</td>
                        
                        {{-- Input Formatif --}}
                        @for($i=1; $i<=8; $i++)
                            <td class="p-0">
                                <input type="number" name="nilai[{{ $row->id }}][f{{$i}}]" 
                                    class="form-control form-control-sm border-0 text-center input-calc" 
                                    data-id="{{ $row->id }}" data-type="f" 
                                    value="{{ $row->{'f'.$i} }}" min="0" max="100">
                            </td>
                        @endfor

                        {{-- Input Sumatif --}}
                        @for($i=1; $i<=5; $i++)
                            <td class="p-0">
                                <input type="number" name="nilai[{{ $row->id }}][s{{$i}}]" 
                                    class="form-control form-control-sm border-0 text-center input-calc" 
                                    data-id="{{ $row->id }}" data-type="s" 
                                    value="{{ $row->{'s'.$i} }}" min="0" max="100">
                            </td>
                        @endfor

                        {{-- Input SAS --}}
                        <td class="p-0"><input type="number" name="nilai[{{ $row->id }}][sas_non_tes]" class="form-control form-control-sm border-0 text-center input-calc" data-id="{{ $row->id }}" value="{{ $row->sas_non_tes }}"></td>
                        <td class="p-0"><input type="number" name="nilai[{{ $row->id }}][sas_tes]" class="form-control form-control-sm border-0 text-center input-calc" data-id="{{ $row->id }}" value="{{ $row->sas_tes }}"></td>

                        {{-- Preview Hasil Auto --}}
                        <td class="bg-light fw-bold" id="res-f-{{$row->id}}">{{ number_format($row->nilai_formatif, 0) }}</td>
                        <td class="bg-light fw-bold" id="res-sas-{{$row->id}}">{{ number_format($row->nilai_sas, 0) }}</td>
                        <td class="table-active fw-bold text-primary" id="res-rapor-{{$row->id}}" style="font-size: 1.1em;">{{ number_format($row->nilai_rapor, 0) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </form>
</div>

{{-- JavaScript untuk Hitung Realtime di Browser --}}
<script>
document.querySelectorAll('.input-calc').forEach(input => {
    input.addEventListener('input', function() {
        const id = this.dataset.id;
        const rowInputs = document.querySelectorAll(`input[data-id="${id}"]`);
        
        let sumF = 0;
        let sumS = 0;
        let nonTes = 0;
        let tes = 0;

        rowInputs.forEach(inp => {
            let val = parseFloat(inp.value) || 0;
            let name = inp.name;
            
            if (name.includes('[f')) sumF += val;
            if (name.includes('[s')) sumS += val;
            if (name.includes('sas_non_tes')) nonTes = val;
            if (name.includes('sas_tes')) tes = val;
        });

        // Rumus JS sesuai Request
        let avgF = sumF / 8;
        let avgS = sumS / 5;
        let sas = (avgS + nonTes + tes) / 3;
        let rapor = (avgF + sas) / 2;

        document.getElementById(`res-f-${id}`).innerText = avgF.toFixed(0);
        document.getElementById(`res-sas-${id}`).innerText = sas.toFixed(0);
        document.getElementById(`res-rapor-${id}`).innerText = rapor.toFixed(0);
    });
});
</script>
@endsection
```
