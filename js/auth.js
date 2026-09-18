// Mi conexión al backend de Supabase
const supabaseUrl = 'https://zmxmcojxfxkwxtakkwkq.supabase.co';
const supabaseKey = 'sb_publishable_hekpGJ37q3DLhWvo5ZLyQg_wqfGXw_5';

console.log("Archivo auth.js cargado correctamente.");

// Verificar si el HTML importó correctamente la librería de Supabase
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
        e.preventDefault(); // Evita que la página parpadee y se recargue
        console.log("Formulario de registro enviado.");

        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        console.log(`Datos listos para enviar. Nombre: ${nombre}, Email: ${email}`);

        // Validaciones locales
        if (!nombre || !email || !password) {
            alert('Por favor, completa todos los campos obligatorios (*).');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres por seguridad.');
            return;
        }

        // Validar que contenga al menos una mayúscula
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

// --- LÓGICA DE MENÚ DINÁMICO Y DESPLEGABLE DE USUARIO ---
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        if (typeof supabaseClient !== 'undefined') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            const guestLinks = document.getElementById('guest-links');
            const userDropdown = document.getElementById('user-dropdown');

            if (session && guestLinks && userDropdown) {
                console.log("Sesión activa detectada para:", session.user.email);
                
                guestLinks.style.display = 'none';
                userDropdown.style.display = 'block';

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

                // Comprobar rol de administrador / propietario
                if (perfil && (perfil.rol === 'administrador' || perfil.rol === 'propietario')) {
                    const adminLink = document.getElementById('link-admin-dropdown');
                    if (adminLink) adminLink.style.display = 'block';
                    console.log("Acceso concedido al Panel Admin en el menú.");
                }
            } else if (guestLinks && userDropdown) {
                console.log("No hay sesión activa. Mostrando botones de invitado.");
                guestLinks.style.display = 'flex';
                userDropdown.style.display = 'none';
            }
        }
    }, 400);
});

// Funciones globales para el menú desplegable de la esquina
function toggleMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById("dropdownMenu");
    if (menu) menu.classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.closest('#user-dropdown')) {
        var dropdowns = document.getElementsByClassName("dropdown-content-custom");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
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