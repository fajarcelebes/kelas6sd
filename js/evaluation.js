window.globalSiswaEvaluasi = [];

document.addEventListener("DOMContentLoaded", async function() {
    // Set default tanggal hari ini untuk semua tab
    const hariIni = new Date().toISOString().split('T')[0];
    if(document.getElementById("tglHarian")) document.getElementById("tglHarian").value = hariIni;
    if(document.getElementById("tglFormatif")) document.getElementById("tglFormatif").value = hariIni;
    if(document.getElementById("tglPerilaku")) document.getElementById("tglPerilaku").value = hariIni;

    // Mulai tarik data siswa dari server utama
    await inisialisasiDataSemuaTab();
});

// 1. Tarik Daftar Siswa & Tahun Ajar
async function inisialisasiDataSemuaTab() {
    const dropHarian = document.getElementById('filterTahunHarian');
    const dropFormatif = document.getElementById('filterTahunFormatif');
    const dropTahunPerilaku = document.getElementById('tahunPerilaku');

    try {
        // PANGGILAN MURNI TANPA TOKEN
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "read" }) 
        });
        const result = await response.json();

        if (result.status === "success") {
            window.globalSiswaEvaluasi = result.data; 
            
            const tahunUnik = [...new Set(result.data.map(s => s.tahun_ajar).filter(t => t))].sort().reverse();
            let opsiTahun = '<option value="">-- Pilih Tahun Ajar --</option>';
            tahunUnik.forEach(t => opsiTahun += `<option value="${t}">${t}</option>`);

            if(dropHarian) dropHarian.innerHTML = opsiTahun;
            if(dropFormatif) dropFormatif.innerHTML = opsiTahun;
            if(dropTahunPerilaku) dropTahunPerilaku.innerHTML = opsiTahun;

            if (tahunUnik.length > 0) {
                if(dropHarian) { dropHarian.value = tahunUnik[0]; window.muatTabelNilai(); }
                if(dropFormatif) { dropFormatif.value = tahunUnik[0]; window.muatTabelFormatif(); }
                if(dropTahunPerilaku) { 
                    dropTahunPerilaku.value = tahunUnik[0]; 
                    window.muatSiswaPerilaku(); 
                }
            }
        } else {
            console.error("Gagal menarik data:", result.message);
            alert("Gagal menarik data dari server utama: " + result.message);
        }
    } catch (error) {
        console.error("Gagal memuat data dari server:", error);
        alert("Gagal terhubung ke server utama. Periksa koneksi atau URL di config.js");
    }
}

