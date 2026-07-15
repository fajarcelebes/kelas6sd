// =========================================================================
// API CONTROLLER - MENGAMBIL DAN MENGIRIM DATA KE GOOGLE APPS SCRIPT
// =========================================================================

window.globalDataSiswa = [];

// --- 1. MENGAMBIL DATA DARI SERVER ---
window.muatDataSiswa = async function() {
    const tbodyD = document.getElementById('tbodyDashboard');
    const tbodyS = document.getElementById('tbodyStudents');
    
    try {
        const loadingHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i>Membaca data dari server...</td></tr>`;
        if (tbodyD) tbodyD.innerHTML = loadingHTML;
        if (tbodyS) tbodyS.innerHTML = loadingHTML;

        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "read" })
        });
        const result = await response.json();

        if (result.status === "success") {
            window.globalDataSiswa = result.data;
            
            if (document.getElementById('filterTahunAjar') && typeof window.isiDropdownTahunAjarDashboard === 'function') {
                window.isiDropdownTahunAjarDashboard(window.globalDataSiswa);
                
                // ---> PEMICU GRAFIK DITAMBAHKAN DI SINI <---
                if (typeof window.renderStatistikDashboard === 'function') {
                    window.renderStatistikDashboard();
                }

            } else if (document.getElementById('filterTahunAjarStudent') && typeof window.isiDropdownTahunAjarStudent === 'function') {
                window.isiDropdownTahunAjarStudent(window.globalDataSiswa);
            } else if (tbodyD && typeof window.renderTabelDashboard === 'function') {
                window.renderTabelDashboard(window.globalDataSiswa);
            } else if (tbodyS && typeof window.renderTabelStudents === 'function') {
                window.renderTabelStudents(window.globalDataSiswa);
            }
        } else {
            const errorServerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-bold"><i class="fa-solid fa-triangle-exclamation me-2"></i>Error Server: ${result.message}</td></tr>`;
            if (tbodyD) tbodyD.innerHTML = errorServerHTML;
            if (tbodyS) tbodyS.innerHTML = errorServerHTML;
        }
    } catch (error) {
        const errorJSHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-bold"><i class="fa-solid fa-bug me-2"></i>Error Sistem: ${error.message}</td></tr>`;
        if (tbodyD) tbodyD.innerHTML = errorJSHTML;
        if (tbodyS) tbodyS.innerHTML = errorJSHTML;
        console.error("Detail Error:", error);
    }
};

// --- 2. MENGHAPUS DATA SISWA ---
window.eksekusiHapusSiswa = async function(idSiswa, namaSiswa) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa bernama ${namaSiswa}?`)) return;
    
    try {
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", id: idSiswa })
        });
        const result = await response.json();
        
        if (result.status === "success") {
            alert("Data berhasil dihapus!");
            window.muatDataSiswa(); 
        } else {
            alert("Gagal menghapus: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan koneksi saat menghapus.");
    }
};

// --- 3. KONVERSI FILE KE TEKS BASE64 ---
window.konversiFileToBase64 = function(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            base64: reader.result,
            name: file.name,
            type: file.type
        });
        reader.onerror = error => reject(error);
    });
};

// --- 4. KIRIM DATA KE SERVER ---
window.kirimDataKeServer = async function(actionType, payloadData) {
    try {
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: actionType, data: payloadData })
        });
        return await response.json();
    } catch (error) {
        return { status: "error", message: error.toString() };
    }
};

// --- 5. PEMICU OTOMATIS SAAT HALAMAN DIMUAT ---
document.addEventListener("DOMContentLoaded", function() {
    // A. Muat tabel otomatis
    if (document.getElementById('tbodyDashboard') || document.getElementById('tbodyStudents')) {
        window.muatDataSiswa();
    }

    // B. TANGKAP TOMBOL "SIMPAN" PADA FORM DATA SISWA
    const formSiswa = document.getElementById("formSiswa");
    if (formSiswa) {
        formSiswa.addEventListener("submit", async function(e) {
            e.preventDefault(); 
            
            const btnSubmit = formSiswa.querySelector('button[type="submit"]');
            const originalBtnText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;
            btnSubmit.disabled = true;

            try {
                const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
                const studentId = getVal('student_id');
                const actionType = studentId ? "update" : "create";

                let payloadData = {
                    id: studentId, nis: getVal('nis'), nisn: getVal('nisn'), name: getVal('name'),
                    gender: getVal('gender'), place_birth: getVal('place_birth'), date_birth: getVal('date_birth'),
                    religion: getVal('religion'), prev_school: getVal('prev_school'), tahun_ajar: getVal('tahun_ajar'),
                    father_nm: getVal('father_nm'), father_job: getVal('father_job'),
                    mother_nm: getVal('mother_nm'), mother_job: getVal('mother_job'),
                    address: getVal('address'), parent_address_street: getVal('parent_address_street'),
                    parent_village: getVal('parent_village'), parent_subdistrict: getVal('parent_subdistrict'),
                    parent_district: getVal('parent_district'), parent_prov: getVal('parent_prov')
                };

                const mapels = ['mtk', 'bin', 'ipas', 'pkn', 'sbdp', 'pjok', 'bing', 'agm', 'mulok'];
                mapels.forEach(mp => {
                    payloadData[`nilai_uts_smt1_${mp}`] = getVal(`nilai_uts_smt1_${mp}`);
                    payloadData[`nilai_uts_smt2_${mp}`] = getVal(`nilai_uts_smt2_${mp}`);
                    payloadData[`nilai_uas_smt1_${mp}`] = getVal(`nilai_uas_smt1_${mp}`);
                    payloadData[`nilai_uas_smt2_${mp}`] = getVal(`nilai_uas_smt2_${mp}`);
                    payloadData[`nilai_ijz_${mp}`] = getVal(`nilai_ijz_${mp}`);
                });

                const dokumenTersedia = ['foto', 'foto_kk', 'foto_akta', 'tka', 'raport_smt1', 'raport_smt2', 'nilai_tka', 'ijazah', 'transkip_ijz'];
                for (let key of dokumenTersedia) {
                    const fileInput = document.getElementById(key);
                    if (fileInput && fileInput.files.length > 0) {
                        let backendKey = (key === 'nilai_tka') ? 'nilai TKA' : key;
                        payloadData["file_" + backendKey] = await window.konversiFileToBase64(fileInput.files[0]);
                    }
                }

                const result = await window.kirimDataKeServer(actionType, payloadData);
                
                if (result.status === "success") {
                    alert("✅ Data Siswa berhasil disimpan!");
                    if (typeof window.tutupFormSiswa === "function") window.tutupFormSiswa();
                    window.muatDataSiswa(); 
                } else {
                    alert("❌ Gagal menyimpan: " + result.message);
                }
            } catch (error) {
                console.error("Kesalahan sistem:", error);
                alert("Terjadi kesalahan saat memproses data.");
            } finally {
                btnSubmit.innerHTML = originalBtnText;
                btnSubmit.disabled = false;
            }
        });
    }
});