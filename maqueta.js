(() => {
  clearTimeout(window.aidaNameBootTimer);
  const root = document.documentElement;
  root.classList.remove('entrada');
  root.classList.add('entrada-fin');
  const remove = '[data-entrada],.hud-rec,.hud-tc,.hud-escena,.hero-top,.hero-frase,.reel-intro,.reel-nota,.tr-año,#trabajos .sh-meta,.tr-lema,#contacto .cta,#contacto .creditos,#contacto .fin,.proyecto .p-visor,.proyecto [aria-labelledby="t-rodaje"],.proyecto [aria-labelledby="t-resultado"]';
  document.querySelectorAll(remove).forEach(element => element.remove());
  document.title = 'Maqueta · ' + document.title;
  const footer = document.querySelector('#contacto .pie > span');
  if (footer) footer.textContent = footer.textContent.split(' · Rodado')[0];
  // Conservamos los datos profesionales de la claqueta en una ficha editorial.
  const slate = document.querySelector('.p-intro-claqueta');
  if (slate) {
    const fields = Array.from(slate.querySelectorAll('.cq--linea')).map(row => ({
      label:row.querySelector('dt')?.textContent.trim(),
      value:row.querySelector('dd')?.textContent.trim()
    })).filter(field => field.label && field.value && field.label.toLowerCase() !== 'año');
    const sheet = document.createElement('section');
    sheet.className = 'p-ficha';
    sheet.setAttribute('aria-label','Ficha técnica');
    const heading = document.createElement('h2');
    heading.className = 'label';
    heading.textContent = 'Ficha técnica';
    const list = document.createElement('dl');
    for (const field of fields) {
      const row = document.createElement('div');
      const label = document.createElement('dt');
      const value = document.createElement('dd');
      label.textContent = field.label;
      value.textContent = field.value;
      row.append(label,value);
      list.append(row);
    }
    sheet.append(heading,list);
    slate.replaceWith(sheet);
  }
  // Retirar fechas de portada, siguiente proyecto, pie y título del reproductor.
  document.querySelectorAll('.p-portada-txt > .label,.siguiente-txt > .label,.p-pie > span').forEach(element => {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/\s*[·•]\s*(?:19|20)\d{2}\b/g,'').replace(/©\s*(?:19|20)\d{2}\s*/g,'© ');
    }
  });
  document.querySelectorAll('.proyecto [data-video-title]').forEach(element => {
    element.dataset.videoTitle = element.dataset.videoTitle.replace(/\s*\((?:19|20)\d{2}\)/g,'');
  });
  const svg = (content) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  const phone = svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9 10.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" transform="translate(-1 -1) scale(.95)"/>');
  const instagram = svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>');
  const vimeo = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 7c-.1 4-5.6 11.5-9.8 14-2.2 1.3-3.8-.2-4.8-3.5L4.8 9C4 6.7 3.7 7.7 2 8.5L.7 6.8C3.3 4.5 6 2.4 7.6 3.6c1.6 1.1 1.5 4.3 2.5 8.2.8 3.4 1.3 4.4 2.1 4.4.7 0 2.4-2.5 3.4-4.4 1.1-2.2.3-3.2-2-2.3 1-4.3 3.2-6.4 6-5.7C21.5 4.2 22.1 5.3 22 7z"/></svg>';
  const contact = document.querySelector('#contacto .correo');
  if (contact) contact.insertAdjacentHTML('afterend', `<a class="mock-phone" href="tel:+34672331199" aria-label="Llamar al 672 331 199">${phone}<span>+34 672 331 199</span></a>`);
  document.querySelectorAll('#contacto .redes a').forEach(link => {
    const name = link.textContent.trim();
    link.setAttribute('aria-label',name);
    link.setAttribute('title',name);
    if (name === 'Instagram') link.innerHTML = instagram;
    if (name === 'Vimeo') link.innerHTML = vimeo;
  });

  document.body.insertAdjacentHTML('beforeend', `
    <nav class="mock-tools" aria-label="Navegación de la maqueta">
      <span>MAQUETA</span><button type="button" data-name-replay>Repetir entrada</button>
      <button type="button" data-mock-section="inicio">Inicio</button>
      <button type="button" data-mock-section="showreel">Showreel</button>
      <button type="button" data-mock-section="trabajos">Trabajos</button>
      <button type="button" data-mock-section="contacto">Contacto</button>
    </nav>`);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heading = document.querySelector('.hero-nombre');
  if (!heading) document.querySelector('[data-name-replay]').remove();
  let holdTimer, endTimer, fallbackTimer, run = 0;
  const finish = () => {
    ++run;
    clearTimeout(holdTimer);
    clearTimeout(endTimer);
    clearTimeout(fallbackTimer);
    root.classList.add('name-skip');
    root.classList.remove('name-intro', 'name-settling');
    heading?.style.removeProperty('--name-start-y');
    removeEventListener('wheel', finish, true);
    removeEventListener('touchmove', finish, true);
    removeEventListener('keydown', onKey, true);
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', finish);
    document.removeEventListener('visibilitychange', onVisibility);
  };
  const onKey = (event) => {
    if (['Escape','Tab','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) finish();
  };
  const onScroll = () => { if (scrollY > 1) finish(); };
  const onVisibility = () => { if (document.hidden) finish(); };
  const start = async () => {
    finish();
    if (!heading || reduced.matches) return;
    const thisRun = run;
    scrollTo({top:0, behavior:'instant'});
    root.classList.remove('name-skip');
    root.classList.add('name-intro');
    addEventListener('wheel', finish, {passive:true, capture:true});
    addEventListener('touchmove', finish, {passive:true, capture:true});
    addEventListener('keydown', onKey, true);
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', finish);
    document.addEventListener('visibilitychange', onVisibility);
    fallbackTimer = setTimeout(finish,6000);
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve,1500))]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (thisRun !== run) return;
      const box = heading.getBoundingClientRect();
      heading.style.setProperty('--name-start-y', (innerHeight / 2 - box.top - box.height / 2) + 'px');
      holdTimer = setTimeout(() => {
        if (thisRun !== run) return;
        root.classList.add('name-settling');
        endTimer = setTimeout(finish,650);
      },1000);
    }));
  };
  document.querySelector('[data-name-replay]')?.addEventListener('click',start);
  document.querySelectorAll('[data-mock-section]').forEach(button => button.addEventListener('click',() => {
    finish();
    const section = document.getElementById(button.dataset.mockSection);
    if (section) section.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
    else location.assign('/#' + button.dataset.mockSection);
  }));
  reduced.addEventListener('change',finish);
  if (!location.hash && scrollY < 2) start();
  else finish();
})();
