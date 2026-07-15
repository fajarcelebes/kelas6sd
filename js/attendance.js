// =========================================================================
// ATTENDANCE CONTROLLER - LOGIKA KEHADIRAN SISWA
// =========================================================================

window.globalSiswaAbsen = [];

document.addEventListener("DOMContentLoaded", async function() {
    // 1. Mengatur Teks Tanggal Hari Ini di Header (Sudut Kanan Atas)
    const elCurrentDate = document.getElementById("currentDate");
    if (elCurrentDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elCurrentDate.innerText = new Date().toLocaleDateString('id-ID', options);
    }

    // 2. Mengatur Default Tanggal di Input Date secara Presisi (Waktu Lokal)
    const elInputTanggal = document.getElementById("inputTanggalAbsen");
    if (elInputTanggal && !elInputTanggal.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        elInputTanggal.value = `${yyyy}-${mm}-${dd}`;
    }

    // 3. Panggil Pemicu Pengisian Otomatis Dropdown Tahun Ajar
    await window.inisialisasiFilterTahunAjarAbsen();
});

// --- FUNGSI MENGAMBIL DATA SISWA UNTUK MENGISI DROPDOWN TAHUN AJAR ---
window.inisialisasiFilterTahunAjarAbsen = async function() {
    const dropdown = document.getElementById('filterTahunAjarAbsen');
    if (!dropdown) return;

    try {
        // Ambil data siswa dari server untuk mendeteksi tahun ajaran apa saja yang aktif
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "read" })
        });
        const result = await response.json();

        if (result.status === "success") {
            const dataSiswa = result.data;
            // Ambil daftar tahun ajar unik dan urutkan dari yang terbaru (descending)
            const tahunUnik = [...new Set(dataSiswa.map(s => s.tahun_ajar).filter(t => t))].sort().reverse();
            
            dropdown.innerHTML = '<option value="">Semua Tahun Ajar</option>';
            tahunUnik.forEach(t => {
                dropdown.innerHTML += `<option value="${t}">${t}</option>`;
            });

            // Langsung set pilihan ke Tahun Ajar paling terbaru secara default
            if (tahunUnik.length > 0) {
                dropdown.value = tahunUnik[0];
            }
        }
    } catch (error) {
        console.error("Gagal memuat sistem filter tahun ajar absensi:", error);
    }
};

