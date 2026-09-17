// Mi conexión al backend de Supabase
const supabaseUrl = 'https://zmxmcojxfxkwxtakkwkq.supabase.co';
const supabaseKey = 'sb_publishable_hekpGJ37q3DLhWvo5ZLyQg_wqfGXw_5';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- LÓGICA DE REGISTRO ---
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capturar y limpiar los datos (quitar espacios en blanco)
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        // 2. Validaciones front-end (Estilo HADA)
        if (!nombre || !email || !password) {
            alert('⚠️ Por favor, completa todos los campos obligatorios (*).');
            return;
        }

        if (password.length < 6) {
            alert('⚠️ La contraseña debe tener al menos 6 caracteres por seguridad.');
            return;
        }

        // 3. Envío a la base de datos
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: nombre }
            }
        });

        // 4. Manejo de respuestas y redirección
        if (error) {
            alert('❌ Error al registrar: ' + error.message);
        } else {
            alert('✅ ¡Registro exitoso! Tu información se ha guardado correctamente.\n\nSerás redirigido para iniciar sesión.');
            registroForm.reset();
            window.location.href = 'login.html'; // Redirección automática
        }
    });
}

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('⚠️ Ingresa tu correo y contraseña.');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            // Mensaje amigable si se equivocan de clave
            alert('❌ Credenciales incorrectas. Verifica tu correo o contraseña.');
        } else {
            alert('✅ ¡Inicio de sesión exitoso! Bienvenido.');
            window.location.href = 'index.html'; // Redirige al inicio
        }
    });
}