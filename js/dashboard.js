// =========================================================================
// DASHBOARD CONTROLLER - Khusus untuk halaman Dashboard
// =========================================================================

window.updateKartuRingkasan = function(data) {
    const elTotal = document.getElementById('totalSiswaText');
    if(elTotal) {
        elTotal.innerText = data.length;
        document.getElementById('totalLakiText').innerText = data.filter(s => s.gender === 'L' || s.gender === 'Laki-Laki').length;
        document.getElementById('totalPerempuanText').innerText = data.filter(s => s.gender === 'P' || s.gender === 'Perempuan').length;
    }
};

window.isiDropdownTahunAjarDashboard = function(data) {
    const dropdown = document.getElementById('filterTahunAjar');
    const exportDropdown = document.getElementById('exportTahunAjar'); // Sasaran untuk form Cetak Laporan
    
    if (!dropdown) return;
    
    // Mencari tahun ajar unik dari data
    const tahunUnik = [...new Set(data.map(i => i.tahun_ajar).filter(t => t))].sort().reverse();
    
    // 1. Mengisi Dropdown Filter Utama di Dashboard
    dropdown.innerHTML = '<option value="">Semua Tahun Ajar</option>';
    tahunUnik.forEach(t => dropdown.innerHTML += `<option value="${t}">${t}</option>`);
    
    // 2. Mengisi Dropdown di Modal Cetak Laporan (Hanya berisi tahun spesifik)
    if (exportDropdown) {
        exportDropdown.innerHTML = ''; 
        tahunUnik.forEach(t => exportDropdown.innerHTML += `<option value="${t}">${t}</option>`);
    }
    
    // Setel pilihan pertama secara otomatis jika ada datanya
    if (tahunUnik.length > 0) {
        dropdown.value = tahunUnik[0]; 
        if (exportDropdown) exportDropdown.value = tahunUnik[0];
    }
    
    window.filterDataDashboard();
};

window.filterDataDashboard = function() {
    const searchInput = document.getElementById('searchDashboard');
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const dropdown = document.getElementById('filterTahunAjar');
    const tahunAjar = dropdown ? dropdown.value : '';
    
    const tersaring = window.globalDataSiswa.filter(s => {
        const namaCocok = String(s.name || '').toLowerCase().includes(keyword);
        const nisnCocok = String(s.nisn || '').toLowerCase().includes(keyword);
        const tahunCocok = (tahunAjar === "" || s.tahun_ajar === tahunAjar);
        
        return (namaCocok || nisnCocok) && tahunCocok;
    });
    
    window.updateKartuRingkasan(tersaring);
    window.renderTabelDashboard(tersaring, (tahunAjar !== "" || keyword !== ""));
};

