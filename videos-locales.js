(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none)');
  const videos = [...document.querySelectorAll('video[data-preview]')];
  const states = new Map();
  // El botón de sonido solo existe en el showreel de la portada: arranca en silencio y lo activa el usuario.
  const reflejarSonido = video => {
    const boton = video.parentElement.querySelector('[data-reel-sonido]');
    if (boton) boton.setAttribute('aria-pressed', String(!video.muted));
  };
  function update(video) {
    const state = states.get(video);
    const shouldPlay = state.visible && !document.hidden && !state.stopped &&
      (!reduced.matches || state.explicit) && (video.dataset.preview === 'reel' || state.active || touch.matches);
    if (state.reelControls && reduced.matches) state.reelControls.hidden = false;
    if (shouldPlay) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.muted = !state.sound;
      video.play().catch(async error => {
        if (error.name === 'AbortError') return;
        if (!video.muted) {
          state.sound = false;
          video.muted = true;
          reflejarSonido(video);
          try { await video.play(); return; } catch (retryError) {
            if (retryError.name === 'AbortError') return;
          }
        }
        if (state.reelControls) state.reelControls.hidden = false;
      });
    } else video.pause();
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const state = states.get(entry.target);
    const minimumVisibility = state.reelControls ? .25 : .2;
    state.visible = entry.isIntersecting && entry.intersectionRatio >= minimumVisibility;
    if (state.reelControls && !state.visible) state.stopped = false;
    update(entry.target);
  }), {threshold:[0,.2,.25]});
  for (const video of videos) {
    const reelControls = video.parentElement.querySelector('[data-reel-controls]');
    states.set(video,{visible:false,active:false,stopped:false,explicit:false,sound:false,reelControls});
    if (reelControls) {
      video.addEventListener('playing', () => {
        video.parentElement.classList.add('is-playing');
        reelControls.hidden = false;
      });
      video.addEventListener('pause', () => video.parentElement.classList.remove('is-playing'));
    }
    observer.observe(video);
    const card = video.closest('.fusion-card');
    if (card) {
      for (const type of ['pointerenter','focusin']) card.addEventListener(type,() => { states.get(video).active = true; update(video); });
      for (const type of ['pointerleave','focusout']) card.addEventListener(type,() => { states.get(video).active = false; update(video); });
    }
    const sonido = video.parentElement.querySelector('[data-reel-sonido]');
    if (sonido) sonido.addEventListener('click',() => {
      const state = states.get(video);
      state.sound = !state.sound;
      video.muted = !state.sound;
      // Con reducir movimiento la pieza no arranca sola; pedir sonido es pedir verla.
      if (state.sound) state.explicit = true;
      sonido.setAttribute('aria-pressed',String(state.sound));
      update(video);
    });
    const button = video.parentElement.querySelector('[data-preview-toggle]');
    if (button) {
      const label = () => {
        button.textContent = video.paused ? 'Reproducir' : 'Pausar';
        button.setAttribute('aria-label',video.paused ? 'Reproducir vista previa' : 'Pausar vista previa');
        button.setAttribute('aria-pressed',String(!video.paused));
      };
      button.addEventListener('click',() => { const state = states.get(video); state.stopped = !video.paused; state.explicit = true; update(video); label(); });
      video.addEventListener('play',label); video.addEventListener('pause',label); label();
    }
  }
  document.addEventListener('visibilitychange',() => videos.forEach(update));
  reduced.addEventListener('change',() => videos.forEach(update));
})();
