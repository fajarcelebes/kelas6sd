// =========================================================================
// UI CONTROLLER - Fungsi Utilitas Umum & Modal Detail Siswa
// =========================================================================

window.ekstrakIdDrive = function(url) {
    if (!url || url === "-") return null;
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
};

window.ubahUrlDriveKeGambar = function(url) {
    const id = window.ekstrakIdDrive(url);
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : null;
};

window.formatTanggalIndo = function(tanggal) {
    if (!tanggal || tanggal === "-") return "-";
    try {
        const d = new Date(tanggal);
        if (isNaN(d.getTime())) return tanggal; 
        const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
    } catch(e) { return tanggal; }
};

window.perbesarFoto = function(url, dl) {
    let m = document.getElementById('modalPreviewFoto');
    if (!m) {
        document.body.insertAdjacentHTML('beforeend', `<div class="modal fade" id="modalPreviewFoto"><div class="modal-dialog modal-dialog-centered"><div class="modal-content bg-transparent border-0"><div class="modal-body text-center position-relative"><button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2" data-bs-dismiss="modal"></button><img id="imgPreviewBesar" src="" class="img-fluid rounded-3 shadow-lg" style="max-height:75vh; border:4px solid white;"><div class="mt-3"><a id="btnDownloadPreview" href="#" target="_blank" class="btn btn-success rounded-pill px-4 shadow">Download Foto</a></div></div></div></div></div>`);
        m = document.getElementById('modalPreviewFoto');
    }
    document.getElementById('imgPreviewBesar').src = url;
    const btn = document.getElementById('btnDownloadPreview');
    if(dl && dl !== 'null') { btn.href = dl; btn.style.display = 'inline-block'; } else { btn.style.display = 'none'; }
    bootstrap.Modal.getOrCreateInstance(m).show();
};

