// Reproductor «sala de proyección» de las fichas (propuesta C de ../reproductor).
// Antes de pulsar, el vídeo muestra el recorte sin sonido en bucle (data-preview);
// al pulsar por primera vez cambia a la pieza completa con sonido (data-completo).
(() => {
  const FPS = 25;
  const dos = n => String(Math.floor(n)).padStart(2, '0');
  const tc = t => `${dos(t / 3600)}:${dos(t / 60 % 60)}:${dos(t % 60)}:${dos(t % 1 * FPS)}`;
  const corto = t => `${dos(t / 60)}:${dos(t % 60)}`;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (const root of document.querySelectorAll('[data-rp]')) {
    const v = root.querySelector('video[data-v]');
    const todos = sel => root.querySelectorAll(sel);
    const texto = (sel, t) => todos(sel).forEach(e => { e.textContent = t; });
    let completo = false, inactivo;

    if (v.dataset.preview && !reducido) {
      Object.assign(v, { src: v.dataset.preview, muted: true, loop: true });
      v.play().catch(() => {});
    }

    // Encaje del vídeo sin bandas: se descuentan las bandas grabadas (data-recorte-x) y se calcula a mano
    // el «cover» de la portada o el «contain» de la reproducción sobre la imagen útil.
    const rx = +v.dataset.recorteX || 0;
    const encajarVideo = () => {
      const W = root.clientWidth, H = root.clientHeight, vw = v.videoWidth || +v.getAttribute('width'), vh = v.videoHeight || +v.getAttribute('height');
      if (!W || !vw) return;
      const a = vw * (1 - 2 * rx) / vh, llenar = root.dataset.state === 'idle';
      const h = (W / H > a) === llenar ? W / a : H, w = h * a, ancho = w / (1 - 2 * rx);
      Object.assign(v.style, { width: `${ancho}px`, height: `${h}px`, left: `${(W - ancho) / 2}px`, top: `${(H - h) / 2}px` });
    };
    v.addEventListener('loadedmetadata', encajarVideo);
    root.addEventListener('rp:estado', encajarVideo);
    addEventListener('resize', encajarVideo);
    document.addEventListener('fullscreenchange', encajarVideo);

    const etiqueta = (b, par, activo) => { const [a, c] = par.split('|'); b.textContent = activo ? c : a; };
    const estado = () => {
      root.dataset.state = !completo ? 'idle' : v.paused ? 'paused' : 'playing';
      todos('[data-play]').forEach(b => {
        b.setAttribute('aria-label', v.paused || !completo ? 'Reproducir' : 'Pausar');
        if (b.dataset.play) etiqueta(b, b.dataset.play, completo && !v.paused);
      });
      todos('[data-mute]').forEach(b => b.setAttribute('aria-pressed', String(!v.muted)));
      root.dispatchEvent(new Event('rp:estado'));
    };
    const tiempo = () => {
      const p = completo && v.duration ? v.currentTime / v.duration : 0;
      root.style.setProperty('--p', p);
      if (!completo) return;
      texto('[data-tc]', tc(v.currentTime));
      texto('[data-tc-corto]', corto(v.currentTime));
    };

    // Carga la pieza completa (con sonido y sin bucle) y pone la duración real en cuanto se conoce.
    const cargar = src => {
      Object.assign(v, { src, loop: false, muted: false });
      v.addEventListener('loadedmetadata', () => texto('[data-dur]', corto(v.duration)), { once: true });
    };
    const reproducir = async () => {
      try {
        await v.play();
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (error.name === 'NotAllowedError' && !v.muted) {
          v.muted = true;
          try { await v.play(); return; } catch (retryError) {
            if (retryError.name === 'AbortError') return;
          }
        }
        // Permite reintentar desde los controles del navegador si el dispositivo bloquea el vídeo.
        v.controls = true;
      }
    };
    async function alternar() {
      if (!completo) {
        completo = true;
        cargar(v.dataset.completo);
        // La vista previa puede seguir marcada como reproduciéndose al cambiar src en Safari.
        // Pedir play aquí conserva el gesto del usuario y arranca siempre la pieza completa.
        await reproducir();
      } else if (v.paused) await reproducir();
      else v.pause();
      estado();
    }
    // Piezas con varios capítulos completos (Summer XX92): el selector cambia de vídeo; si ya se estaba
    // viendo uno, el nuevo arranca solo.
    const capitulos = todos('[data-capitulo]');
    capitulos.forEach(b => b.addEventListener('click', async e => {
      e.stopPropagation();
      capitulos.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.capitulo === b.dataset.capitulo)));
      texto('[data-dur]', b.dataset.duracion); texto('[data-dato-dur]', b.dataset.duracion);
      if (v.dataset.completo === b.dataset.capitulo) return;
      v.dataset.completo = b.dataset.capitulo;
      v.poster = b.dataset.poster;
      if (completo) {
        cargar(b.dataset.capitulo);
        await reproducir();
        estado();
      }
    }));
    root.rp = { v, alternar, tc, corto, ir: t => { if (completo) v.currentTime = t; } };

    todos('[data-play]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); alternar(); }));
    todos('[data-mute]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); v.muted = !v.muted; estado(); }));
    todos('[data-full]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.();
    }));
    // Barra arrastrable: el clic o el arrastre en [data-bar] busca en la pieza.
    todos('[data-bar]').forEach(bar => {
      const buscar = e => {
        if (!completo || !v.duration) return;
        const r = bar.getBoundingClientRect();
        v.currentTime = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * v.duration;
      };
      bar.addEventListener('pointerdown', async e => {
        e.stopPropagation();
        if (!completo) await alternar();
        bar.setPointerCapture(e.pointerId); buscar(e);
        const mover = ev => buscar(ev);
        bar.addEventListener('pointermove', mover);
        bar.addEventListener('pointerup', () => bar.removeEventListener('pointermove', mover), { once: true });
      });
    });

    // Los mandos se esconden tras 2,5 s sin mover el ratón mientras suena.
    const despertar = () => {
      root.classList.remove('rp-quieto'); clearTimeout(inactivo);
      inactivo = setTimeout(() => { if (!v.paused && completo) root.classList.add('rp-quieto'); }, 2500);
    };
    root.addEventListener('pointermove', despertar);
    root.addEventListener('pointerdown', despertar);

    document.addEventListener('keydown', e => {
      if (e.target.closest('input,textarea,select')) return;
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') { if (e.target.closest('button,a')) return; e.preventDefault(); alternar(); }
      else if (k === 'm') { v.muted = !v.muted; estado(); }
      else if (k === 'f') todos('[data-full]')[0]?.click();
      else if (k === 'arrowright' && completo) v.currentTime += 5;
      else if (k === 'arrowleft' && completo) v.currentTime -= 5;
      else if (k === '.' && completo) { v.pause(); v.currentTime += 1 / FPS; }
      else if (k === ',' && completo) { v.pause(); v.currentTime -= 1 / FPS; }
      else return;
      despertar();
    });


    // Página entera a oscuras mientras hay pieza; clic en cualquier parte del vídeo para parar o seguir.
    root.addEventListener('click', e => { if (!e.target.closest('a,button,.rp-linea,.rp-sub')) alternar(); });
    // El play solo está para que se entienda: tras la primera reproducción desaparece.
    root.addEventListener('rp:estado', () => {
      const s = root.dataset.state;
      if (s !== 'idle') root.classList.add('rp-visto');
      document.body.classList.toggle('rp-oscuro', s !== 'idle');
    });

    // Título de la portada en una sola línea: se reduce el tamaño hasta que quepa; si ni con 26 px cabe, se deja partir.
    const h1 = root.querySelector('.rp-sala__portada h1');
    const encajar = () => {
      if (!h1) return;
      h1.style.fontSize = ''; h1.style.whiteSpace = 'nowrap';
      let t = parseFloat(getComputedStyle(h1).fontSize);
      while (h1.scrollWidth > h1.clientWidth && t > 26) h1.style.fontSize = `${t -= 2}px`;
      if (h1.scrollWidth > h1.clientWidth) h1.style.whiteSpace = 'normal';
    };
    encajar(); addEventListener('resize', encajar); document.fonts?.ready.then(encajar);

    for (const ev of ['play', 'pause', 'ended', 'volumechange']) v.addEventListener(ev, estado);
    v.addEventListener('timeupdate', tiempo);
    v.addEventListener('seeked', tiempo);
    estado(); tiempo();
  }

  // Galería de fotogramas: las miniaturas abren el fotograma grande en un <dialog> con flechas y Escape.
  for (const galeria of document.querySelectorAll('[data-galeria]')) {
    const dialogo = galeria.querySelector('dialog');
    const imagen = dialogo.querySelector('img');
    const contador = dialogo.querySelector('.real-visor__n');
    const enlaces = [...galeria.querySelectorAll('[data-fotograma]')];
    let actual = 0;
    const mostrar = n => {
      actual = (n + enlaces.length) % enlaces.length;
      imagen.src = enlaces[actual].dataset.fotograma;
      contador.textContent = `${actual + 1} / ${enlaces.length}`;
    };
    enlaces.forEach((a, n) => a.addEventListener('click', e => { e.preventDefault(); mostrar(n); dialogo.showModal(); }));
    dialogo.querySelector('[data-visor=anterior]').addEventListener('click', () => mostrar(actual - 1));
    dialogo.querySelector('[data-visor=siguiente]').addEventListener('click', () => mostrar(actual + 1));
    dialogo.querySelector('[data-visor=cerrar]').addEventListener('click', () => dialogo.close());
    // Clic fuera de la imagen y de los botones: cierra.
    dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') mostrar(actual - 1);
      else if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
    // Al cerrar, el foco vuelve a la miniatura que se ampliaba.
    dialogo.addEventListener('close', () => enlaces[actual].focus());
  }
})();
