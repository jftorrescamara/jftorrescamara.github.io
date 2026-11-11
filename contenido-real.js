(() => {
 const cabecera = document.querySelector('#trabajos .sh');
 if (cabecera) { const n = document.createElement('p'); n.className = 'tr-contador'; n.textContent = '(06)'; cabecera.append(n); }
 const gallery = document.querySelector('.fusion-gallery');
 if (gallery) gallery.innerHTML = "<li class=\"fusion-item\" data-cat=\"Videoclip\"><a class=\"fusion-card\" href=\"/trabajos/gluones/\" aria-label=\"Gluones\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/gluones/preview.mp4\" poster=\"/media/proyectos/gluones/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>Gluones</h3><p>Erik Urano ft Hoke</p><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li><li class=\"fusion-item\" data-cat=\"Videoclip\"><a class=\"fusion-card\" href=\"/trabajos/domingo-quimico/\" aria-label=\"Domingo químico\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/domingo-quimico/preview.mp4\" poster=\"/media/proyectos/domingo-quimico/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>Domingo químico</h3><p>Depresión Sonora</p><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li><li class=\"fusion-item\" data-cat=\"Videoclip\"><a class=\"fusion-card\" href=\"/trabajos/como-seria-vivir-en-el-campo/\" aria-label=\"Cómo sería vivir en el campo\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/como-seria-vivir-en-el-campo/preview.mp4\" poster=\"/media/proyectos/como-seria-vivir-en-el-campo/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>Cómo sería vivir en el campo</h3><p>Depresión Sonora</p><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li><li class=\"fusion-item\" data-cat=\"Videoclip\"><a class=\"fusion-card\" href=\"/trabajos/un-punal/\" aria-label=\"Un puñal\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/un-punal/preview.mp4\" poster=\"/media/proyectos/un-punal/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>Un puñal</h3><p>Akaura</p><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li><li class=\"fusion-item\" data-cat=\"Fashion film\"><a class=\"fusion-card\" href=\"/trabajos/summer-xx92/\" aria-label=\"Summer XX92: Chp 1 and 2\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/summer-xx92/preview.mp4\" poster=\"/media/proyectos/summer-xx92/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>Summer XX92: Chp 1 and 2</h3><p>La Vespa Roja</p><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li><li class=\"fusion-item\" data-cat=\"Publicidad\"><a class=\"fusion-card\" href=\"/trabajos/codere/\" aria-label=\"El clásico\"><div class=\"fusion-frame real-media\"><video class=\"fusion-image\" data-preview=\"card\" data-src=\"/media/proyectos/codere/preview.mp4\" poster=\"/media/proyectos/codere/portada.jpg\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\"></video></div><div class=\"fusion-caption\"><h3>El clásico</h3><span class=\"fusion-arrow\" aria-hidden=\"true\">↗</span></div></a></li>";
 // Filtros propios: los del Astro apuntan a la lista original, que la galería sustituye.
 const filters = document.querySelector('.tr-filtros');
 if (filters && gallery) {
   const secciones = [['*','Todos'],['Videoclip','Videoclips'],['Publicidad','Publicidad'],['Fashion film','Fashion films']];
   const grupo = document.createElement('div');
   grupo.className = 'tr-filtros'; grupo.setAttribute('role','group'); grupo.setAttribute('aria-label','Filtrar por categoría');
   grupo.innerHTML = secciones.map(([cat,label],i)=>`<button type="button" aria-pressed="${i===0}" data-seccion="${cat}">${label}</button>`).join('');
   filters.replaceWith(grupo);
   const vacio = document.createElement('p');
   vacio.className = 'tr-vacio'; vacio.hidden = true; vacio.setAttribute('role','status');
   gallery.after(vacio);
   grupo.addEventListener('click', e => {
     const boton = e.target.closest('[data-seccion]'); if (!boton) return;
     const cat = boton.dataset.seccion;
     grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
     let visibles = 0;
     gallery.querySelectorAll('.fusion-item').forEach(item => { item.hidden = cat !== '*' && item.dataset.cat !== cat; if (!item.hidden) visibles++; });
     vacio.hidden = visibles > 0;
     vacio.textContent = visibles ? '' : `Próximamente: ${boton.textContent.toLowerCase()}.`;
   });
 }
 const instagram = document.querySelector('#contacto .redes a[aria-label="Instagram"]');
 if (instagram) instagram.href = 'https://www.instagram.com/avec.aida/';
 const monitor = document.querySelector('#showreel .monitor');
 if (monitor) {
   const reel = document.createElement('div'); reel.className = monitor.className; reel.dataset.reelPlayer = '';
   // Showreel: arranca en silencio y en bucle; el botón de sonido lo gestiona videos-locales.js.
   reel.innerHTML = `
     <div class="real-reel-stage">
       <img class="monitor-cover" src="/media/showreel-cover.jpg" alt="">
       <video class="monitor-video" width="1920" height="1080" data-preview="reel" data-src="/media/showreel.mp4" poster="/media/showreel-poster.jpg" muted loop playsinline preload="none" aria-hidden="true"></video>
       <div class="real-reel-caption" aria-hidden="true"><span>Showreel</span></div>
     </div>
     <div class="real-reel-bar real-reel-botones" data-reel-controls>
       <button type="button" data-preview-toggle aria-label="Reproducir vista previa" aria-pressed="false">Reproducir</button>
       <button type="button" class="real-reel-sonido" data-reel-sonido aria-label="Sonido del showreel" title="Sonido del showreel" aria-pressed="false"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="onda" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="tachado" d="M16 9l5 6M21 9l-5 6"/></svg></button>
       <button type="button" data-reel-fullscreen aria-pressed="false">pantalla completa</button>
     </div>`;
   monitor.replaceWith(reel);
 }
})();