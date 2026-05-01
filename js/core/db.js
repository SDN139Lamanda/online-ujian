// ⚡ Diambil dari Word: DATA STORE
export const DB = {
    kelas: [
        'X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2',
        'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2',
        'XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2',
    ],
    users: {
        admin: { password: '123456', role: 'admin', nama: 'Administrator', nip: 'ADMIN001' },
        '198501012010011001': { password: 'Guru@123', role: 'guru', nama: 'Budi Santoso', nip: '198501012010011001', mapel: 'Matematika' },
        '197809152005012002': { password: 'Guru@456', role: 'guru', nama: 'Dewi Rahayu', nip: '197809152005012002', mapel: 'Fisika' },
        'siswa001': { password: 'Siswa@1', role: 'siswa', nama: 'Ahmad Fauzi', nisn: '0012345678', kelas: 'XII IPA 1' },
        'siswa002': { password: 'Siswa@2', role: 'siswa', nama: 'Bella Putri', nisn: '0012345679', kelas: 'XII IPA 1' },
        'siswa003': { password: 'Siswa@3', role: 'siswa', nama: 'Candra Wijaya', nisn: '0012345680', kelas: 'XII IPA 2' },
    },
    bankSoal: [
        { id: 1, guruId: '198501012010011001', mapel: 'Matematika', jenis: 'pg', pertanyaan: 'Berapakah hasil dari 2³ + √16?', opsi: ['10','12','14','16'], kunci: 1, poin: 5, aktif: true, gambar: null },
        { id: 2, guruId: '198501012010011001', mapel: 'Matematika', jenis: 'pg', pertanyaan: 'Jika f(x) = 3x² - 2x + 1, maka f(2) adalah...', opsi: ['9','10','11','12'], kunci: 0, poin: 5, aktif: true, gambar: null },
        { id: 3, guruId: '198501012010011001', mapel: 'Matematika', jenis: 'pg', pertanyaan: 'Nilai sin(30°) adalah...', opsi: ['0,5','0,6','0,7','0,8'], kunci: 0, poin: 5, aktif: true, gambar: null },
        { id: 4, guruId: '198501012010011001', mapel: 'Matematika', jenis: 'pg', pertanyaan: 'Persamaan garis melalui (0,2) dengan kemiringan 3 adalah...', opsi: ['y=3x+2','y=2x+3','y=3x-2','y=2x-3'], kunci: 0, poin: 5, aktif: true, gambar: null },
        { id: 5, guruId: '197809152005012002', mapel: 'Fisika', jenis: 'pg', pertanyaan: 'Satuan dasar kuat arus listrik dalam SI adalah...', opsi: ['Volt','Watt','Ampere','Ohm'], kunci: 2, poin: 5, aktif: true, gambar: null },
        { id: 6, guruId: '197809152005012002', mapel: 'Fisika', jenis: 'pg', pertanyaan: 'Hukum Newton II menyatakan bahwa F = ...', opsi: ['m/a','ma','m+a','m-a'], kunci: 1, poin: 5, aktif: true, gambar: null },
    ],
    ujian: [
        { id: 'UJ001', guruId: '198501012010011001', nama: 'UTS Matematika XII IPA 1', mapel: 'Matematika', kelas: 'XII IPA 1', durasi: 90, token: 'MTK123', status: 'aktif', mulai: '2025-06-01T07:30', selesai: '2025-06-01T09:00', soal: [0,1,2,3], opsiAntiCurang: { acakSoal:true, fullscreen:true, noRightClick:true, tabDetect:true, noCopy:true } },
        { id: 'UJ002', guruId: '197809152005012002', nama: 'UTS Fisika XII IPA 1', mapel: 'Fisika', kelas: 'XII IPA 1', durasi: 60, token: 'FIS456', status: 'selesai', mulai: '2025-05-20T08:00', selesai: '2025-05-20T09:00', soal: [4,5], opsiAntiCurang: { acakSoal:true, fullscreen:true, noRightClick:true, tabDetect:true, noCopy:true } },
    ],
    hasil: [
        { id: 'H001', ujianId: 'UJ002', siswaId: 'siswa001', nama: 'Ahmad Fauzi', nilai: 85, benar: 9, salah: 1, kosong: 0, durasi: '45:22', pelanggaran: 0, waktu: '2025-05-20 08:45' },
        { id: 'H002', ujianId: 'UJ002', siswaId: 'siswa002', nama: 'Bella Putri', nilai: 90, benar: 9, salah: 1, kosong: 0, durasi: '52:10', pelanggaran: 1, waktu: '2025-05-20 08:52' },
        { id: 'H003', ujianId: 'UJ002', siswaId: 'siswa003', nama: 'Candra Wijaya', nilai: 75, benar: 8, salah: 2, kosong: 0, durasi: '59:05', pelanggaran: 0, waktu: '2025-05-20 09:00' },
    ],
    aktifLog: [
        { siswa: 'Ahmad Fauzi', kelas: 'XII IPA 1', ujian: 'UTS Matematika', progress: 8, total: 20, status: 'aktif', waktuMulai: '07:35' },
        { siswa: 'Bella Putri', kelas: 'XII IPA 1', ujian: 'UTS Matematika', progress: 12, total: 20, status: 'peringatan', waktuMulai: '07:36' },
        { siswa: 'Candra Wijaya', kelas: 'XII IPA 2', ujian: 'UTS Matematika', progress: 5, total: 20, status: 'aktif', waktuMulai: '07:37' },
    ]
};