// --- FUNGSI MEMUAT DAFTAR SISWA BERDASARKAN TAHUN AJAR & TANGGAL YANG DIPILIH ---
window.muatTabelAbsensi = async function() {
    const tahunAjar = document.getElementById('filterTahunAjarAbsen').value;
    const tanggal = document.getElementById('inputTanggalAbsen').value;
    const tbody = document.getElementById('tbodyAttendance');
    const areaTabel = document.getElementById('areaTabelAbsensi');
    const labelTanggal = document.getElementById('labelTanggalTampil');

    if (!tahunAjar) {
        alert("Silakan pilih Tahun Ajar terlebih dahulu!");
        return;
    }
    if (!tanggal) {
        alert("Silakan tentukan tanggal absensi!");
        return;
    }

    // Munculkan kontainer tabel harian
    areaTabel.style.display = 'block';
    if (labelTanggal) {
        const d = new Date(tanggal);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        labelTanggal.innerText = d.toLocaleDateString('id-ID', options);
    }

    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i>Menyelaraskan data absensi siswa...</td></tr>`;

    try {
        // A. Ambil Data Siswa Aktif
        const resSiswa = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "read" })
        });
        const dataSiswaJson = await resSiswa.json();
        
        // Saring siswa hanya yang memiliki Tahun Ajar sesuai filter
        const siswaTersaring = dataSiswaJson.data.filter(s => s.tahun_ajar === tahunAjar);
        window.globalSiswaAbsen = siswaTersaring; // Simpan di memori lokal untuk proses simpan data nanti

        if (siswaTersaring.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada data siswa terdaftar pada Tahun Ajar ${tahunAjar}.</td></tr>`;
            return;
        }

        // B. Ambil Log Absen yang Mungkin Sudah Disimpan di Tanggal Tersebut
        const resAbsen = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "get_attendance", tanggal: tanggal })
        });
        const dataAbsenJson = await resAbsen.json();
        const logAbsenHariIni = dataAbsenJson.data || [];

        // C. Gambar Baris Tabel Beserta Radio Button Status Kehadirannya
        tbody.innerHTML = "";
        siswaTersaring.forEach((siswa, index) => {
            // Cek apakah siswa ini sudah memiliki rekam absensi pada hari ini
            const sudahAdaLog = logAbsenHariIni.find(a => String(a.nisn) === String(siswa.nisn));
            const statusTerpilih = sudahAdaLog ? sudahAdaLog.status : "H"; // Default diatur "H" (Hadir) jika belum diabsen
            const keteranganLama = sudahAdaLog ? sudahAdaLog.keterangan : "";

            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary align-middle">${index + 1}</td>
                    <td class="fw-semibold text-secondary align-middle">${siswa.nisn || '-'}</td>
                    <td class="align-middle"><span class="fw-bold text-dark">${siswa.name || '-'}</span></td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center gap-2">
                            <input type="radio" class="btn-check" name="status_${siswa.nisn}" id="H_${siswa.nisn}" value="H" ${statusTerpilih === 'H' ? 'checked' : ''}>
                            <label class="absen-radio-label btn btn-outline-success" for="H_${siswa.nisn}">H</label>

                            <input type="radio" class="btn-check" name="status_${siswa.nisn}" id="I_${siswa.nisn}" value="I" ${statusTerpilih === 'I' ? 'checked' : ''}>
                            <label class="absen-radio-label btn btn-outline-warning text-dark" for="I_${siswa.nisn}">I</label>

                            <input type="radio" class="btn-check" name="status_${siswa.nisn}" id="S_${siswa.nisn}" value="S" ${statusTerpilih === 'S' ? 'checked' : ''}>
                            <label class="absen-radio-label btn btn-outline-info" for="S_${siswa.nisn}">S</label>

                            <input type="radio" class="btn-check" name="status_${siswa.nisn}" id="A_${siswa.nisn}" value="A" ${statusTerpilih === 'A' ? 'checked' : ''}>
                            <label class="absen-radio-label btn btn-outline-danger" for="A_${siswa.nisn}">A</label>
                        </div>
                    </td>
                    <td class="align-middle">
                        <input type="text" class="form-control form-control-sm border-0 bg-light" id="ket_${siswa.nisn}" value="${keteranganLama}" placeholder="Catatan/Alasan...">
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4"><i class="fa-solid fa-triangle-exclamation me-2"></i>Gagal menarik data log kehadiran harian.</td></tr>`;
        console.error("Error Muat Absensi:", error);
    }
};

// --- FUNGSI UNTUK MENYIMPAN DATA ABSENSI HARIAN KE GOOGLE SHEETS ---
window.simpanDataAbsensi = async function() {
    const tanggal = document.getElementById('inputTanggalAbsen').value;
    const btnSimpan = document.getElementById('btnSimpanAbsen');
    
    if (window.globalSiswaAbsen.length === 0) {
        alert("Tidak ada data kehadiran siswa yang dapat dikirim.");
        return;
    }

    const originalText = btnSimpan.innerHTML;
    btnSimpan.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Rekam Kehadiran...`;
    btnSimpan.disabled = true;

    // Ambil semua status radio button dari baris tabel
    const payloadData = [];
    window.globalSiswaAbsen.forEach(siswa => {
        const radioTerpilih = document.querySelector(`input[name="status_${siswa.nisn}"]:checked`);
        const statusVal = radioTerpilih ? radioTerpilih.value : "H";
        const keteranganVal = document.getElementById(`ket_${siswa.nisn}`).value;

        payloadData.push({
            nisn: siswa.nisn,
            status: statusVal,
            keterangan: keteranganVal
        });
    });

    try {
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "save_attendance",
                tanggal: tanggal,
                data: payloadData
            })
        });
        const result = await response.json();

        if (result.status === "success") {
            alert("✅ Berhasil! Rekam absensi siswa telah disimpan ke lembar Google Sheets.");
            window.muatTabelAbsensi(); // Muat ulang tabel untuk sinkronisasi
        } else {
            alert("❌ Gagal menyimpan data absensi: " + result.message);
        }
    } catch (error) {
        alert("❌ Terjadi pemutusan jaringan sewaktu mengirim data ke server.");
        console.error("Error Simpan Absensi:", error);
    } finally {
        btnSimpan.innerHTML = originalText;
        btnSimpan.disabled = false;
    }
};