// =========================================================================
// MENGEMBALIKAN FUNGSI LIHAT DETAIL SISWA (DENGAN AUTO-INJECT HTML)
// =========================================================================
window.lihatDetailSiswa = function(idSiswa) {
    const s = window.globalDataSiswa.find(item => String(item.id) === String(idSiswa));
    if (!s) return;

    // 1. Membuat Wadah Modal Otomatis jika terhapus dari HTML
    let modalDetail = document.getElementById('modalDetailSiswa');
    if (!modalDetail) {
        const modalHTML = `
        <div class="modal fade" id="modalDetailSiswa" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content border-0 shadow-lg bg-light">
                    <div class="modal-header bg-primary text-white border-0 py-3">
                        <h5 class="modal-title fw-bold"><i class="fa-solid fa-address-card me-2"></i>Detail Profil Siswa</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4" id="kontenModalDetail">
                        </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalDetail = document.getElementById('modalDetailSiswa');
    }
    
    const urlFoto = window.ubahUrlDriveKeGambar(s.foto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=120`;
    const dlLink = window.ekstrakIdDrive(s.foto) ? `https://drive.google.com/uc?export=download&id=${window.ekstrakIdDrive(s.foto)}` : null;
    
    const btnFoto = s.foto ? `<a href="${s.foto}" target="_blank" class="btn btn-sm btn-outline-secondary mb-1"><i class="fa-solid fa-image me-1"></i> Foto</a>` : '';
    const btnKK = s.foto_kk ? `<a href="${s.foto_kk}" target="_blank" class="btn btn-sm btn-outline-warning text-dark mb-1"><i class="fa-solid fa-file-invoice me-1"></i> KK</a>` : '';
    const btnAkta = s.foto_akta ? `<a href="${s.foto_akta}" target="_blank" class="btn btn-sm btn-outline-danger mb-1"><i class="fa-solid fa-file-shield me-1"></i> Akta</a>` : '';
    const btnRaport1 = s.raport_smt1 ? `<a href="${s.raport_smt1}" target="_blank" class="btn btn-sm btn-outline-primary mb-1"><i class="fa-solid fa-file-signature me-1"></i> Raport 1</a>` : '';
    const btnRaport2 = s.raport_smt2 ? `<a href="${s.raport_smt2}" target="_blank" class="btn btn-sm btn-outline-primary mb-1"><i class="fa-solid fa-file-signature me-1"></i> Raport 2</a>` : '';
    const btnSertTKA = s.tka ? `<a href="${s.tka}" target="_blank" class="btn btn-sm btn-outline-success mb-1"><i class="fa-solid fa-award me-1"></i> TKA</a>` : '';
    const btnNilaiTKA = s['nilai TKA'] ? `<a href="${s['nilai TKA']}" target="_blank" class="btn btn-sm btn-outline-success mb-1"><i class="fa-solid fa-file-medical me-1"></i> Nilai TKA</a>` : '';
    const btnIjazah = s.ijazah ? `<a href="${s.ijazah}" target="_blank" class="btn btn-sm btn-outline-dark mb-1"><i class="fa-solid fa-graduation-cap me-1"></i> Ijazah</a>` : '';
    const btnTranskip = s.transkip_ijz ? `<a href="${s.transkip_ijz}" target="_blank" class="btn btn-sm btn-outline-dark mb-1"><i class="fa-solid fa-list-check me-1"></i> Transkrip</a>` : '';

    const listTombolDokumen = [btnFoto, btnKK, btnAkta, btnRaport1, btnRaport2, btnSertTKA, btnNilaiTKA, btnIjazah, btnTranskip].filter(b => b !== '').join(' ');

    const mapelData = [
        { n: 'MTK', k: 'mtk' }, { n: 'B. Indo', k: 'bin' }, { n: 'IPAS', k: 'ipas' },
        { n: 'PKN', k: 'pkn' }, { n: 'SBDP', k: 'sbdp' }, { n: 'PJOK', k: 'pjok' },
        { n: 'B. Ing', k: 'bing' }, { n: 'Agama', k: 'agm' }, { n: 'Mulok', k: 'mulok' }
    ];

    const tabelNilaiHTML = mapelData.map(m => `
        <tr>
            <td class="text-start fw-semibold py-1">${m.n}</td>
            <td class="py-1">${s[`nilai_uts_smt1_${m.k}`] || '-'}</td>
            <td class="py-1">${s[`nilai_uts_smt2_${m.k}`] || '-'}</td>
            <td class="py-1">${s[`nilai_uas_smt1_${m.k}`] || '-'}</td>
            <td class="py-1">${s[`nilai_uas_smt2_${m.k}`] || '-'}</td>
            <td class="fw-bold text-success py-1 bg-success bg-opacity-10">${s[`nilai_ijz_${m.k}`] || '-'}</td>
        </tr>
    `).join('');

    document.getElementById('kontenModalDetail').innerHTML = `
        <div class="d-flex justify-content-end mb-2">
            <button class="btn btn-danger btn-sm rounded-pill fw-bold" onclick="window.previewBiodataPDF('${s.id}')"><i class="fa-solid fa-file-pdf me-2"></i>Cetak Biodata</button>
        </div>
        <div class="text-center mb-4">
            <img src="${urlFoto}" class="rounded-circle shadow-sm" width="110" height="110" style="object-fit:cover; border:3px solid #fff; cursor:pointer;" onclick="window.perbesarFoto('${urlFoto}', '${dlLink}')">
            <h4 class="fw-bold mt-2 mb-0">${s.name || '-'}</h4>
            <span class="badge bg-secondary mt-1">NIS: ${s.nis || '-'}</span>
        </div>
        <div class="row g-3">
            <div class="col-md-6"><div class="bg-white p-3 rounded-3 border h-100"><h6 class="text-primary fw-bold border-bottom pb-2">Data Pribadi</h6><p class="small mb-0">NISN: ${s.nisn || '-'}<br>Gender: ${s.gender === 'L' || s.gender === 'Laki-Laki' ? 'Laki-laki' : 'Perempuan'}<br>TTL: ${s.place_birth || '-'}, ${window.formatTanggalIndo(s.date_birth)}<br>Agama: ${s.religion || '-'}<br>Asal Sekolah: ${s.prev_school || '-'}</p></div></div>
            <div class="col-md-6"><div class="bg-white p-3 rounded-3 border h-100"><h6 class="text-primary fw-bold border-bottom pb-2">Orang Tua</h6><p class="small mb-0">Ayah: ${s.father_nm || '-'} (${s.father_job || '-'})<br>Ibu: ${s.mother_nm || '-'} (${s.mother_job || '-'})</p></div></div>
            <div class="col-12"><div class="bg-white p-3 rounded-3 border"><h6 class="text-primary fw-bold border-bottom pb-2">Alamat Lengkap</h6><p class="small mb-0">${s.address || '-'}, Kel. ${s.parent_village || '-'}, Kec. ${s.parent_subdistrict || '-'}, ${s.parent_district || '-'}, ${s.parent_prov || '-'}</p></div></div>
            
            <div class="col-12">
                <div class="bg-white p-3 rounded-3 border">
                    <h6 class="text-primary fw-bold border-bottom pb-2"><i class="fa-solid fa-chart-line me-2"></i>Capaian Akademik & Kehadiran</h6>
                    
                    <div class="table-responsive mt-3 mb-2">
                        <table class="table table-bordered table-sm table-hover align-middle text-center mb-0" style="font-size: 0.85rem;">
                            <thead class="table-light">
                                <tr>
                                    <th rowspan="2" class="align-middle text-start py-1">Pelajaran</th>
                                    <th colspan="2" class="py-1">Nilai UTS</th>
                                    <th colspan="2" class="py-1">Nilai UAS</th>
                                    <th rowspan="2" class="align-middle text-success py-1">Ijazah</th>
                                </tr>
                                <tr><th class="py-1">Smt 1</th><th class="py-1">Smt 2</th><th class="py-1">Smt 1</th><th class="py-1">Smt 2</th></tr>
                            </thead>
                            <tbody>${tabelNilaiHTML}</tbody>
                        </table>
                    </div>

                    <div class="border-top pt-3 mt-3 text-center">
                        <h6 class="small fw-bold text-secondary mb-3">Statistik Kehadiran Siswa</h6>
                        <div style="position: relative; height: 200px; width: 100%; display: flex; justify-content: center;">
                            <canvas id="donutChartKehadiran"></canvas>
                        </div>
                    </div>

                </div>
            </div>

            <div class="col-12">
                <div class="bg-white p-3 rounded-3 border">
                    <h6 class="text-primary fw-bold border-bottom pb-2"><i class="fa-solid fa-folder-open me-2"></i>Dokumen Berkas Digital</h6>
                    <div class="d-flex gap-2 flex-wrap mt-2">
                        ${listTombolDokumen || '<span class="text-muted small">Belum ada dokumen yang diunggah.</span>'}
                    </div>
                </div>
            </div>

            <div class="col-12">
                <div class="bg-white p-3 rounded-3 border">
                    <h6 class="text-primary fw-bold border-bottom pb-2"><i class="fa-solid fa-camera-retro me-2"></i>Rekam Jejak Perilaku & Dokumentasi</h6>
                    <div id="wadahPerilakuSiswa" class="d-flex flex-column gap-2 mt-3">
                        <div class="text-center text-muted small py-3">
                            <span class="spinner-border spinner-border-sm me-2"></span>Menarik data perilaku...
                        </div>
                    </div>
                </div>
            </div>

        </div>`;
        
    bootstrap.Modal.getOrCreateInstance(modalDetail).show();

    window.muatCatatanPerilaku(s.nisn);

    const ctxDonut = document.getElementById('donutChartKehadiran');
    if (window.donutChartKehadiranInstance) window.donutChartKehadiranInstance.destroy(); 
    
    const jmlHadir = parseInt(s.hadir) || 0;
    const jmlIzin = parseInt(s.izin) || 0;
    const jmlSakit = parseInt(s.sakit) || 0;
    const jmlAlpa = parseInt(s.alpa) || 0;

    window.donutChartKehadiranInstance = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: ['Hadir', 'Izin', 'Sakit', 'Alpa'],
            datasets: [{
                data: [jmlHadir, jmlIzin, jmlSakit, jmlAlpa],
                backgroundColor: ['#198754', '#ffc107', '#0dcaf0', '#dc3545'],
                borderWidth: 2,
                hoverOffset: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 12 } } }
            }
        }
    });
};