window.renderTabelDashboard = function(dataArray, tampilkanSemua = false) {
    const tbody = document.getElementById('tbodyDashboard');
    if (!tbody) return;
    tbody.innerHTML = ""; 
    const dataTampil = tampilkanSemua ? dataArray : dataArray.slice(0, 10);
    
    if (dataTampil.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Tidak ada data.</td></tr>`;
        return;
    }
    
    dataTampil.forEach((s, index) => {
        const nama = s.name || '-';
        const desa = s.parent_village || '-'; 
        
        const temaWarna = s.gender === 'L' 
            ? 'bg-primary-subtle text-primary-emphasis border-primary-subtle' 
            : 'bg-danger-subtle text-danger-emphasis border-danger-subtle';
        
        tbody.innerHTML += `
            <tr>
                <td class="text-center fw-bold text-secondary align-middle">${index + 1}</td>
                <td class="align-middle">
                    <div class="d-flex align-items-center">
                        <span class="${temaWarna} px-3 py-1 rounded-pill border fw-bold shadow-sm" style="font-size: 0.85rem; letter-spacing: 0.5px;">${nama}</span>
                    </div>
                </td>
                <td class="text-center align-middle"><span class="badge ${temaWarna} border px-2 py-1 shadow-sm">${s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span></td>
                <td class="text-center align-middle text-secondary fw-medium">${s.tahun_ajar || '-'}</td>
                <td class="text-center align-middle text-dark fw-semibold">${desa}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-outline-info rounded-pill shadow-sm fw-semibold" onclick="window.lihatDetailSiswa('${s.id}')">
                        <i class="fa-solid fa-eye me-1"></i>Detail
                    </button>
                </td>
            </tr>`;
    });
};

window.renderStatistikDashboard = async function() {
    const sectionStatistik = document.getElementById('sectionStatistik');
    if (!sectionStatistik) return; 

    sectionStatistik.style.display = 'flex';

    const mapels = ['mtk', 'bin', 'ipas', 'pkn', 'sbdp', 'pjok', 'bing', 'agm', 'mulok'];
    const labelMapels = ['MTK', 'B.Indo', 'IPAS', 'PKN', 'SBDP', 'PJOK', 'B.Ing', 'Agama', 'Mulok'];
    let rataUts = [], rataUas = [];

    mapels.forEach(mp => {
        let totalUts = 0, countUts = 0;
        let totalUas = 0, countUas = 0;

        window.globalDataSiswa.forEach(s => {
            let uts1 = parseFloat(s[`nilai_uts_smt1_${mp}`]) || 0;
            let uts2 = parseFloat(s[`nilai_uts_smt2_${mp}`]) || 0;
            if (uts1 > 0) { totalUts += uts1; countUts++; }
            if (uts2 > 0) { totalUts += uts2; countUts++; }

            let uas1 = parseFloat(s[`nilai_uas_smt1_${mp}`]) || 0;
            let uas2 = parseFloat(s[`nilai_uas_smt2_${mp}`]) || 0;
            if (uas1 > 0) { totalUas += uas1; countUas++; }
            if (uas2 > 0) { totalUas += uas2; countUas++; }
        });

        rataUts.push(countUts > 0 ? (totalUts / countUts).toFixed(1) : 0);
        rataUas.push(countUas > 0 ? (totalUas / countUas).toFixed(1) : 0);
    });

    try {
        const ctxNilai = document.getElementById('chartNilai');
        if (window.chartNilaiInstance) window.chartNilaiInstance.destroy(); 
        window.chartNilaiInstance = new Chart(ctxNilai, {
            type: 'bar',
            data: {
                labels: labelMapels,
                datasets: [
                    { label: 'Rata-rata UTS', data: rataUts, backgroundColor: 'rgba(54, 162, 235, 0.7)', borderWidth: 1, borderRadius: 4 },
                    { label: 'Rata-rata UAS', data: rataUas, backgroundColor: 'rgba(255, 99, 132, 0.7)', borderWidth: 1, borderRadius: 4 }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    } catch (err) {
        console.error("Gagal menggambar chart nilai.", err);
    }

    let dataAbsen = [0, 0, 0, 0];
    let ctxAbsen;
    try {
        ctxAbsen = document.getElementById('chartAbsen');
        if (window.chartAbsenInstance) window.chartAbsenInstance.destroy();
        window.chartAbsenInstance = new Chart(ctxAbsen, {
            type: 'doughnut',
            data: {
                labels: ['Hadir', 'Izin', 'Sakit', 'Alpa'],
                datasets: [{
                    data: dataAbsen,
                    backgroundColor: ['#198754', '#ffc107', '#0dcaf0', '#dc3545'],
                    borderWidth: 2, hoverOffset: 5
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    } catch (err) {}

    try {
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "get_all_attendance" })
        });
        const result = await response.json();
        
        if (result.status === "success" && result.data) {
            let hadir = 0, izin = 0, sakit = 0, alpa = 0;
            result.data.forEach(a => {
                if (a.status === 'H') hadir++;
                else if (a.status === 'I') izin++;
                else if (a.status === 'S') sakit++;
                else if (a.status === 'A') alpa++;
            });
            
            if (window.chartAbsenInstance) {
                window.chartAbsenInstance.data.datasets[0].data = [hadir, izin, sakit, alpa];
                window.chartAbsenInstance.update();
            }
        }
    } catch (e) {
        console.error("Gagal memuat rekap absen dari server:", e);
    }
};

// =========================================================================
// FUNGSI CETAK LAPORAN FORMATIF (LAYOUT A4 LANDSCAPE)
// =========================================================================

window.cetakFormatifLayout = async function() {
    const tahunAjar = document.getElementById('exportTahunAjar').value;
    const mapel = document.getElementById('exportMapel').value;
    const mapelLabel = document.getElementById('exportMapel').options[document.getElementById('exportMapel').selectedIndex].text;
    const semester = document.getElementById('exportSemester').value; // 'ganjil' atau 'genap'
    
    if (!tahunAjar) { alert("Silakan pilih Tahun Ajar terlebih dahulu!"); return; }

    const btn = document.getElementById('btnProsesExport');
    const textAwal = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyiapkan Dokumen...`;
    btn.disabled = true;

    try {
        // 1. Ambil Data Formatif Mentah dari Backend 2
        const response = await fetch(window.EVAL_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "export_data", jenis: "formatif_detail", mapel: mapel })
        });
        const result = await response.json();

        if(result.status === "success") {
            const dataRaw = result.data; 
            
            // 2. Ambil Daftar Siswa Khusus Tahun Ajar yang dipilih (Dari memory global)
            const siswaTersaring = window.globalDataSiswa.filter(s => s.tahun_ajar === tahunAjar);
            if (siswaTersaring.length === 0) {
                alert("Tidak ada data siswa pada tahun ajar ini.");
                return;
            }

            // 3. Konfigurasi Pembagian Bab
            const isGanjil = (semester === 'ganjil');
            const babStart = isGanjil ? 1 : 6;
            const babEnd = isGanjil ? 5 : 10;
            const namaSemester = isGanjil ? "Ganjil" : "Genap";
            
            // Catatan: Gambar layout meminta 5 Topik per Bab
            const maxTopik = 5; 
            const totalKolomNilai = 5 /* Bab */ * 5 /* Topik */;
            
            // Array penyimpan nilai untuk menghitung jumlah vertikal di footer
            let sumPerKolom = new Array(totalKolomNilai).fill(0);
            let countPerKolom = new Array(totalKolomNilai).fill(0);

            // 4. Membangun Header Tabel HTML (Sesuai Gambar)
            let theadHTML = `
                <tr>
                    <th rowspan="3" style="vertical-align: middle; width: 3%;">No.</th>
                    <th rowspan="3" style="vertical-align: middle; width: 17%; background-color: #fff9db;">Nama Peserta Didik</th>
            `;
            // Baris Header 1: Bab 1, Bab 2, dst (dengan warna berbeda-beda)
            const warnaBab = ["#d4edda", "#cce5ff", "#fff3cd", "#f8d7da", "#e2d9f3"]; // Hijau, Biru, Kuning, Merah Muda, Ungu
            for(let b = babStart, i = 0; b <= babEnd; b++, i++) {
                theadHTML += `<th colspan="5" style="background-color: ${warnaBab[i]}; font-weight: bold; font-size: 9pt;">BAB ${b}</th>`;
            }
            theadHTML += `</tr><tr>`;
            // Baris Header 2: Topik 1 - 5
            for(let b = babStart; b <= babEnd; b++) {
                for(let t = 1; t <= maxTopik; t++) {
                    theadHTML += `<th style="font-size: 7pt;">Topik ${t}</th>`;
                }
            }
            theadHTML += `</tr><tr>`;
            // Baris Header 3: (0-100)
            for(let b = babStart; b <= babEnd; b++) {
                for(let t = 1; t <= maxTopik; t++) {
                    theadHTML += `<th style="font-size: 7pt; font-weight: normal;">(0-100)</th>`;
                }
            }
            theadHTML += `</tr>`;

            // 5. Membangun Isi Tabel (Row per Siswa)
            let tbodyHTML = "";
            siswaTersaring.forEach((siswa, index) => {
                tbodyHTML += `<tr>`;
                tbodyHTML += `<td style="font-weight: bold;">${index + 1}</td>`;
                tbodyHTML += `<td style="text-align: left; padding-left: 5px;">${siswa.name}</td>`;
                
                // Cari baris data formatif anak ini
                const barisSiswa = dataRaw.find(row => String(row[2]) === String(siswa.nisn));

                let kolomIndexVirtual = 0; // Untuk melacak posisi array penjumlah (0 - 24)

                for(let b = babStart; b <= babEnd; b++) {
                    for(let t = 1; t <= maxTopik; t++) {
                        let nilaiStr = "";
                        let nilaiAngka = 0;

                        if (barisSiswa) {
                            // Rumus Indeks Backend kita sebelumnya: 6 + ((Bab - 1) * 10) + (Topik - 1)
                            const letakKolomSheet = 6 + ((b - 1) * 10) + (t - 1);
                            nilaiStr = barisSiswa[letakKolomSheet] || "";
                            nilaiAngka = parseFloat(nilaiStr);
                        }

                        if (!isNaN(nilaiAngka) && nilaiStr !== "") {
                            sumPerKolom[kolomIndexVirtual] += nilaiAngka;
                            countPerKolom[kolomIndexVirtual]++;
                        }

                        tbodyHTML += `<td>${nilaiStr}</td>`;
                        kolomIndexVirtual++;
                    }
                }
                tbodyHTML += `</tr>`;
            });

            // 6. Membangun Footer Tabel (Jumlah & Rata-rata)
            let tfootHTML = `
                <tr>
                    <td colspan="2" style="font-weight: bold; text-align: left; padding-left: 5px;">Jumlah</td>
            `;
            for(let k = 0; k < totalKolomNilai; k++) {
                let warnaGroup = Math.floor(k / 5); // Tentukan warna berdasarkan Bab
                tfootHTML += `<td style="background-color: ${warnaBab[warnaGroup]}40;">${countPerKolom[k] > 0 ? sumPerKolom[k] : ''}</td>`;
            }
            tfootHTML += `</tr><tr>`;
            tfootHTML += `<td colspan="2" style="font-weight: bold; text-align: left; padding-left: 5px;">Rata-rata</td>`;
            for(let k = 0; k < totalKolomNilai; k++) {
                let warnaGroup = Math.floor(k / 5);
                let rata = countPerKolom[k] > 0 ? (sumPerKolom[k] / countPerKolom[k]).toFixed(1) : '';
                tfootHTML += `<td style="background-color: ${warnaBab[warnaGroup]}40;">${rata}</td>`;
            }
            tfootHTML += `</tr>`;

            // 7. Merakit HTML Dokumen Secara Utuh (Sesuai Gambar)
            const dokumenKertasHTML = `
                <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 10mm; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 16pt; font-weight: bold; color: #1a365d;">NILAI FORMATIF PER BAB (PER TOPIK)</h2>
                    </div>

                    <table style="width: 100%; border: none; margin-bottom: 10px; font-size: 10pt;">
                        <tr>
                            <td style="width: 12%;">Mata Pelajaran</td>
                            <td style="width: 48%;">: ${mapelLabel}</td>
                            <td style="width: 10%;">Semester</td>
                            <td style="width: 30%;">: ${namaSemester}</td>
                        </tr>
                        <tr>
                            <td>Kelas </td>
                            <td>: Kelas 6 </td>
                            <td>Guru</td>
                            <td>: ___________________________</td>
                        </tr>
                    </table>

                    <table class="tabel-nilai" border="1" cellpadding="3" cellspacing="0" style="width: 100%; text-align: center; border-collapse: collapse; font-size: 9pt;">
                        <thead>${theadHTML}</thead>
                        <tbody>${tbodyHTML}</tbody>
                        <tfoot>${tfootHTML}</tfoot>
                    </table>

                    <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
                        <div style="width: 60%; display: flex; justify-content: space-between; text-align: center;">
                            <div style="width: 45%;">
                                <br>Mengetahui,<br>Kepala Sekolah<br><br><br><br><br>
                                ( ___________________________ )<br>NIP. ___________________________
                            </div>
                            <div style="width: 45%;">
                                Tanggal : ___________________<br><br>Guru Mata Pelajaran<br><br><br><br><br>
                                ( ___________________________ )<br>NIP. __________________________
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 8. Tampilkan Dialog Cetak
            let printIframe = document.getElementById('printIframeHidden');
            if (!printIframe) {
                printIframe = document.createElement('iframe');
                printIframe.id = 'printIframeHidden';
                printIframe.style.position = 'fixed';
                printIframe.style.width = '0';
                printIframe.style.height = '0';
                printIframe.style.border = 'none';
                document.body.appendChild(printIframe);
            }

            const doc = printIframe.contentDocument || printIframe.contentWindow.document;
            doc.open();
            // Mengatur halaman menjadi A4 Landscape!
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Cetak Nilai Formatif</title>
                    <style>
                        @page { size: A4 landscape; margin: 1cm; }
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        
                        /* ATURAN BORDER HANYA UNTUK TABEL NILAI SAJA */
                        .tabel-nilai th, .tabel-nilai td { border: 1px solid #000 !important; }
                    </style>
                </head>
                <body>${dokumenKertasHTML}</body>
                </html>
            `);
            doc.close();

            // Tutup pop-up lalu buka menu print sistem operasi
            bootstrap.Modal.getInstance(document.getElementById('modalExport')).hide();
            setTimeout(() => {
                printIframe.contentWindow.focus();
                printIframe.contentWindow.print();
            }, 300);

        } else {
            alert("Gagal memuat data dari server: " + result.message);
        }
    } catch(e) {
        console.error(e);
        alert("Terjadi kesalahan jaringan.");
    } finally {
        btn.innerHTML = textAwal;
        btn.disabled = false;
    }
};

