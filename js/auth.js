// conexión al backend de Supabase
const supabaseUrl = 'https://zmxmcojxfxkwxtakkwkq.supabase.co';
const supabaseKey = 'sb_publishable_hekpGJ37q3DLhWvo5ZLyQg_wqfGXw_5';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const registroForm = document.getElementById('registroForm');
if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('regNombre').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Registro de mi nueva gente
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: nombre }
            }
        });

        if (error) {
            alert('Error en el registro: ' + error.message);
        } else {
            alert('¡Registro exitoso! Revisa tu correo o intenta iniciar sesión.');
            registroForm.reset();
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validación para dejar entrar
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Error al iniciar sesión: ' + error.message);
        } else {
            alert('¡Inicio de sesión exitoso! Bienvenido.');
            window.location.href = 'index.html';
        }
    });
}