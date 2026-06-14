// 🔗 URL Oficial de la Base de Datos del Mundial (Conectado a tu Google Sheets)
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbySd7c-ZnvPyjGFHn_CqalNe44qDjtd2D9__JBjezULP2a7Sj_Gao89RBR9lhA944Cv9Q/exec";

// ==========================================
// 📝 MOTOR DE REGISTRO (Para registro.html)
// ==========================================
document.getElementById('registro')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const boton = e.target.querySelector('.btn-submit');
    boton.innerText = "Procesando Registro...";
    boton.disabled = true;

    // Recolectar los horarios que el usuario seleccionó
    const horariosActivos = [];
    document.querySelectorAll('input[name="horario"]:checked').forEach(checkbox => {
        horariosActivos.push(checkbox.value);
    });

    // Organizar los datos para enviarlos a Google Sheets
    const datos = {
        action: "registrar",
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        ubicacion: document.getElementById('ubicacion').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value,
        robloxUser: document.getElementById('usuarioRoblox').value,
        perfilRoblox: document.getElementById('perfilRoblox').value || "No proporcionado",
        horarios: horariosActivos.join(', ') || "No especificado",
        rol: document.getElementById('rol').value,
        experiencia: document.getElementById('experiencia').value,
        porque: document.getElementById('porque').value,
        avatar: document.getElementById('avatarLink').value
    };

    try {
        // Enviar datos al servidor de Google
        await fetch(GOOGLE_API_URL, {
            method: 'POST',
            mode: 'no-cors', // Evita bloqueos de seguridad en GitHub Pages
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        // Generar un número visual rápido basado en la hora para simular el folio inmediato
        const numSeguro = String(Math.floor(10000 + Math.random() * 90000));
        const folioFormateado = `MRC26-${numSeguro}`;

        // Ocultar formulario y mostrar el folio en pantalla
        document.getElementById('registro').style.display = 'none';
        document.getElementById('contenedor-folio').classList.remove('hidden');
        document.getElementById('folio').innerText = folioFormateado;

    } catch (error) {
        alert("Ocurrió un problema de red al conectar con Google Sheets. Inténtalo de nuevo.");
        console.error(error);
    } finally {
        boton.disabled = false;
        boton.innerText = "✅ FINALIZAR REGISTRO";
    }
});


// ==========================================
// 🔍 MOTOR DE CONSULTA (Para consultar.html)
// ==========================================
document.getElementById('consulta')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const boton = e.target.querySelector('.btn-submit');
    const folioInput = document.getElementById('folio-input').value.trim().toUpperCase();
    const contenedorResultado = document.getElementById('resultado-consulta');
    const badge = document.getElementById('badge-estado');
    
    boton.innerText = "Buscando en la base de datos...";
    boton.disabled = true;
    contenedorResultado.classList.add('hidden');

    try {
        // Consultar el folio a Google Apps Script usando una petición GET
        const response = await fetch(`${GOOGLE_API_URL}?action=consultar&folio=${folioInput}`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                // Inyectar datos del aspirante en la interfaz
                document.getElementById('res-usuario').innerText = data.robloxUser;
                document.getElementById('res-rol').innerText = data.rol;
                
                // Reiniciar los estilos previos del cuadro de estado
                badge.className = "badge";
                
                // Aplicar color e icono según el estado real de tu Google Sheets
                switch(data.estado.trim().toLowerCase()) {
                    case 'en revisión':
                    case 'en revision':
                        badge.innerText = "🟡 En revisión";
                        badge.classList.add('estado-revision');
                        break;
                    case 'aprobado':
                        badge.innerText = "🟢 Aprobado";
                        badge.classList.add('estado-aprobado');
                        break;
                    case 'lista de espera':
                        badge.innerText = "🔵 Lista de espera";
                        badge.classList.add('estado-espera');
                        break;
                    case 'no seleccionado':
                        badge.innerText = "🔴 No seleccionado";
                        badge.classList.add('estado-rechazado');
                        break;
                    default:
                        // Por si escribes otro estado personalizado manualmente
                        badge.innerText = data.estado;
                        badge.style.background = "#7A00FF";
                }
                
                // Mostrar la tarjeta con la respuesta al usuario
                contenedorResultado.classList.remove('hidden');
            } else {
                alert("El número de folio no existe en el sistema. Asegúrate de escribirlo completo (Ej: MRC26-00001).");
            }
        } else {
            alert("El servidor de Google no respondió correctamente. Inténtalo más tarde.");
        }
    } catch (error) {
        alert("Error al intentar conectar con el sistema de consultas.");
        console.error(error);
    } finally {
        boton.disabled = false;
        boton.innerText = "Buscar Estado";
    }
});
