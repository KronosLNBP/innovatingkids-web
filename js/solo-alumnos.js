// Páginas solo para alumnos (p. ej. dinosaurios.html): muestran el contenido únicamente
// si hay sesión del portal con una cuenta de alumno activa (o de maestro).
// Nota: el sitio es estático; esto evita el acceso normal, pero no es una protección de servidor.
import { listo, alCambiarSesion, leer } from './portal-fb.js';

window.IK_GATE_OK = true;
function estado(nombre) {
  document.querySelectorAll('[data-gate]').forEach((e) => { e.hidden = e.getAttribute('data-gate') !== nombre; });
}
function abrir() {
  document.documentElement.classList.remove('gate-locked');
  const g = document.getElementById('gate');
  if (g) g.hidden = true;
  // el juego se midió mientras estaba oculto: que vuelva a calcular su tamaño
  window.dispatchEvent(new Event('resize'));
}

if (!listo) {
  estado('error');
} else {
  alCambiarSesion(async (user) => {
    if (!user) { document.documentElement.classList.add('gate-locked'); estado('login'); return; }
    try {
      const alumno = await leer('alumnos/' + user.uid);
      if (alumno && alumno.activo !== false) { abrir(); return; }
      const admin = await leer('admins/' + user.uid).catch(() => null);
      if (admin) { abrir(); return; }
      estado('sinacceso');
    } catch (e) {
      console.warn(e);
      estado('error');
    }
  });
}