// =========================================================================
// PENARIK DATA PERILAKU
// =========================================================================
window.muatCatatanPerilaku = async function(nisnSiswa) {
    const wadah = document.getElementById("wadahPerilakuSiswa");
    if (!wadah) return;

    wadah.innerHTML = `
        <div class="text-center text-muted small py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>Menarik data perilaku...
        </div>
    `;

    try {
        const response = await fetch(window.EVAL_API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "read_perilaku",
                nisn: nisnSiswa
            })
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
            if (!result.data || result.data.length === 0) {
                wadah.innerHTML = `<div class="alert alert-light border border-secondary-subtle text-center small text-muted mb-0">Belum ada catatan perilaku atau dokumentasi untuk siswa ini.</div>`;
                return;
            }

            const dataTerbalik = result.data.reverse();

            let htmlCatatan = `
            <div class="table-responsive">
                <table class="table table-bordered table-sm table-hover align-middle mb-0" style="font-size: 0.85rem;">
                    <thead class="table-light text-center">
                        <tr>
                            <th width="5%" class="py-2 text-secondary">NO</th>
                            <th width="22%" class="py-2 text-secondary">TANGGAL</th>
                            <th class="py-2 text-secondary text-start ps-3">CATATAN PERILAKU</th>
                            <th width="15%" class="py-2 text-secondary">FOTO</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            dataTerbalik.forEach((item, index) => {
                const rawTgl = item.date || item.tanggal || '-';
                const tglFormat = window.formatTanggalIndo(rawTgl);
                
                const catatan = item.catatan || item.catatan_perilaku || '-';
                
                const tombolFoto = (item.foto && String(item.foto).trim() !== "") 
                    ? `<a href="${item.foto}" target="_blank" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 0.75rem;"><i class="fa-solid fa-image me-1"></i>Lihat</a>` 
                    : `<span class="text-muted small">-</span>`;

                htmlCatatan += `
                        <tr>
                            <td class="text-center fw-bold text-secondary">${index + 1}</td>
                            <td class="text-center"><span class="badge bg-primary px-3 py-2 shadow-sm border border-primary"><i class="fa-regular fa-calendar me-1"></i>${tglFormat}</span></td>
                            <td class="text-start ps-3" style="text-align: justify;">${catatan}</td>
                            <td class="text-center">${tombolFoto}</td>
                        </tr>
                `;
            });

            htmlCatatan += `
                    </tbody>
                </table>
            </div>`;
            
            wadah.innerHTML = htmlCatatan;
        } else {
            wadah.innerHTML = `<div class="text-danger small py-2 text-center">Gagal memuat data: ${result.message}</div>`;
        }
    } catch (error) {
        wadah.innerHTML = `<div class="text-danger small py-2 text-center">Terjadi kesalahan jaringan saat memuat catatan.</div>`;
        console.error(error);
    }
};