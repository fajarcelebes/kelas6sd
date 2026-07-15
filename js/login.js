document.addEventListener("DOMContentLoaded", function() {
    // Cek jika sudah login, langsung lempar ke dashboard
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "dashboard.html";
    }

    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        formLogin.addEventListener("submit", async function(e) {
            e.preventDefault(); // Mencegah halaman refresh
            
            const user = document.getElementById("username").value;
            const pass = document.getElementById("password").value;
            const btnLogin = document.getElementById("btnLogin");
            
            // Ubah tombol jadi loading
            const originalText = btnLogin.innerHTML;
            btnLogin.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Memeriksa...`;
            btnLogin.disabled = true;

            try {
                // Tembak data ke Google Apps Script
                const response = await fetch(window.API_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        action: "login",
                        username: user,
                        password: pass
                    })
                });
                
                const result = await response.json();
                
                if (result.status === "success") {
                    // Set kunci akses dan pindah halaman
                    localStorage.setItem("isLoggedIn", "true");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Gagal: " + result.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Koneksi ke server gagal. Pastikan API_URL di config.js sudah benar.");
            } finally {
                // Kembalikan tombol seperti semula
                btnLogin.innerHTML = originalText;
                btnLogin.disabled = false;
            }
        });
    }
});