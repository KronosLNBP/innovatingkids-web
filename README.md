# innovatingkids-web

Sitio de **Innovating Kids** (https://www.innovatingkids.com.mx): programación, robótica y videojuegos para niños. Parte de Grupo Empresarial Díaz.

Es un sitio estático (HTML, CSS y JavaScript, sin compilación). Se puede publicar en cualquier hosting o en Cloudflare Pages, Netlify o GitHub Pages.

## Estructura

```
index.html                 Página de inicio
aviso-de-privacidad.html   Aviso de privacidad (borrador)
404.html                   Página de error
css/styles.css             Estilos
js/config.js               Número de WhatsApp (editar aquí)
js/main.js                 Menú, preguntas frecuentes y formulario
img/                       Imágenes (ver abajo)
robots.txt, sitemap.xml    SEO
```

## Antes de publicar

### 1. Imágenes
Copia la carpeta `img/` del hosting actual a este repositorio. El sitio usa los mismos nombres de archivo:

- `img/logo.jpg`
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