// Mengatur tampilan opsi berdasarkan jenis laporan yang dipilih
window.toggleFilterCetak = function() {
    const jenis = document.getElementById('exportJenisLaporan').value;
    const filterAkademik = document.getElementById('filterAkademik');
    const filterAbsensi = document.getElementById('filterAbsensi');
    
    if (jenis === 'absen_bulanan') {
        if (filterAkademik) filterAkademik.style.display = 'none';
        if (filterAbsensi) filterAbsensi.style.display = 'block';
        
        // Otomatis set bulan ke bulan saat ini jika belum diisi
        const inputBulan = document.getElementById('exportBulan');
        if (inputBulan && !inputBulan.value) {
            const sekarang = new Date();
            const yyyy = sekarang.getFullYear();
            const mm = String(sekarang.getMonth() + 1).padStart(2, '0');
            inputBulan.value = `${yyyy}-${mm}`;
        }
    } else {
        if (filterAkademik) filterAkademik.style.display = 'block';
        if (filterAbsensi) filterAbsensi.style.display = 'none';
    }
};

window.prosesCetakLaporan = function() {
    const jenisLaporan = document.getElementById('exportJenisLaporan').value;
    if (jenisLaporan === 'format1') {
        window.cetakFormatifLayout();
    } else if (jenisLaporan === 'format2') {
        window.cetakSumatifLayout();
    } else if (jenisLaporan === 'absen_bulanan') {
        window.cetakRekapAbsen();
    }
};

