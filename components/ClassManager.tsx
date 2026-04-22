import React, { useState, useEffect } from 'react';
import { Classroom } from '../types';
import { getClasses, saveClass, deleteClass } from '../services/storageService';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Partial<Classroom>>({ name: '', semester: 'Ganjil', academicYear: '' });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => setClasses(getClasses());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.academicYear) return;

    const newClass: Classroom = {
      id: editing ? editing.id : Date.now().toString(),
      name: form.name,
      semester: form.semester || 'Ganjil',
      academicYear: form.academicYear,
    };

    saveClass(newClass);
    setForm({ name: '', semester: 'Ganjil', academicYear: '' });
    setEditing(null);
    refresh();
  };

  const handleEdit = (cls: Classroom) => {
    setEditing(cls);
    setForm(cls);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini? Data siswa, nilai, dan absensi terkait akan hilang permanen.')) {
      deleteClass(id);
      refresh();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark mb-0 fw-bold">Manajemen Kelas</h2>
      </div>

      <div className="row g-4">
        {/* Form */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white fw-bold">
              {editing ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nama Kelas</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 7-A"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tahun Pelajaran</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="2024/2025"
                    value={form.academicYear}
                    onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      {editing ? 'Simpan Perubahan' : 'Tambah Kelas'}
                    </button>
                    {editing && (
                        <button 
                            type="button" 
                            onClick={() => { setEditing(null); setForm({ name: '', semester: 'Ganjil', academicYear: '' }); }}
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

        {/* List */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Daftar Kelas</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Kelas</th>
                      <th>Semester</th>
                      <th>Tahun Ajar</th>
                      <th className="text-end pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">Belum ada data kelas.</td>
                      </tr>
                    ) : (
                      classes.map(cls => (
                        <tr key={cls.id}>
                          <td className="ps-4 fw-bold">{cls.name}</td>
                          <td><span className="badge bg-info text-dark">{cls.semester}</span></td>
                          <td>{cls.academicYear}</td>
                          <td className="text-end pe-4">
                            <button onClick={() => handleEdit(cls)} className="btn btn-sm btn-outline-primary me-2">Edit</button>
                            <button onClick={() => handleDelete(cls.id)} className="btn btn-sm btn-outline-danger">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};