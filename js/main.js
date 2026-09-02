// Configuración e Inicialización de la Base de Datos (Conectado a tu proyecto de Supabase)
const SUPABASE_URL = 'https://jawxvvskpnaveoggtssx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DEEda6s5Eg2QxA74L9z2KA_XvqLZVFh';

// Evitamos inicializar Supabase si la librería CDN no cargó por fallas de conexión a internet del usuario, 
// o si window.supabase no existe aún.
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('JACC SPORT - Aplicación estática conectada exitosamente');

    // Al cargar la página, pedirle a Supabase la información del equipo actual
    loadDynamicTeam();
});

async function loadDynamicTeam() {
    const container = document.getElementById('team-container');
    if (!container) return;

    try {
        if (!supabase) {
            console.warn('Librería Supabase no encontrada. Renderizando respaldo dinámico de emergencia.');
            renderStaticFallback();
            return;
        }

        // 1. Obtenemos los entrenadores directamente de la nube y los ordenamos (usamos la columna "orden" creada en el SQL)
        const { data, error } = await supabase
            .from('equipo')
            .select('*')
            .order('orden', { ascending: true }); // Ordena de menor a mayor (1 a 5)

        // Si hay error (la tabla no existe o error SQL), pintamos el plan B para que la web no se rompa
        if (error) {
            console.error('Error leyendo los datos en Supabase:', error);
            renderStaticFallback();
            return;
        }

        // 2. Comprobamos si la base de datos descargó datos correctamente
        if (data && data.length > 0) {
            renderTeamMembers(data);
        } else {
            console.warn('Conexión a Supabase lograda, pero la tabla equipo está vacía.');
            renderStaticFallback();
        }

    } catch (err) {
        console.error('Fallo del lado del cliente en fetch a base de datos:', err);
        renderStaticFallback();
    }
}

function renderTeamMembers(members) {
    const container = document.getElementById('team-container');
    container.innerHTML = '';

    let injectedHTML = '';

    members.forEach(member => {
        // En base de datos se usa nombre (si viene estático usamos 'name' del respaldo)
        const nombreMostrar = member.nombre || member.name;
        const rolMostrar = member.rol || member.role;
        const descMostrar = member.descripcion || member.description;

        // Atributos multimedia
        const fotoURL = member.imagen || member.image;
        const iconoName = member.icono || 'fa-user-circle';

        // Lógica condicional (Si tiene URL de foto la muestro, si no dejo el ícono base)
        const avatarHTML = fotoURL
            ? `<img src="${fotoURL}" alt="${nombreMostrar}" class="member-avatar-img">`
            : `<div class="member-avatar"><i class="fas ${iconoName}"></i></div>`;

        const cardHTML = `
            <div class="team-member">
                ${avatarHTML}
                <h3>${nombreMostrar}</h3>
                <p class="member-role">${rolMostrar}</p>
                <p class="member-description">${descMostrar}</p>
            </div>
        `;

        injectedHTML += cardHTML;
    });

    container.innerHTML = injectedHTML;
}

// ==========================================
// Módulo de Respaldo JS (Alta Disponibilidad)
// ==========================================
function renderStaticFallback() {
    // Si SQL de Supabase falla temporalmente por cambios o configuraciones, JACC SPORT siempre cargará esto de manera offline:
    const fallbackTeam = [
        {
            name: "Anderson Bello",
            role: "Entrenador Fútbol, Futsal y Boxeo",
            description: "Especialista en táctica y técnica intensiva. Dedicado a explotar tu máximo potencial en la cancha y en el cuadrilátero.",
            icon: "fa-user-circle"
        },
        {
            name: "Daniel Bello",
            role: "Entrenador Fútbol, Futsal y Boxeo",
            description: "Experto en desarrollo físico y resistencia. Entrenamientos personalizados enfocados en agilidad y fuerza explosiva.",
            icon: "fa-user-circle"
        },
        {
            name: "Carlos Bello",
            role: "Entrenador Fútbol, Futsal y Boxeo",
            description: "Enfocado en fundamentos técnicos y motivación deportiva. Tu compañero perfecto para superar tus propios límites.",
            icon: "fa-user-circle"
        },
        {
            name: "Lorena Bello",
            role: "Zumba • Administración y Marketing",
            description: "El alma de nuestras clases grupales. Administra las reservaciones, agendas, y garantiza una experiencia inolvidable en cada rutina.",
            icon: "fa-user-circle"
        },
        {
            name: "Julian Ramos",
            role: "Ing. Sistemas y Soporte Web",
            description: "Encargado de la infraestructura tecnológica, bases de datos (Supabase), y optimización de presencia digital de todo el equipo JACC SPORT.",
            icon: "fa-laptop-code"
        }
    ];

    renderTeamMembers(fallbackTeam);
}