// =========================================================================
// FUNGSI CETAK LAPORAN SUMATIF (FORMAT 2)
// =========================================================================
window.cetakSumatifLayout = async function() {
    const tahunAjar = document.getElementById('exportTahunAjar').value;
    const mapel = document.getElementById('exportMapel').value;
    const mapelLabel = document.getElementById('exportMapel').options[document.getElementById('exportMapel').selectedIndex].text;
    const semester = document.getElementById('exportSemester').value; 
    
    if (!tahunAjar) { alert("Silakan pilih Tahun Ajar terlebih dahulu!"); return; }

    const btn = document.getElementById('btnProsesExport');
    const textAwal = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyiapkan Dokumen...`;
    btn.disabled = true;

    try {
        // 1. Tarik Data Formatif Mentah untuk dihitung rata-ratanya
        const response = await fetch(window.EVAL_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "export_data", jenis: "formatif_detail", mapel: mapel })
        });
        const result = await response.json();

        if(result.status === "success") {
            const dataRaw = result.data; 
            const siswaTersaring = window.globalDataSiswa.filter(s => s.tahun_ajar === tahunAjar);
            if (siswaTersaring.length === 0) {
                alert("Tidak ada data siswa pada tahun ajar ini.");
                return;
            }

            const isGanjil = (semester === 'ganjil');
            const babStart = isGanjil ? 1 : 6;
            const babEnd = isGanjil ? 5 : 10;
            const namaSemester = isGanjil ? "Ganjil" : "Genap";
            const kodeSmt = isGanjil ? "smt1" : "smt2";
            
            const totalKolom = 5 /* 5 Bab */ + 3 /* UTS, UAS, Akhir */;
            let sumPerKolom = new Array(totalKolom).fill(0);
            let countPerKolom = new Array(totalKolom).fill(0);

            // 2. Membangun Header Tabel (Format 2)
            let theadHTML = `
                <tr>
                    <th rowspan="2" style="vertical-align: middle; width: 3%;">No.</th>
                    <th rowspan="2" style="vertical-align: middle; width: 17%; background-color: #fff9db;">Nama Peserta Didik</th>
            `;
            
            for(let b = babStart; b <= babEnd; b++) {
                theadHTML += `<th style="background-color: #e6f2ff; font-weight: bold; font-size: 8pt; width: 10%;">Nilai Sumatif<br>Per Bab<br>(Bab ${b})</th>`;
            }
            
            theadHTML += `
                    <th style="background-color: #ebf5df; font-weight: bold; font-size: 8pt; width: 10%;">Nilai<br>Tengah<br>Semester</th>
                    <th style="background-color: #fff3cd; font-weight: bold; font-size: 8pt; width: 10%;">Nilai<br>Akhir<br>Semester</th>
                    <th style="background-color: #f3e8ff; font-weight: bold; font-size: 8pt; width: 10%;">Nilai<br>Akhir</th>
                </tr>
                <tr>
            `;
            
            for(let i = 0; i < totalKolom; i++) {
                theadHTML += `<th style="font-size: 7pt; font-weight: normal;">(0-100)</th>`;
            }
            theadHTML += `</tr>`;

            // 3. Membangun Isi Tabel
            let tbodyHTML = "";
            siswaTersaring.forEach((siswa, index) => {
                tbodyHTML += `<tr>`;
                tbodyHTML += `<td style="font-weight: bold;">${index + 1}</td>`;
                tbodyHTML += `<td style="text-align: left; padding-left: 5px;">${siswa.name}</td>`;
                
                const barisSiswa = dataRaw.find(row => String(row[2]) === String(siswa.nisn));
                let totalNilaiBab = 0;
                let jumlahBabTerisi = 0;

                // A. Hitung Rata-rata per Bab dari Data Formatif
                let colIdx = 0;
                for(let b = babStart; b <= babEnd; b++) {
                    let totalTopik = 0;
                    let countTopik = 0;
                    
                    for(let t = 1; t <= 10; t++) {
                        if (barisSiswa) {
                            const letakKolomSheet = 6 + ((b - 1) * 10) + (t - 1);
                            let nilaiStr = barisSiswa[letakKolomSheet] || "";
                            let nilaiAngka = parseFloat(nilaiStr);
                            if (!isNaN(nilaiAngka)) {
                                totalTopik += nilaiAngka;
                                countTopik++;
                            }
                        }
                    }

                    let rataBab = "";
                    if (countTopik > 0) {
                        rataBab = (totalTopik / countTopik).toFixed(0); // Dibulatkan agar rapi
                        sumPerKolom[colIdx] += parseFloat(rataBab);
                        countPerKolom[colIdx]++;
                        
                        totalNilaiBab += parseFloat(rataBab);
                        jumlahBabTerisi++;
                    }
                    
                    tbodyHTML += `<td>${rataBab}</td>`;
                    colIdx++;
                }

                // B. Tarik Nilai UTS & UAS dari Profil Siswa
                let uts = parseFloat(siswa[`nilai_uts_${kodeSmt}_${mapel}`]);
                let uas = parseFloat(siswa[`nilai_uas_${kodeSmt}_${mapel}`]);
                
                let utsStr = isNaN(uts) ? "" : uts;
                let uasStr = isNaN(uas) ? "" : uas;

                if (utsStr !== "") { sumPerKolom[colIdx] += uts; countPerKolom[colIdx]++; }
                tbodyHTML += `<td>${utsStr}</td>`; colIdx++;
                
                if (uasStr !== "") { sumPerKolom[colIdx] += uas; countPerKolom[colIdx]++; }
                tbodyHTML += `<td>${uasStr}</td>`; colIdx++;

                // C. Hitung Nilai Akhir (Rata-rata Keseluruhan Bab + UTS + UAS)
                let nilaiAkhirStr = "";
                let pembagiAkhir = 0;
                let totalAkhir = 0;

                if (jumlahBabTerisi > 0) { 
                    totalAkhir += (totalNilaiBab / jumlahBabTerisi); // Rata-rata dari seluruh Bab
                    pembagiAkhir++; 
                }
                if (utsStr !== "") { totalAkhir += uts; pembagiAkhir++; }
                if (uasStr !== "") { totalAkhir += uas; pembagiAkhir++; }

                if (pembagiAkhir > 0) {
                    let nilaiAkhir = (totalAkhir / pembagiAkhir).toFixed(0);
                    nilaiAkhirStr = nilaiAkhir;
                    sumPerKolom[colIdx] += parseFloat(nilaiAkhir);
                    countPerKolom[colIdx]++;
                }
                tbodyHTML += `<td>${nilaiAkhirStr}</td>`;

                tbodyHTML += `</tr>`;
            });

            // 4. Membangun Footer (Jumlah & Rata-rata)
            const bgColors = ["#e6f2ff", "#e6f2ff", "#e6f2ff", "#e6f2ff", "#e6f2ff", "#ebf5df", "#fff3cd", "#f3e8ff"];
            
            let tfootHTML = `<tr><td colspan="2" style="font-weight: bold; text-align: left; padding-left: 5px;">Jumlah</td>`;
            for(let k = 0; k < totalKolom; k++) {
                tfootHTML += `<td style="background-color: ${bgColors[k]};">${countPerKolom[k] > 0 ? sumPerKolom[k].toFixed(0) : ''}</td>`;
            }
            tfootHTML += `</tr><tr><td colspan="2" style="font-weight: bold; text-align: left; padding-left: 5px;">Rata-rata</td>`;
            for(let k = 0; k < totalKolom; k++) {
                let rata = countPerKolom[k] > 0 ? (sumPerKolom[k] / countPerKolom[k]).toFixed(1) : '';
                tfootHTML += `<td style="background-color: ${bgColors[k]};">${rata}</td>`;
            }
            tfootHTML += `</tr>`;

            // 5. Merakit HTML Dokumen Utama
            const dokumenKertasHTML = `
                <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 10mm; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 16pt; font-weight: bold; color: #1a365d;">NILAI SUMATIF PER BAB DAN NILAI SEMESTER</h2>
                        
                    </div>

                    <table style="width: 100%; border: none; margin-bottom: 10px; font-size: 10pt;">
                        <tr>
                            <td style="width: 12%;">Mata Pelajaran</td>
                            <td style="width: 48%;">: ${mapelLabel}</td>
                            <td style="width: 10%;">Semester</td>
                            <td style="width: 30%;">: ${namaSemester}</td>
                        </tr>
                        <tr>
                            <td>Kelas</td>
                            <td>: Kelas 6</td>
                            <td>Guru</td>
                            <td>: ___________________________</td>
                        </tr>
                    </table>

                    <table class="tabel-nilai" border="1" cellpadding="3" cellspacing="0" style="width: 100%; text-align: center; border-collapse: collapse; font-size: 9pt;">
                        <thead>${theadHTML}</thead>
                        <tbody>${tbodyHTML}</tbody>
                        <tfoot>${tfootHTML}</tfoot>
                    </table>

                    <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
                        <div style="width: 60%; display: flex; justify-content: space-between; text-align: center;">
                            <div style="width: 45%;">
                                <br>Mengetahui,<br>Kepala Sekolah<br><br><br><br><br>
                                ( ___________________________ )<br>NIP. ___________________________
                            </div>
                            <div style="width: 45%;">
                                Tanggal : ___________________<br><br>Guru Mata Pelajaran<br><br><br><br><br>
                                ( ___________________________ )<br>NIP. ___________________________
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 6. Jalankan Proses Cetak
            let printIframe = document.getElementById('printIframeHidden');
            if (!printIframe) {
                printIframe = document.createElement('iframe');
                printIframe.id = 'printIframeHidden';
                printIframe.style.position = 'fixed';
                printIframe.style.width = '0';
                printIframe.style.height = '0';
                printIframe.style.border = 'none';
                document.body.appendChild(printIframe);
            }

            const doc = printIframe.contentDocument || printIframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Cetak Nilai Sumatif</title>
                    <style>
                        @page { size: A4 landscape; margin: 1cm; }
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .tabel-nilai th, .tabel-nilai td { border: 1px solid #000 !important; }
                    </style>
                </head>
                <body>${dokumenKertasHTML}</body>
                </html>
            `);
            doc.close();

            bootstrap.Modal.getInstance(document.getElementById('modalExport')).hide();
            setTimeout(() => {
                printIframe.contentWindow.focus();
                printIframe.contentWindow.print();
            }, 300);

        } else {
            alert("Gagal memuat data dari server: " + result.message);
        }
    } catch(e) {
        console.error(e);
        alert("Terjadi kesalahan jaringan.");
    } finally {
        btn.innerHTML = textAwal;
        btn.disabled = false;
    }
};


// FUNGSI CETAK REKAPITULASI KEHADIRAN BULANAN (VERSI FIX)
// =========================================================================
window.cetakRekapAbsen = async function() {
    const tahunAjar = document.getElementById('exportTahunAjar').value;
    const bulanVal = document.getElementById('exportBulan').value; 

    if (!tahunAjar || !bulanVal) { alert("Silakan pilih Tahun Ajar dan Bulan terlebih dahulu!"); return; }

    const btn = document.getElementById('btnProsesExport');
    const textAwal = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyiapkan Dokumen...`;
    btn.disabled = true;

    try {
        const siswaTersaring = window.globalDataSiswa.filter(s => s.tahun_ajar === tahunAjar);
        if (siswaTersaring.length === 0) { 
            alert("Tidak ada data siswa pada tahun ajar ini."); 
            btn.disabled = false; btn.innerHTML = textAwal; 
            return; 
        }

        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "read_absensi_bulanan", bulan: bulanVal })
        });
        const result = await response.json();

        if (result.status === "success") {
            const dataAbsen = result.data; 
            
            const [yyyy, mm] = bulanVal.split('-');
            const namaBulanCaps = new Date(yyyy, parseInt(mm) - 1, 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase();
            const jumlahHari = new Date(yyyy, mm, 0).getDate();

            let daftarLiburNasional = [];
            try {
                const resLibur = await fetch(`https://api-harilibur.vercel.app/api?month=${parseInt(mm)}&year=${yyyy}`);
                if (resLibur.ok) {
                    const dataLibur = await resLibur.json();
                    if (Array.isArray(dataLibur)) {
                        daftarLiburNasional = dataLibur.filter(item => item.is_national_holiday).map(item => item.holiday_date);
                    }
                }
            } catch (err) { console.warn("Gagal menarik data libur."); }

            const liburTetap = [`${yyyy}-01-01`, `${yyyy}-05-01`, `${yyyy}-06-01`, `${yyyy}-08-17`, `${yyyy}-12-25`];
            liburTetap.forEach(tgl => { if(!daftarLiburNasional.includes(tgl)) daftarLiburNasional.push(tgl); });

            let dailyH = new Array(jumlahHari + 1).fill(0);
            let dailyS = new Array(jumlahHari + 1).fill(0);
            let dailyI = new Array(jumlahHari + 1).fill(0);
            let dailyA = new Array(jumlahHari + 1).fill(0);
            
            const daftarHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

            let theadHTML = `<tr><th rowspan="3" style="width: 3%;">NO</th><th rowspan="3" style="width: 25%;">NAMA SISWA</th><th colspan="${jumlahHari}">KEHADIRAN PERBULAN</th><th colspan="4" style="width: 10%;">TOTAL</th></tr><tr>`;
            
            for(let d = 1; d <= jumlahHari; d++) {
                let indeks = new Date(yyyy, parseInt(mm) - 1, d).getDay();
                let isMerah = (indeks === 0 || daftarLiburNasional.includes(`${yyyy}-${mm}-${String(d).padStart(2, '0')}`));
                let bgH = isMerah ? 'background-color: #ffcccc; color: red;' : '';
                theadHTML += `<th style="font-size: 7pt; padding: 2px 1px; ${bgH}"><div style="writing-mode: vertical-rl; transform: rotate(180deg); margin: 0 auto; height: 35px;">${daftarHari[indeks]}</div></th>`;
            }
            
            theadHTML += `
                <th style="font-size: 8pt; width: 2.5%; vertical-align: middle; background-color: #d1e7dd;">H</th>
                <th style="font-size: 8pt; width: 2.5%; vertical-align: middle; background-color: #fff3cd;">S</th>
                <th style="font-size: 8pt; width: 2.5%; vertical-align: middle; background-color: #e2e3e5;">I</th>
                <th style="font-size: 8pt; width: 2.5%; vertical-align: middle; background-color: #f8d7da;">A</th>
            </tr>
            <tr>
            `;
            
            for(let d = 1; d <= jumlahHari; d++) {
                let isMerah = (new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0 || daftarLiburNasional.includes(`${yyyy}-${mm}-${String(d).padStart(2, '0')}`));
                theadHTML += `<th style="font-size: 8pt; padding: 2px 1px; ${isMerah ? 'background-color: #ffcccc; color: red;' : ''}">${d}</th>`;
            }
            theadHTML += `</tr>`;

            let tbodyHTML = "";
            siswaTersaring.forEach((siswa, index) => {
                let row = `<tr><td>${index + 1}</td><td style="text-align:left;">${siswa.name}</td>`;
                let tH=0, tS=0, tI=0, tA=0;

                for(let d = 1; d <= jumlahHari; d++) {
                    let tglStr = `${yyyy}-${mm}-${String(d).padStart(2, '0')}`;
                    let isMerah = (new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0 || daftarLiburNasional.includes(tglStr));
                    let rec = dataAbsen.find(r => String(r[2]).trim() === String(siswa.nisn).trim() && String(r[1]).trim() === tglStr);
                    
                    let sim = "", st = rec ? String(rec[3]).trim().toLowerCase() : "";
                    let cellBg = isMerah ? 'background-color: #ffcccc;' : '';
                    
                    if(st==='h'||st==='hadir'){ sim="H"; tH++; dailyH[d]++; cellBg = 'background-color: #d1e7dd;'; }
                    else if(st==='s'||st==='sakit'){ sim="S"; tS++; dailyS[d]++; cellBg = 'background-color: #fff3cd;'; }
                    else if(st==='i'||st==='izin'||st==='ijin'){ sim="I"; tI++; dailyI[d]++; cellBg = 'background-color: #e2e3e5;'; }
                    else if(st==='a'||st==='alpa'){ sim="A"; tA++; dailyA[d]++; cellBg = 'background-color: #f8d7da;'; }
                    
                    row += `<td style="font-size: 8pt; ${cellBg}">${sim}</td>`;
                }
                row += `<td style="background-color:#d1e7dd;">${tH||''}</td><td style="background-color:#fff3cd;">${tS||''}</td><td style="background-color:#e2e3e5;">${tI||''}</td><td style="background-color:#f8d7da; color:red;">${tA||''}</td></tr>`;
                tbodyHTML += row;
            });
            // 3. MEMBANGUN FOOTER (KEHADIRAN PERHARI)
            let tfootHTML = `
                <tr>
                    <th rowspan="4" style="vertical-align: middle; font-size: 9pt;">KEHADIRAN<br>PERHARI</th>
                    <th style="text-align: right; font-size: 8pt; padding-right: 5px; background-color: #d1e7dd;">Hadir</th>
            `;
            for(let d=1; d<=jumlahHari; d++) {
                let tglStr = `${yyyy}-${mm}-${String(d).padStart(2, '0')}`;
                let isMinggu = new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0;
                let bgF = (isMinggu || daftarLiburNasional.includes(tglStr)) ? 'background-color: #ffcccc;' : '';
                tfootHTML += `<th style="font-size: 8pt; padding: 2px 1px; ${bgF}">${dailyH[d] > 0 ? dailyH[d] : ''}</th>`;
            }
            tfootHTML += `<th colspan="4" rowspan="4" style="background: #f8f9fa;"></th></tr><tr>`;
            
            tfootHTML += `<th style="text-align: right; font-size: 8pt; padding-right: 5px; background-color: #fff3cd;">Sakit</th>`;
            for(let d=1; d<=jumlahHari; d++) {
                let tglStr = `${yyyy}-${mm}-${String(d).padStart(2, '0')}`;
                let isMinggu = new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0;
                let bgF = (isMinggu || daftarLiburNasional.includes(tglStr)) ? 'background-color: #ffcccc;' : '';
                tfootHTML += `<th style="font-size: 8pt; padding: 2px 1px; ${bgF}">${dailyS[d] > 0 ? dailyS[d] : ''}</th>`;
            }
            tfootHTML += `</tr><tr>`;
            
            tfootHTML += `<th style="text-align: right; font-size: 8pt; padding-right: 5px; background-color: #e2e3e5;">Ijin</th>`;
            for(let d=1; d<=jumlahHari; d++) {
                let tglStr = `${yyyy}-${mm}-${String(d).padStart(2, '0')}`;
                let isMinggu = new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0;
                let bgF = (isMinggu || daftarLiburNasional.includes(tglStr)) ? 'background-color: #ffcccc;' : '';
                tfootHTML += `<th style="font-size: 8pt; padding: 2px 1px; ${bgF}">${dailyI[d] > 0 ? dailyI[d] : ''}</th>`;
            }
            tfootHTML += `</tr><tr>`;
            
            tfootHTML += `<th style="text-align: right; font-size: 8pt; padding-right: 5px; background-color: #f8d7da;">Alpa</th>`;
            for(let d=1; d<=jumlahHari; d++) {
                let tglStr = `${yyyy}-${mm}-${String(d).padStart(2, '0')}`;
                let isMinggu = new Date(yyyy, parseInt(mm) - 1, d).getDay() === 0;
                let bgF = (isMinggu || daftarLiburNasional.includes(tglStr)) ? 'background-color: #ffcccc;' : '';
                tfootHTML += `<th style="font-size: 8pt; padding: 2px 1px; ${bgF}">${dailyA[d] > 0 ? dailyA[d] : ''}</th>`;
            }
            tfootHTML += `</tr>`;


            // 4. MERAKIT KESELURUHAN DOKUMEN HTML
            const dokumenKertasHTML = `
                <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 10mm; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">BULAN ${namaBulanCaps} TAHUN ${yyyy}</h2>
                    </div>
                    
                    <table class="tabel-nilai" border="1" cellpadding="2" cellspacing="0" style="width: 100%; text-align: center; border-collapse: collapse; font-size: 8pt;">
                        <thead>${theadHTML}</thead>
                        <tbody>${tbodyHTML}</tbody>
                        <tfoot>${tfootHTML}</tfoot>
                    </table>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                        <div style="width: 40%; font-size: 9pt;">
                            <strong>Keterangan:</strong><br>
                            <span style="display:inline-block; width:12px; height:12px; background-color:#ffcccc; border:1px solid #000; margin-right:5px; vertical-align:middle;"></span> Hari Minggu / Libur Nasional
                        </div>
                        <div style="width: 30%; text-align: center;">
                            Sidole, ___________________<br><br>Wali Kelas 6<br><br><br><br><br>
                            ( ___________________________ )<br>NIP. ___________________________
                        </div>
                    </div>
                </div>
            `;

            let printIframe = document.getElementById('printIframeHidden');
            if (!printIframe) {
                printIframe = document.createElement('iframe');
                printIframe.id = 'printIframeHidden';
                printIframe.style.position = 'fixed';
                printIframe.style.width = '0';
                printIframe.style.height = '0';
                printIframe.style.border = 'none';
                document.body.appendChild(printIframe);
            }

            const doc = printIframe.contentDocument || printIframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${namaBulanCaps} ${yyyy}</title>
                    <style>
                        @page { size: A4 landscape; margin: 1cm; }
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .tabel-nilai th, .tabel-nilai td { border: 1px solid #000 !important; }
                    </style>
                </head>
                <body>${dokumenKertasHTML}</body>
                </html>
            `);
            doc.close();

            bootstrap.Modal.getInstance(document.getElementById('modalExport')).hide();
            setTimeout(() => { printIframe.contentWindow.focus(); printIframe.contentWindow.print(); }, 300);

        } else {
            alert("Gagal menarik data dari server: " + result.message);
        }
    } catch(e) {
        console.error(e);
        alert("Terjadi kesalahan jaringan.");
    } finally {
        btn.innerHTML = textAwal;
        btn.disabled = false;
    }
};
