// Guarda el avance de los juegos en la cuenta del alumno (si entró al portal).
// Los juegos avisan con el evento "ik:progreso" y reciben lo guardado con "ik:progreso-remoto".
// Firestore: alumnos/{uid}/juegos/{juego} → { niveles: {"0": 3, ...}, total, actualizado }
import { listo, alCambiarSesion, leer, guardar, ahora } from './portal-fb.js';

const juego = document.body.dataset.juego;
const aviso = document.getElementById('ik-sesion');
let uid = null;
let pendiente = null;
let espera = null;

function mostrar(html) {
  if (!aviso) return;
  aviso.innerHTML = html;
  aviso.hidden = false;
}

async function subir() {
  if (!uid || !pendiente) return;
  const datos = pendiente;
  pendiente = null;
  try {
    await guardar('alumnos/' + uid + '/juegos/' + juego, {
      niveles: datos.niveles, total: datos.total, actualizado: ahora()
    }, false);
  } catch (e) {
    console.warn('No se pudo guardar el avance', e);
    mostrar('No se pudo guardar tu avance en el portal. Sigue jugando: se guarda en este navegador.');
  }
}

document.addEventListener('ik:progreso', (e) => {
  if (!e.detail || e.detail.juego !== juego) return;
  const niveles = {};
  Object.keys(e.detail.niveles || {}).forEach((k) => { niveles[String(k)] = +e.detail.niveles[k] || 0; });
  pendiente = { niveles, total: e.detail.total || 0 };
  clearTimeout(espera);
  espera = setTimeout(subir, 800);
});

if (juego && listo) {
  alCambiarSesion(async (user) => {
    uid = null;
    if (!user) {
      mostrar('<a href="alumnos.html">Entra al portal de alumnos</a> para guardar tus estrellas en tu cuenta.');
      return;
    }
    try {
      const alumno = await leer('alumnos/' + user.uid);
      if (!alumno || alumno.activo === false) { if (aviso) aviso.hidden = true; return; }
      uid = user.uid;
      const nombre = String(alumno.nombre || '').trim().split(/\s+/)[0];
      mostrar('Jugando como <strong></strong>. Tus estrellas se guardan en tu <a href="alumnos.html">portal</a>.');
      aviso.querySelector('strong').textContent = nombre || 'alumno';
      const guardado = await leer('alumnos/' + uid + '/juegos/' + juego).catch(() => null);
      document.dispatchEvent(new CustomEvent('ik:progreso-remoto', { detail: { niveles: (guardado && guardado.niveles) || {} } }));
      if (pendiente) subir();
    } catch (e) {
      console.warn(e);
    }
  });
}