// ==========================================
// LOGIKA TAB 1: PENILAIAN HARIAN
// ==========================================
window.muatTabelNilai = function() {
    const tahunTerpilih = document.getElementById('filterTahunHarian').value;
    const areaTabel = document.getElementById('areaTabelNilai');
    const tbody = document.getElementById('tbodyNilaiMassal');
    if (!tahunTerpilih) { areaTabel.style.display = 'none'; return; }

    areaTabel.style.display = 'block';
    tbody.innerHTML = "";
    const siswaTersaring = window.globalSiswaEvaluasi.filter(s => s.tahun_ajar === tahunTerpilih);

    if (siswaTersaring.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Tidak ada data siswa.</td></tr>`;
        return;
    }
    siswaTersaring.forEach((siswa, index) => {
        const idInputUnik = `input_harian_${siswa.nisn}`;
        
        tbody.innerHTML += `
            <tr>
                <td class="text-center fw-bold text-secondary align-middle py-1">${index + 1}</td>
                <td class="text-secondary align-middle py-1">${siswa.nisn}</td>
                <td class="fw-bold align-middle py-1" style="font-size: 0.95rem;">${siswa.name}</td>
                <td class="py-1">
                    <label for="${idInputUnik}" class="visually-hidden">Nilai Harian untuk ${siswa.name}</label>
                    <input type="number" 
                           id="${idInputUnik}" 
                           name="${idInputUnik}"
                           class="form-control form-control-sm text-center fw-bold border-primary text-primary mx-auto shadow-sm input-nilai-massal" 
                           style="background-color: #f4f9ff; max-width: 90px;"
                           data-nisn="${siswa.nisn}" data-nama="${siswa.name}" 
                           min="0" max="100" placeholder="0">
                </td>
            </tr>`;
    });
};

window.simpanNilaiMassal = async function() {
    let tanggal = document.getElementById("tglHarian").value;
    const mapel = document.getElementById("mapelHarian").value;
    const tugas = document.getElementById("tugasHarian").value;
    const tahunAjar = document.getElementById('filterTahunHarian').value;

    if (!tanggal) tanggal = new Date().toISOString().split('T')[0];
    const inputSemuaNilai = document.querySelectorAll('.input-nilai-massal');
    let payloadData = [];

    inputSemuaNilai.forEach(input => {
        if (input.value !== "") {
            const unikId = "EVAL-" + new Date().getTime() + "-" + input.getAttribute('data-nisn');
            payloadData.push({
                id: unikId, tanggal: tanggal, nisn: input.getAttribute('data-nisn'), nama: input.getAttribute('data-nama'),
                tahun_ajar: tahunAjar, mapel: mapel, jenis_tugas: tugas, nilai_harian: input.value
            });
        }
    });

    if (payloadData.length === 0) { alert("⚠️ Peringatan: Belum ada nilai yang diinput!"); return; }

    const btn = document.getElementById("btnSimpanMassal");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;
    btn.disabled = true;

    try {
        const response = await fetch(window.EVAL_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "save_bulk_evaluation", data: payloadData }) 
        });
        const result = await response.json();
        if (result.status === "success") {
            alert(`✅ Berhasil! ${payloadData.length} data harian disimpan.`);
            inputSemuaNilai.forEach(input => input.value = ""); 
            document.getElementById("tugasHarian").value = "";
        } else { alert("❌ Gagal: " + result.message); }
    } catch (error) {
        alert("❌ Terjadi kesalahan jaringan.");
    } finally {
        btn.innerHTML = originalText; btn.disabled = false;
    }
};

// ==========================================
// LOGIKA TAB 2: PENILAIAN FORMATIF
// ==========================================
window.muatTabelFormatif = function() {
    const tahunTerpilih = document.getElementById('filterTahunFormatif').value;
    const areaTabel = document.getElementById('areaTabelFormatif');
    const tbody = document.getElementById('tbodyFormatifMassal');
    
    if (!areaTabel || !tbody) return; // Mencegah error jika elemen tidak ditemukan

    if (!tahunTerpilih) { areaTabel.style.display = 'none'; return; }

    areaTabel.style.display = 'block';
    tbody.innerHTML = "";
    const siswaTersaring = window.globalSiswaEvaluasi.filter(s => s.tahun_ajar === tahunTerpilih);

    if (siswaTersaring.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Tidak ada data.</td></tr>`;
        return;
    }
    
    siswaTersaring.forEach((siswa, index) => {
        const idInputUnik = `input_formatif_${siswa.nisn}`;

        tbody.innerHTML += `
            <tr>
                <td class="text-center fw-bold text-secondary align-middle py-1">${index + 1}</td>
                <td class="text-secondary align-middle py-1">${siswa.nisn}</td>
                <td class="fw-bold align-middle py-1" style="font-size: 0.95rem;">${siswa.name}</td>
                <td class="py-1">
                    <label for="${idInputUnik}" class="visually-hidden">Nilai Formatif untuk ${siswa.name}</label>
                    <input type="number" 
                           id="${idInputUnik}" 
                           name="${idInputUnik}"
                           class="form-control form-control-sm text-center fw-bold border-primary text-primary mx-auto shadow-sm input-nilai-formatif" 
                           style="background-color: #f4f9ff; max-width: 90px;"
                           data-nisn="${siswa.nisn}" data-nama="${siswa.name}" 
                           min="0" max="100" placeholder="0">
                </td>
            </tr>`;
    });
};

