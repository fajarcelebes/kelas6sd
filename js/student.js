// =========================================================================
// STUDENT CONTROLLER - Khusus untuk halaman Data Siswa
// =========================================================================

window.isiDropdownTahunAjarStudent = function(data) {
    const dropdown = document.getElementById('filterTahunAjarStudent');
    if (!dropdown) return;
    
    const tahunUnik = [...new Set(data.map(i => i.tahun_ajar).filter(t => t))].sort().reverse();
    
    dropdown.innerHTML = '<option value="">Semua Tahun Ajar</option>';
    tahunUnik.forEach(t => dropdown.innerHTML += `<option value="${t}">${t}</option>`);
    
    if (tahunUnik.length > 0) {
        dropdown.value = tahunUnik[0];
    }
    window.cariSiswaLokal();
};

window.cariSiswaLokal = function() {
    const searchInput = document.getElementById('searchStudent');
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const dropdown = document.getElementById('filterTahunAjarStudent');
    const tahunAjar = dropdown ? dropdown.value : '';
    
    const tersaring = window.globalDataSiswa.filter(s => {
        const namaCocok = String(s.name || '').toLowerCase().includes(keyword);
        const nisnCocok = String(s.nisn || '').toLowerCase().includes(keyword);
        const tahunCocok = (tahunAjar === "" || s.tahun_ajar === tahunAjar);
        
        return (namaCocok || nisnCocok) && tahunCocok;
    });
    
    window.renderTabelStudents(tersaring);
};

window.renderTabelStudents = function(dataArray) {
    const tbody = document.getElementById('tbodyStudents');
    if (!tbody) return;
    tbody.innerHTML = "";
    if (dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Data kosong.</td></tr>`;
        return;
    }
    dataArray.forEach(s => {
        const nama = s.name || '-';
        const bg = s.gender === 'L' ? 'bg-primary' : 'bg-danger';
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold align-middle">${s.nisn || '-'}</td>
                <td class="align-middle"><span class="fw-semibold">${nama}</span></td>
                <td class="text-center align-middle"><span class="badge ${bg} bg-opacity-10 text-dark border">${s.gender || '-'}</span></td>
                <td class="text-center align-middle">${s.tahun_ajar || '-'}</td>
                <td class="text-center align-middle text-dark fw-semibold">${s.parent_village || '-'}</td>
                <td class="text-end align-middle">
                    <button class="btn btn-sm btn-outline-secondary rounded-3" onclick="window.bukaFormEdit('${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 ms-1" onclick="window.eksekusiHapusSiswa('${s.id}', '${nama}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>`;
    });
};

window.bukaFormTambah = function() {
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Tambah Data Siswa';
    document.getElementById('formSiswa').reset();
    document.getElementById('student_id').value = ""; 
    
    const fileKeys = ['foto', 'foto_kk', 'foto_akta', 'tka', 'raport_smt1', 'raport_smt2', 'nilai_tka', 'ijazah', 'transkip_ijz'];
    fileKeys.forEach(k => {
        const el = document.getElementById(`info_${k}`);
        if(el) el.innerHTML = '';
    });

    document.getElementById('formSection').style.display = 'block';
    document.getElementById('tableSection').style.display = 'none';
};

window.tutupFormSiswa = function() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('tableSection').style.display = 'block';
};

window.bukaFormEdit = function(idSiswa) {
    try {
        const s = window.globalDataSiswa.find(item => String(item.id) === String(idSiswa));
        if (!s) return;

        document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-user-pen me-2"></i>Ubah Data Siswa';
        document.getElementById('formSiswa').reset();
        
        const setVal = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        };

        setVal('student_id', s.id);
        setVal('nis', s.nis);
        setVal('nisn', s.nisn);
        setVal('name', s.name);
        setVal('gender', s.gender);
        setVal('place_birth', s.place_birth);
        setVal('religion', s.religion);
        setVal('prev_school', s.prev_school);
        setVal('tahun_ajar', s.tahun_ajar);

        if(s.date_birth) {
            const d = new Date(s.date_birth);
            if (!isNaN(d.getTime())) setVal('date_birth', d.toISOString().split('T')[0]);
        }
        
        const mapels = ['mtk', 'bin', 'ipas', 'pkn', 'sbdp', 'pjok', 'bing', 'agm', 'mulok'];
        mapels.forEach(mp => {
            setVal(`nilai_uts_smt1_${mp}`, s[`nilai_uts_smt1_${mp}`]);
            setVal(`nilai_uts_smt2_${mp}`, s[`nilai_uts_smt2_${mp}`]);
            setVal(`nilai_uas_smt1_${mp}`, s[`nilai_uas_smt1_${mp}`]);
            setVal(`nilai_uas_smt2_${mp}`, s[`nilai_uas_smt2_${mp}`]);
            setVal(`nilai_ijz_${mp}`, s[`nilai_ijz_${mp}`]);
        });

        setVal('father_nm', s.father_nm);
        setVal('father_job', s.father_job);
        setVal('mother_nm', s.mother_nm);
        setVal('mother_job', s.mother_job);
        setVal('address', s.address);
        setVal('parent_address_street', s.parent_address_street);
        setVal('parent_village', s.parent_village);
        setVal('parent_subdistrict', s.parent_subdistrict);
        setVal('parent_district', s.parent_district);
        setVal('parent_prov', s.parent_prov);

        const docMap = [
            { id: 'foto', key: 'foto' },
            { id: 'foto_kk', key: 'foto_kk' },
            { id: 'foto_akta', key: 'foto_akta' },
            { id: 'tka', key: 'tka' },
            { id: 'raport_smt1', key: 'raport_smt1' },
            { id: 'raport_smt2', key: 'raport_smt2' },
            { id: 'nilai_tka', key: 'nilai TKA' },
            { id: 'ijazah', key: 'ijazah' },
            { id: 'transkip_ijz', key: 'transkip_ijz' }
        ];

        docMap.forEach(doc => {
            const el = document.getElementById(`info_${doc.id}`);
            if(el) {
                const link = s[doc.key];
                if(link && link.trim() !== "") {
                    el.innerHTML = `<a href="${link}" target="_blank" class="text-success text-decoration-none fw-semibold"><i class="fa-solid fa-check-circle me-1"></i>Sudah ada</a>`;
                } else {
                    el.innerHTML = `<span class="text-danger opacity-75"><i class="fa-solid fa-circle-xmark me-1"></i>Belum ada</span>`;
                }
            }
        });

        document.getElementById('formSection').style.display = 'block';
        document.getElementById('tableSection').style.display = 'none';
        
    } catch (e) {
        console.error("Terjadi kesalahan saat membuka form edit:", e);
        alert("Terjadi kesalahan saat memuat form. Silakan refresh halaman.");
    }
};