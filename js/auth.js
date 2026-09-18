const supabaseUrl = 'https://zmxmcojxfxkwxtakkwkq.supabase.co';
const supabaseKey = 'sb_publishable_hekpGJ37q3DLhWvo5ZLyQg_wqfGXw_5';

console.log("Archivo auth.js cargado correctamente.");

if (typeof window.supabase === 'undefined') {
    alert("CRÍTICO: La librería de Supabase no se cargó. Revisa que pusiste el <script> de Supabase en tu HTML antes de auth.js");
    console.error("Fallo: window.supabase no existe.");
} else {
    console.log("Librería de Supabase detectada correctamente.");
}

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- LÓGICA DE REGISTRO ---
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    console.log("Formulario de registro detectado en esta página.");
    
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        console.log("Formulario de registro enviado.");

        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        console.log(`Datos listos para enviar. Nombre: ${nombre}, Email: ${email}`);

        if (!nombre || !email || !password) {
            alert('Por favor, completa todos los campos obligatorios (*).');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres por seguridad.');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            alert('La contraseña debe contener al menos una letra mayúscula.');
            return;
        }

        console.log("Conectando con los servidores de Supabase...");
        
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: nombre }
                }
            });

            console.log("Respuesta recibida del servidor:", {data, error});

            if (error) {
                alert('Error al registrar: ' + error.message);
                console.error("Error de Supabase:", error);
            } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
                console.warn("El email ya está registrado (identities vacío). No se creó un usuario nuevo.");
                alert('Ese correo ya está registrado. Si es tuyo, intenta iniciar sesión o revisa tu bandeja de confirmación.');
            } else {
                console.log("Usuario nuevo creado correctamente:", data.user);
                alert('Registro exitoso. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.\n\nSerás redirigido para iniciar sesión.');
                registroForm.reset();
                window.location.href = 'login.html'; 
            }
        } catch (err) {
            alert('Error de red o código: ' + err.message);
            console.error("Fallo crítico en JS:", err);
        }
    });
}

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    console.log("Formulario de login detectado en esta página.");
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Formulario de login enviado.");

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Ingresa tu correo y contraseña.');
            return;
        }

        console.log("Validando credenciales en Supabase para: " + email);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                alert('Credenciales incorrectas. Verifica tu correo o contraseña.');
                console.error("Error de Login:", error);
            } else {
                alert('Inicio de sesión exitoso. Bienvenido.');
                window.location.href = 'index.html'; 
            }
        } catch (err) {
            alert('Error de red o código: ' + err.message);
            console.error("Fallo crítico en JS (Login):", err);
        }
    });
}

// --- LÓGICA DE MENÚ DINÁMICO, DESPLEGABLE DE USUARIO Y ROL ADMIN ---
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        if (typeof supabaseClient !== 'undefined') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            const guestLinks = document.getElementById('guest-links');
            const userDropdown = document.getElementById('user-dropdown');
            const gestionDropdown = document.getElementById('gestion-dropdown');

            if (session) {
                console.log("Sesión activa detectada para:", session.user.email);
                
                if (guestLinks) guestLinks.style.display = 'none';
                if (userDropdown) userDropdown.style.display = 'block';

                const userId = session.user.id;
                const emailUser = session.user.email.split('@')[0];

                const { data: perfil } = await supabaseClient
                    .from('amigos')
                    .select('nombre_real, foto_url, rol')
                    .eq('auth_id', userId)
                    .single();

                const nombre = perfil?.nombre_real || emailUser;
                const foto = perfil?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=111111&color=ffffff&size=100`;

                const nameEl = document.getElementById('navUserName');
                const avatarEl = document.getElementById('navUserAvatar');
                if (nameEl) nameEl.textContent = nombre;
                if (avatarEl) avatarEl.src = foto;

                if (perfil && (perfil.rol === 'administrador' || perfil.rol === 'propietario')) {
                    if (gestionDropdown) gestionDropdown.style.display = 'inline-block';
                    console.log("Acceso de Administrador concedido: Menú GESTION visible.");
                }
            } else {
                console.log("No hay sesión activa. Mostrando botones de invitado.");
                if (guestLinks) guestLinks.style.display = 'flex';
                if (userDropdown) userDropdown.style.display = 'none';
                if (gestionDropdown) gestionDropdown.style.display = 'none';
            }
        }
    }, 400);
});

function toggleGestionMenu(e) {
    e.stopPropagation();
    const gestionMenu = document.getElementById("gestionDropdownContent");
    const userMenu = document.getElementById("dropdownMenu");
    if (gestionMenu) gestionMenu.classList.toggle("show-gestion");
    if (userMenu) userMenu.classList.remove("show");
}

function toggleUserMenu(e) {
    e.stopPropagation();
    const userMenu = document.getElementById("dropdownMenu");
    const gestionMenu = document.getElementById("gestionDropdownContent");
    if (userMenu) userMenu.classList.toggle("show");
    if (gestionMenu) gestionMenu.classList.remove("show-gestion");
}

window.onclick = function(event) {
    if (!event.target.closest('#gestion-dropdown') && !event.target.closest('#user-dropdown')) {
        const gestionMenu = document.getElementById("gestionDropdownContent");
        const userMenu = document.getElementById("dropdownMenu");
        if (gestionMenu) gestionMenu.classList.remove("show-gestion");
        if (userMenu) userMenu.classList.remove("show");
    }
}

async function cerrarSesion(e) {
    e.preventDefault();
    if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.auth.signOut();
        alert('Has cerrado sesión correctamente.');
        window.location.href = 'index.html';
    }
}