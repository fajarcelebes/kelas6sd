// =========================================================================
// AUTH CONTROLLER - SISTEM KEAMANAN (VERSI SEDERHANA & STABIL)
// =========================================================================

// --- 1. PENGAMANAN HALAMAN ---
window.checkAuth = function() {
    // Menggunakan sessionStorage agar otomatis terhapus saat tab disilang/ditutup
    const statusLogin = sessionStorage.getItem("SIAKAD_SD6_LOGGED_IN");
    const filename = window.location.pathname.split('/').pop().toLowerCase();
    
    const isLoginPage = (filename === "index.html" || filename === "");

    // ATURAN TUNGGAL: Jika ada penyusup di halaman dalam (bukan index) yang belum login, tendang ke index!
    if (!isLoginPage && !statusLogin) {
        window.location.replace("index.html");
    }
    // Catatan: Tidak ada sistem auto-lempar dari index ke dashboard agar bebas dari error loop/berkedip.
};

// Langsung jalankan saat file terbaca
window.checkAuth();

// --- 2. FUNGSI LOGIN (Sesuai dengan HTML Desain Baru) ---
window.aksiLogin = async function(event) {
    if (event) event.preventDefault(); // Mencegah form me-refresh halaman
    
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("btnLogin");
    const infoError = document.getElementById("loginError");
    
    if (!user || !pass) {
        if (infoError) {
            infoError.innerText = "Username dan password tidak boleh kosong.";
            infoError.style.display = "block";
        }
        return;
    }

    // Ubah tombol jadi loading
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Memeriksa...`;
    btn.disabled = true;
    if (infoError) infoError.style.display = "none";

    try {
        const response = await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "login", username: user, password: pass })
        });
        const result = await response.json();

        if (result.status === "success") {
            // Simpan kunci gembok ke memori sementara browser
            sessionStorage.setItem("SIAKAD_SD6_LOGGED_IN", "true");
            // Pindah ke dashboard
            window.location.href = "dashboard.html";
        } else {
            // Tampilkan error di atas form (sesuai desain UI baru)
            if (infoError) {
                infoError.innerText = result.message || "Username atau password salah!";
                infoError.style.display = "block";
            } else {
                alert("Login gagal: " + (result.message || "Username atau password salah!"));
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        if (infoError) {
            infoError.innerText = "Gagal terhubung ke server.";
            infoError.style.display = "block";
        }
        btn.innerHTML = originalText;
        btn.disabled = false;
        console.error("Error Koneksi:", error);
    }
};

// --- 3. FUNGSI LOGOUT ---
window.aksiLogout = function() {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
        // Hancurkan kunci gembok
        sessionStorage.removeItem("SIAKAD_SD6_LOGGED_IN");
        window.location.href = "index.html";
    }
};