window.simpanFormatifMassal = async function() {
    let tanggal = document.getElementById("tglFormatif").value;
    const mapel = document.getElementById("mapelFormatif").value;
    const bab = document.getElementById("babFormatif").value;
    const topik = document.getElementById("topikFormatif").value; // Variabel Topik
    const judulBab = document.getElementById("judulBabFormatif").value; 
    const tahunAjar = document.getElementById('filterTahunFormatif').value;

    if (!tanggal) tanggal = new Date().toISOString().split('T')[0];
    const inputSemuaNilai = document.querySelectorAll('.input-nilai-formatif');
    let payloadData = [];

    inputSemuaNilai.forEach(input => {
        if (input.value !== "") {
            const unikId = "FORM-" + new Date().getTime() + "-" + input.getAttribute('data-nisn');
            payloadData.push({
                id: unikId, 
                tanggal: tanggal, 
                nisn: input.getAttribute('data-nisn'), 
                nama: input.getAttribute('data-nama'),
                tahun_ajar: tahunAjar, 
                mapel: mapel, 
                bab: bab, 
                topik: topik, 
                judul_bab: judulBab, 
                nilai_formatif: input.value
            });
        }
    });

    if (payloadData.length === 0) { alert("⚠️ Peringatan: Belum ada nilai formatif yang diinput!"); return; }

    const btn = document.getElementById("btnSimpanFormatif");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;
    btn.disabled = true;

    try {
        const response = await fetch(window.EVAL_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "save_bulk_formatif", data: payloadData }) 
        });
        const result = await response.json();
        if (result.status === "success") {
            alert(`✅ Berhasil! ${payloadData.length} data formatif disimpan.`);
            inputSemuaNilai.forEach(input => input.value = ""); 
            document.getElementById("judulBabFormatif").value = "";
        } else { alert("❌ Gagal: " + result.message); }
    } catch (error) {
        alert("❌ Terjadi kesalahan jaringan.");
    } finally {
        btn.innerHTML = originalText; btn.disabled = false;
    }
};

// ==========================================
// LOGIKA TAB 3: DOKUMENTASI PERILAKU
// ==========================================
window.muatSiswaPerilaku = function() {
    const tahunTerpilih = document.getElementById('tahunPerilaku').value;
    const dropdownSiswa = document.getElementById('siswaPerilaku');
    
    if (!dropdownSiswa) return;
    
    dropdownSiswa.innerHTML = '<option value="">-- Pilih Siswa --</option>';
    if (!tahunTerpilih) return;
    
    const siswaTersaring = window.globalSiswaEvaluasi.filter(s => s.tahun_ajar === tahunTerpilih);
    
    siswaTersaring.forEach(s => {
        dropdownSiswa.innerHTML += `<option value="${s.nisn}" data-nama="${s.name}">${s.name} (NISN: ${s.nisn})</option>`;
    });
};

const formPerilaku = document.getElementById("formPerilaku");
if (formPerilaku) {
    formPerilaku.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById("btnSimpanPerilaku");
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;
        btn.disabled = true;

        try {
            const selectSiswa = document.getElementById("siswaPerilaku");
            const nisnTerpilih = selectSiswa.value;
            const namaTerpilih = selectSiswa.options[selectSiswa.selectedIndex].getAttribute('data-nama');

            const idUnik = "PRLK-" + new Date().getTime() + "-" + nisnTerpilih;

            let payloadData = {
                id: idUnik,
                nisn: nisnTerpilih,
                nama: namaTerpilih,
                tahun_ajar: document.getElementById("tahunPerilaku").value,
                tanggal: document.getElementById("tglPerilaku").value,
                catatan_perilaku: document.getElementById("catatanPerilaku").value,
                file_foto_perilaku: ""
            };

            const fileInput = document.getElementById("fotoPerilaku");
            if (fileInput && fileInput.files.length > 0) {
                payloadData.file_foto_perilaku = await window.konversiFileToBase64(fileInput.files[0]);
            }

            const response = await fetch(window.EVAL_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "save_perilaku", data: payloadData }) 
            });
            const result = await response.json();
            
            if (result.status === "success") {
                alert("✅ Catatan perilaku dan dokumentasi berhasil disimpan!");
                formPerilaku.reset();
                document.getElementById("tglPerilaku").value = new Date().toISOString().split('T')[0];
            } else { alert("❌ Gagal menyimpan: " + result.message); }
        } catch (error) {
            console.error(error); alert("Terjadi kesalahan jaringan.");
        } finally {
            btn.innerHTML = originalText; btn.disabled = false;
        }
    });
}