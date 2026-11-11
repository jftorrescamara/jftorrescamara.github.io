(() => {
  document.documentElement.classList.add('fusion');
  document.querySelectorAll('.reel-bandas,.monitor .visor,.tr-vistas,.tr-mapa,.sh-num,#contacto .sh-meta,.tr-filtros sup').forEach(node => node.remove());
  const gallery = document.querySelector('.tr-lista');
  if (gallery) {
    gallery.className = 'fusion-gallery';
    gallery.querySelectorAll('li').forEach(item => {
      item.className = 'fusion-item';
      const link = item.querySelector('a');
      const photo = item.querySelector('img');
      const title = item.querySelector('.tr-titulo');
      const role = item.querySelector('.tr-rol');
      const category = item.querySelector('.tr-cat');
      if (!link || !photo || !title) return;
      const frame = document.createElement('div');
      frame.className = 'fusion-frame';
      photo.className = 'fusion-image';
      photo.sizes = item === gallery.lastElementChild ? '100vw' : '(max-width: 700px) 100vw, 50vw';
      // Las mismas portadas locales; la imagen es ahora el acceso al proyecto.
      frame.append(photo);
      const caption = document.createElement('div');
      caption.className = 'fusion-caption';
      const name = document.createElement('h3');
      name.textContent = title.textContent;
      const meta = document.createElement('p');
      meta.textContent = role?.textContent || category?.textContent || '';
      const arrow = document.createElement('span');
      arrow.className = 'fusion-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.textContent = '↗';
      caption.append(name,meta,arrow);
      link.className = 'fusion-card';
      link.replaceChildren(frame,caption);
    });
  }
  const playLabel = document.querySelector('.monitor-play > .label');
  if (playLabel) playLabel.textContent = 'Ver showreel';
  const story = document.querySelector('.p-caso');
  if (story) {
    const details = document.createElement('details');
    details.className = 'fusion-story wrap';
    const summary = document.createElement('summary');
    summary.textContent = 'Sobre el proyecto';
    story.classList.remove('wrap');
    story.replaceWith(details);
    details.append(summary,story);
  }
  const nextLabel = document.querySelector('.siguiente-txt > .label');
  if (nextLabel) nextLabel.textContent = 'Siguiente proyecto';
})();
