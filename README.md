# innovatingkids-web

Sitio de **Innovating Kids** (https://www.innovatingkids.com.mx): programación, robótica y videojuegos para niños. Parte de Grupo Empresarial Díaz.

Es un sitio estático (HTML, CSS y JavaScript, sin compilación). Se puede publicar en cualquier hosting o en Cloudflare Pages, Netlify o GitHub Pages.

## Estructura

```
index.html                 Página de inicio
clase-muestra.html         Página de aterrizaje para anuncios: beneficio, 3 pasos, cursos, modalidades y formulario de clase muestra (encabezado sin menú)
cursos.html                Detalle de los 6 cursos y temarios descargables (PDF en temarios/)
modalidades.html           Modalidades online, híbrida y presencial a detalle
programacion-con-bloques.html  Juego de programación con bloques (30 niveles en 4 capítulos; ?profe=1 desbloquea todo)
aviso-de-privacidad.html   Aviso de privacidad (borrador)
404.html                   Página de error
css/styles.css             Estilos
js/config.js               Número de WhatsApp (editar aquí)
js/main.js                 Menú, preguntas frecuentes, formulario, animaciones de entrada y botón "Volver arriba"
js/bloques.js              Juego de bloques: niveles, editor arrastrar/soltar y animación (sin librerías)
img/                       Imágenes (ver abajo); img/mascota/ tiene las ilustraciones del astronauta (mascota)
video/                     Video de 1 minuto de la portada (MP4 1280x720, sin audio; póster en img/video-poster.jpg). Colores y tipografía de marca en css/styles.css (:root)
robots.txt, sitemap.xml    SEO
```

## Páginas publicadas

- `/` (index.html) — portada
- `/clase-muestra.html` — landing de clase muestra para anuncios
- `/cursos.html` — detalle de cursos y temarios
- `/modalidades.html` — online, híbrido y presencial
- `/programacion-con-bloques.html` — juego de programación con bloques
- `/aviso-de-privacidad.html` — aviso de privacidad (borrador; fuera del sitemap)
- `/alumnos.html` — portal de alumnos con Firebase (noindex; fuera del sitemap)
- `/admin.html` — administración del portal (noindex; fuera del sitemap)

Todas las páginas internas tienen el bloque "También te puede interesar". Las animaciones de entrada respetan `prefers-reduced-motion` y, si el JavaScript no carga, el contenido se ve normal.

## Portal de alumnos (Firebase)

Login de alumnos en `alumnos.html` y panel de administración en `admin.html`. No requiere servidor: usa Firebase Authentication (correo y contraseña) y Cloud Firestore desde el navegador. Funciona en el plan gratuito (Spark).

**Archivos:** `js/firebase-config.js` (configuración), `js/portal-fb.js` (conexión compartida), `js/alumnos.js`, `js/admin.js`, `firestore.rules` (reglas de seguridad).

### Qué ve el alumno
- **Mis cursos y avance:** cursos inscritos, barra de avance y módulos completados.
- **Materiales y temarios:** enlaces que solo ven los alumnos inscritos en ese curso.
- **Calificaciones y constancias:** calificación por módulo (0–10), promedio y botón para descargar la constancia.

### Cómo se crean las cuentas
Solo el administrador da de alta alumnos en `admin.html`; no hay registro libre. Cada alumno entra con:
- un **usuario** (ej. `ana.lopez`; por dentro es `ana.lopez@alumnos.innovatingkids.com.mx`, un correo que no recibe mensajes), o
- un **correo real** (el suyo o el de su mamá/papá). Con correo puede recuperar su contraseña solo.

Si un alumno con usuario olvida su contraseña: Editar → «Contraseña olvidada» → «Crear acceso nuevo». Se crea otra cuenta con sus cursos, avance y calificaciones, y la anterior queda desactivada (desde la página no se puede cambiar la contraseña de otra cuenta).

### Activarlo (una sola vez, ~15 minutos)
1. Entra a https://console.firebase.google.com con la cuenta de Google del negocio → **Agregar proyecto** (ej. `innovating-kids`). Google Analytics es opcional.
2. **Authentication → Comenzar → Método de acceso → Correo electrónico/contraseña → Habilitar** (solo la primera opción). En **Configuración → Dominios autorizados** agrega `innovatingkids.com.mx` y `www.innovatingkids.com.mx`.
3. **Firestore Database → Crear base de datos →** ubicación `nam5 (United States)` o la más cercana → modo **producción**.
4. En **Firestore → Reglas**, borra lo que hay, pega el contenido de `firestore.rules` y **Publicar**.
5. **Configuración del proyecto (engrane) → Tus apps → Web (`</>`)** → nombre `Sitio web` (sin Hosting) → copia el objeto `firebaseConfig` y pégalo en `js/firebase-config.js` en lugar de `null`. Esos datos no son secretos; la seguridad la dan las reglas.
6. **Primer administrador:** en **Authentication → Usuarios → Agregar usuario**, crea tu correo y contraseña. Copia su **UID**. En **Firestore → Iniciar colección** → ID `admins` → ID del documento = ese UID → campo `nombre` (texto) con tu nombre → Guardar.
7. Publica (push a `main`), entra a `/admin.html`, pestaña **Cursos → «Cargar los 6 cursos del sitio»** y agrega los módulos de cada curso. Luego da de alta alumnos.
8. Proyecto actual: `kids-cd56a` (configurado el 24 nov 2026). El enlace «Acceso alumnos» está en el pie de las páginas principales.

### Datos en Firestore
| Ruta | Contenido | Quién lee / escribe |
|---|---|---|
| `admins/{uid}` | administradores | se crea a mano en la consola |
| `alumnos/{uid}` | nombre, usuario/correo, tutor, WhatsApp, `cursos[]`, `activo` | el alumno lee lo suyo; admin escribe |
| `alumnos/{uid}/avance/{curso}` | `completados[]`, `calificaciones{}`, `constanciaUrl` | el alumno lee lo suyo; admin escribe |
| `cursos/{curso}` | nombre, orden, `modulos[{id, titulo}]` | cualquiera con sesión lee; admin escribe |
| `cursos/{curso}/privado/materiales` | `items[{titulo, url}]` | alumnos activos inscritos; admin escribe |

### Notas
- **Materiales y constancias son enlaces** (Google Drive, YouTube, etc.). Firebase Storage ya no está en el plan gratuito. En Drive, «Cualquier persona con el enlace» puede abrir el archivo si alguien comparte el enlace; para constancias usa un enlace por alumno.
- Si cambias el nombre de un módulo, se reinicia su avance y calificación (el módulo se identifica por su nombre al guardar).
- Datos personales de menores: guarda solo lo necesario (nombre y, si quieres, tutor y WhatsApp) y actualiza el aviso de privacidad para mencionar el portal y Firebase (Google) como encargado.
- Para borrar por completo una cuenta: Authentication → Usuarios → eliminar, y en Firestore borra `alumnos/{uid}`.

## Antes de publicar

### 1. Imágenes
Copia la carpeta `img/` del hosting actual a este repositorio. El sitio usa los mismos nombres de archivo:

- `img/logo.png` y `img/favicon.png` (logo oficial con el astronauta, incluido en el repositorio)
- `img/student/1.jpg`
- `img/alumnos/alumno1.jpeg`, `alumno2.jpeg`, `alumno3.jpeg`

Recomendado: convertirlas a `.webp` y reducirlas a máximo 1600 px de ancho para que el sitio cargue rápido.

### 2. WhatsApp
El número está en `js/config.js` (con lada 52, solo dígitos). Todos los botones de WhatsApp y el formulario lo toman de ahí.

### 3. Datos por agregar cuando estén listos
Para publicar se dejaron fuera, sin inventar nada:

- Fecha de inicio de inscripciones
- Rango de edades (general y por curso)
- Máximo de alumnos por grupo
- Dirección y horario del laboratorio
- Testimonio real de una familia (con su autorización)
- Precios
- Enlaces de Facebook e Instagram

### 4. Aviso de privacidad
`aviso-de-privacidad.html` es un borrador. Complétalo y revísalo con asesoría legal: el formulario recaba datos de menores de edad.

## Publicación
Cada cambio en `main` se publica solo por FTP (`.github/workflows/deploy.yml`) con los secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` y `FTP_SERVER_DIR`. Antes de subir, el flujo guarda un respaldo de las páginas que reemplaza en los *Artifacts* de cada ejecución (90 días).

## Cómo funciona el formulario
No necesita servidor: valida los datos y abre WhatsApp con un mensaje ya escrito (nombre, WhatsApp, edad, curso y modalidad). Si después quieren guardar los registros en una hoja de cálculo o CRM, se puede conectar a Formspree, Google Forms o un webhook.

## Probar en tu computadora
Abre `index.html` en el navegador, o desde esta carpeta ejecuta:

```
python3 -m http.server 8000
```

y entra a http://localhost:8000.
