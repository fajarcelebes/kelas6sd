// =========================================================================
// PDF GENERATOR - PROSES CETAK BIODATA SISWA (VERSI CEPAT & NATIVE)
// =========================================================================

window.previewBiodataPDF = function(idSiswa) {
    const s = window.globalDataSiswa.find(item => String(item.id) === String(idSiswa));
    if (!s) {
        alert("Data siswa tidak ditemukan!");
        return;
    }

    // Menggunakan URL Thumbnail langsung agar instan tanpa loading backend
    const urlFoto = window.ubahUrlDriveKeGambar(s.foto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=150`;

    // 1. AUTO-INJECT WADAH MODAL PRATINJAU
    let modalEl = document.getElementById('modalPreviewPDF');
    if (!modalEl) {
        const modalHTML = `
        <div class="modal fade" id="modalPreviewPDF" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content shadow-lg" style="border-radius: 12px; background-color: #f8f9fa;">
                    <div class="modal-header bg-primary text-white border-0 py-3">
                        <h5 class="modal-title fw-bold"><i class="fa-solid fa-file-pdf me-2"></i>Pratinjau Biodata Siswa</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex justify-content-center p-4">
                        <div id="kertasPreviewBiodata" class="bg-white shadow-sm" style="width: 210mm; min-height: 297mm; padding: 15mm 20mm; font-family: sans-serif; color: #000; box-sizing: border-box; font-size: 12px; line-height: 1.4;">
                            </div>
                    </div>
                    <div class="modal-footer bg-white border-top py-3">
                        <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
                        <button type="button" class="btn btn-primary rounded-pill px-5 fw-bold" onclick="window.cetakBiodataAsli()">
                            <i class="fa-solid fa-print me-2"></i>Cetak Dokumen
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalEl = document.getElementById('modalPreviewPDF');
    }

    // 2. Tampilkan Pop-Up Segera!
    bootstrap.Modal.getOrCreateInstance(modalEl).show();

    // 3. Susun HTML KOP dan Biodata (Persis seperti format Anda)
    const elemenKertas = document.getElementById('kertasPreviewBiodata');
    elemenKertas.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; border-bottom: 3px solid #000; margin-bottom: 20px;">
            <tr>
                <td style="width: 15%; vertical-align: middle; padding-bottom: 10px; text-align: left;">
                    <img src="assets/logo.png" style="width: 75px; height: auto; display: inline-block;" onerror="this.style.display='none';">
                </td>
                <td style="width: 85%; text-align: center; vertical-align: middle; padding-bottom: 10px; padding-right: 75px;">
                    <h3 style="margin: 0; text-transform: uppercase; font-size: 16px; font-weight: bold;">LEMBAR BIODATA SISWA</h3>
                    <h4 style="margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase;">SEKOLAH DASAR INPRES 1 SIDOLE</h4>
                    <p style="margin: 5px 0 0 0; font-size: 11px; font-style: italic; color: #555;">TAHUN AJARAN ${s.tahun_ajar || '-'}</p>
                </td>
            </tr>
        </table>
        
        <h6 style="font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; color: #2c3e50;">I. Identitas Diri Siswa</h6>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="vertical-align: top; width: 75%;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="width: 35%; padding: 5px 0; font-weight: bold;">Nama Lengkap</td><td style="width: 3%;">:</td><td style="text-transform: uppercase; font-weight: bold;">${s.name || '-'}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">NISN</td><td>:</td><td>${s.nisn || '-'}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">NIS</td><td>:</td><td>${s.nis || '-'}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">Jenis Kelamin</td><td>:</td><td>${s.gender === 'L' || s.gender === 'Laki-Laki' ? 'Laki-Laki' : 'Perempuan'}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">Tempat, Tgl Lahir</td><td>:</td><td>${s.place_birth || '-'}, ${window.formatTanggalIndo(s.date_birth)}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">Agama</td><td>:</td><td>${s.religion || '-'}</td></tr>
                        <tr><td style="padding: 5px 0; font-weight: bold;">Asal Sekolah Sebelumnya</td><td>:</td><td>${s.prev_school || '-'}</td></tr>
                    </table>
                </td>
                <td style="vertical-align: top; width: 25%; text-align: right;">
                    <img src="${urlFoto}" style="width: 110px; height: 140px; object-fit: cover; border: 2px solid #000; padding: 2px; background: #fff;">
                </td>
            </tr>
        </table>

        <h6 style="font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; color: #2c3e50;">II. Data Orang Tua / Wali</h6>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="width: 22%; padding: 5px 0; font-weight: bold;">Nama Ayah</td><td style="width: 3%;">:</td><td style="width: 25%;">${s.father_nm || '-'}</td>
                <td style="width: 22%; font-weight: bold;">Nama Ibu</td><td style="width: 3%;">:</td><td>${s.mother_nm || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0; font-weight: bold;">Pekerjaan Ayah</td><td>:</td><td>${s.father_job || '-'}</td>
                <td style="padding: 5px 0; font-weight: bold;">Pekerjaan Ibu</td><td>:</td><td>${s.mother_job || '-'}</td>
            </tr>
        </table>

        <h6 style="font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; color: #2c3e50;">III. Alamat Wilayah Tempat Tinggal</h6>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <tr><td style="width: 22%; padding: 5px 0; font-weight: bold;">Alamat Jalan/Dusun</td><td style="width: 3%;">:</td><td colspan="4">${s.address || '-'}</td></tr>
            <tr>
                <td style="padding: 5px 0; font-weight: bold;">Desa / Kelurahan</td><td>:</td><td style="width: 25%;">${s.parent_village || '-'}</td>
                <td style="width: 22%; font-weight: bold;">Kecamatan</td><td style="width: 3%;">:</td><td>${s.parent_subdistrict || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0; font-weight: bold;">Kabupaten / Kota</td><td>:</td><td>${s.parent_district || '-'}</td>
                <td style="padding: 5px 0; font-weight: bold;">Provinsi</td><td>:</td><td>${s.parent_prov || '-'}</td>
            </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 60px; font-size: 12px;">
            <tr>
                <td style="width: 60%;"></td>
                <td style="text-align: center; width: 40%;">
                    <p style="margin: 0;">Sidole, ${window.formatTanggalIndo(new Date().toISOString())}</p>
                    <p style="margin: 5px 0 65px 0; font-weight: bold;">Kepala Sekolah / Wali Kelas</p>
                    <p style="margin: 0; text-decoration: underline; font-weight: bold;">...................................................</p>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: #444;">NIP. ...........................................</p>
                </td>
            </tr>
        </table>
    `;
};

// 4. FUNGSI UNTUK MENCETAK KE PDF BAWAAN SISTEM OPERASI
window.cetakBiodataAsli = function() {
    const elemenKertas = document.getElementById('kertasPreviewBiodata');
    if (!elemenKertas) return;

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
            <title>Cetak Biodata Siswa</title>
            <style>
                @page { size: A4 portrait; margin: 0; }
                body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: sans-serif; 
                    color: #000; 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                }
                .kertas {
                    width: 210mm;
                    padding: 15mm 20mm;
                    box-sizing: border-box;
                    font-size: 12px;
                    line-height: 1.4;
                }
            </style>
        </head>
        <body>
            <div class="kertas">${elemenKertas.innerHTML}</div>
        </body>
        </html>
    `);
    doc.close();

    // Beri waktu 0.3 detik agar gambar selesai dimuat sebelum membuka dialog Print
    setTimeout(() => {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
    }, 300);
};