// 🔗 URL Oficial de la Base de Datos del Mundial
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbySd7c-ZnvPyjGFHn_CqalNe44qDjtd2D9__JBjezULP2a7Sj_Gao89RBR9lhA944Cv9Q/exec";

// ==========================================
// 📝 MOTOR DE REGISTRO (registro.html)
// ==========================================
document.getElementById('registro')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const boton = e.target.querySelector('.btn-submit');
    boton.innerText = "Procesando Registro...";
    boton.disabled = true;

    const horariosActivos = [];
    document.querySelectorAll('input[name="horario"]:checked').forEach(checkbox => {
        horariosActivos.push(checkbox.value);
    });

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
        await fetch(GOOGLE_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const numSeguro = String(Math.floor(10000 + Math.random() * 90000));
        const folioFormateado = `MRC26-${numSeguro}`;

        document.getElementById('registro').style.display = 'none';
        document.getElementById('contenedor-folio').classList.remove('hidden');
        document.getElementById('folio').innerText = folioFormateado;

    } catch (error) {
        alert("Error de red al registrar.");
        console.error(error);
    } finally {
        boton.disabled = false;
        boton.innerText = "✅ FINALIZAR REGISTRO";
    }
});


// ==========================================
// 🔍 MOTOR DE CONSULTA CORREGIDO (consultar.html)
// ==========================================
document.getElementById('consulta')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const boton = e.target.querySelector('.btn-submit');
    const folioInput = document.getElementById('folio-input').value.trim().toUpperCase();
    const contenedorResultado = document.getElementById('resultado-consulta');
    const badge = document.getElementById('badge-estado');
    
    boton.innerText = "Buscando en la base de datos...";
    boton.disabled = true;
    contenedorResultado.classList.add('hidden');

    // Usamos la estrategia de JSONP / URLSearchParams limpia para saltarnos bloqueos de CORS
    const urlConsulta = `${GOOGLE_API_URL}?action=consultar&folio=${encodeURIComponent(folioInput)}`;

    fetch(urlConsulta)
        .then(response => {
            if (!response.ok) throw new Error("Error en servidor");
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Inyectar la información localizada en la hoja
                document.getElementById('res-usuario').innerText = data.robloxUser || "No asignado";
                document.getElementById('res-rol').innerText = data.rol || "No asignado";
                
                // Resetear estilos anteriores del badge
                badge.className = "badge";
                
                // Control de estados exactos basados en tu columna N de Google Sheets
                const estadoReal = data.estado ? data.estado.trim().toLowerCase() : "";
                
                if (estadoReal === 'en revisión' || estadoReal === 'en revision' || estadoReal === '') {
                    badge.innerText = "🟡 En revisión";
                    badge.classList.add('estado-revision');
                } else if (estadoReal === 'aprobado') {
                    badge.innerText = "🟢 Aprobado";
                    badge.classList.add('estado-aprobado');
                } else if (estadoReal === 'lista de espera') {
                    badge.innerText = "🔵 Lista de espera";
                    badge.classList.add('estado-espera');
                } else if (estadoReal === 'no seleccionado') {
                    badge.innerText = "🔴 No seleccionado";
                    badge.classList.add('estado-rechazado');
                } else {
                    // Por si pones texto personalizado en la celda
                    badge.innerText = data.estado;
                    badge.style.backgroundColor = "#7A00FF";
                }
                
                // Mostrar la tarjeta animada al usuario
                contenedorResultado.classList.remove('hidden');
            } else {
                alert("El número de folio no existe en el sistema. Recuerda usar el formato completo. Ej: MRC26-00001");
            }
        })
        .catch(error => {
            alert("No se pudo conectar al sistema de consultas. Verifica que tu script de Google esté bien publicado.");
            console.error(error);
        })
        .finally(() => {
            boton.disabled = false;
            boton.innerText = "Buscar Estado";
        });
});
