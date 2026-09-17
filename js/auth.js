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

// --- LÓGICA DE MENÚ DINÁMICO Y SESIÓN ---
async function actualizarMenu() {
    const linkLogin = document.getElementById('link-login');
    if (!linkLogin) {
        setTimeout(actualizarMenu, 50); 
        return;
    }

    const linkRegistro = document.getElementById('link-registro');
    const linkPerfil = document.getElementById('link-perfil');
    const linkAdmin = document.getElementById('link-admin');
    const linkLogout = document.getElementById('link-logout');

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        console.log("Sesión activa detectada para:", session.user.email);
        
        linkLogin.style.display = 'none';
        linkRegistro.style.display = 'none';
        linkPerfil.style.display = 'inline-block';
        linkLogout.style.display = 'inline-block';

        const { data: perfil, error } = await supabaseClient
            .from('amigos')
            .select('rol')
            .eq('auth_id', session.user.id)
            .single();

        if (perfil && (perfil.rol === 'propietario' || perfil.rol === 'administrador')) {
            linkAdmin.style.display = 'inline-block';
            console.log("Acceso concedido al Panel Admin.");
        }

        linkLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut();
            alert('Has cerrado sesión correctamente.');
            window.location.href = 'login.html';
        });

    } else {
        console.log("No hay sesión activa. Mostrando menú público.");
    }
}

actualizarMenu();