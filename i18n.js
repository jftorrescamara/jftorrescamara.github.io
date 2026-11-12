/* Traduce la maqueta a partir de idiomas.json, cuyas claves son el texto en español.
   Funciona igual en la portada y en las fichas: recorre los nodos de texto y los
   atributos de ATRIBUTOS, y guarda el original para poder volver al español. */
(() => {
 const ATRIBUTOS = ['aria-label','title','alt','placeholder'];
 const POR_DEFECTO = 'es';
 const CLAVE = 'maqueta-idioma';
 const originales = new WeakMap();   // nodo → texto en español
 const atrOriginales = new WeakMap(); // elemento → { atributo: valor en español }
 let diccionarios = {}, idiomas = [['es','Español']], actual = POR_DEFECTO, observador = null, tituloOriginal = '';

 const guardado = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
 const guardar = valor => { try { localStorage.setItem(CLAVE, valor); } catch { /* modo privado */ } };

 const traducir = (texto, dicc) => {
  if (!dicc) return texto;
  if (Object.hasOwn(dicc, texto)) return dicc[texto];
  // «Próximamente: clips.» y similares: la parte fija se traduce y el resto se respeta.
  const dosPuntos = texto.indexOf(':');
  if (dosPuntos > 0) {
   const cabeza = texto.slice(0, dosPuntos);
   if (Object.hasOwn(dicc, cabeza)) return dicc[cabeza] + texto.slice(dosPuntos);
  }
  return texto;
 };

 const nodosDeTexto = raiz => {
  const saltar = new Set(['SCRIPT','STYLE','NOSCRIPT']);
  const andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
   // El rótulo giratorio se trata aparte: sus celdas las reescribe su propia animación.
   acceptNode: nodo => saltar.has(nodo.parentNode?.nodeName) || !nodo.nodeValue.trim()
    || nodo.parentElement?.closest('[data-flap]')
    ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const lista = []; let nodo;
  while ((nodo = andador.nextNode())) lista.push(nodo);
  return lista;
 };

 /* Rótulo giratorio de la portada. Su script captura las palabras al arrancar y reescribe
    las celdas cada 3 s, así que aquí se cambia letra a letra: cuando una celda muestra la
    letra española que le toca, se sustituye por la del idioma activo. Las celdas
    sobrantes de una traducción corta conservan su letra para volver al español. */
 const palabraFlap = new WeakMap();
 const ajustarFlap = (flap, dicc, diccAnterior) => {
  if (!palabraFlap.has(flap)) {
   const palabras = JSON.parse(flap.dataset.flap || '[]');
   palabraFlap.set(flap, palabras.find(palabra => palabra.trim()) || '');
  }
  const original = palabraFlap.get(flap);
  if (!original) return;
  const destino = traducir(original, dicc);
  const anterior = traducir(original, diccAnterior);
  flap.querySelectorAll('.flap-ch').forEach((celda, i) => {
   const letra = celda.textContent;
   if (destino[i] && letra !== destino[i] && (letra === original[i] || letra === anterior[i])) celda.textContent = destino[i];
  });
 };
 const ajustarFlaps = (raiz, dicc, diccAnterior) => {
  const propio = raiz.nodeType === Node.ELEMENT_NODE ? raiz.closest?.('[data-flap]') : null;
  if (propio) return ajustarFlap(propio, dicc, diccAnterior);
  raiz.querySelectorAll?.('[data-flap]').forEach(flap => ajustarFlap(flap, dicc, diccAnterior));
 };

 const aplicarA = (raiz, dicc) => {
  for (const nodo of nodosDeTexto(raiz)) {
   if (!originales.has(nodo)) originales.set(nodo, nodo.nodeValue);
   const original = originales.get(nodo);
   const [, sangria, cuerpo, cola] = original.match(/^(\s*)([\s\S]*?)(\s*)$/);
   const traducido = traducir(cuerpo, dicc);
   const valor = sangria + traducido + cola;
   if (nodo.nodeValue !== valor) nodo.nodeValue = valor;
  }
  const elementos = raiz.nodeType === Node.ELEMENT_NODE ? [raiz, ...raiz.querySelectorAll('*')] : [...raiz.querySelectorAll('*')];
  for (const el of elementos) {
   for (const atributo of ATRIBUTOS) {
    if (!el.hasAttribute(atributo)) continue;
    let previos = atrOriginales.get(el);
    if (!previos) atrOriginales.set(el, previos = {});
    if (!(atributo in previos)) previos[atributo] = el.getAttribute(atributo);
    const valor = traducir(previos[atributo], dicc);
    if (el.getAttribute(atributo) !== valor) el.setAttribute(atributo, valor);
   }
  }
 };

 const aplicar = idioma => {
  actual = idioma;
  const dicc = diccionarios[idioma] || null;
  observador?.disconnect();
  const diccAnterior = diccionarios[document.documentElement.lang];
  document.documentElement.lang = idioma;
  aplicarA(document.body, dicc);
  ajustarFlaps(document.body, dicc, diccAnterior);
  // El título de la pestaña vive fuera de body: se traduce tramo a tramo («Maqueta 02 · …»).
  if (!tituloOriginal) tituloOriginal = document.title;
  document.title = tituloOriginal.split(' · ').map(tramo => traducir(tramo, dicc)).join(' · ');
  const etiqueta = traducir('Idioma', dicc);
  const grupo = document.querySelector('.i18n');
  if (grupo) {
   grupo.setAttribute('aria-label', etiqueta);
   grupo.querySelectorAll('[data-lang]').forEach(boton => {
    boton.setAttribute('aria-pressed', String(boton.dataset.lang === idioma));
   });
  }
  observador?.observe(document.body, { childList: true, subtree: true, characterData: true });
 };

 const montarSelector = () => {
  if (document.querySelector('.i18n')) return;
  // En la portada entra como un eslabón más de la barra, en la misma fila que los
  // enlaces; el <nav> es display:block y colgaría de una segunda línea.
  const lista = document.querySelector('.nav-links');
  const destino = lista || document.querySelector('.rp-nav nav, .real-nav nav');
  if (!destino) return;
  const grupo = document.createElement('div');
  grupo.className = 'i18n';
  grupo.setAttribute('role', 'group');
  grupo.setAttribute('aria-label', 'Idioma');
  grupo.innerHTML = idiomas.map(([codigo, nombre]) =>
   `<button type="button" data-lang="${codigo}" lang="${codigo}" title="${nombre}" aria-pressed="${codigo === actual}">${codigo.toUpperCase()}</button>`
  ).join('');
  grupo.addEventListener('click', evento => {
   const boton = evento.target.closest('[data-lang]');
   if (!boton || boton.dataset.lang === actual) return;
   guardar(boton.dataset.lang);
   aplicar(boton.dataset.lang);
  });
  if (lista) {
   const eslabon = document.createElement('li');
   eslabon.className = 'i18n-li';
   eslabon.append(grupo);
   lista.append(eslabon);
  } else {
   destino.append(grupo);
  }
 };

 const elegido = () => {
  const pedido = guardado();
  if (pedido && idiomas.some(([codigo]) => codigo === pedido)) return pedido;
  for (const preferido of navigator.languages || []) {
   const corto = preferido.slice(0, 2).toLowerCase();
   if (idiomas.some(([codigo]) => codigo === corto)) return corto;
  }
  return POR_DEFECTO;
 };

 const arrancar = async () => {
  try {
   const datos = await fetch('/idiomas.json?v=3f143f5af2-fr').then(r => r.json());
   idiomas = datos.idiomas || idiomas;
   diccionarios = Object.fromEntries(idiomas.map(([codigo]) => [codigo, datos[codigo] || null]));
  } catch {
   return; // Sin diccionario la maqueta se queda en español.
  }
  // El observador reaplica el idioma sobre lo que pintan contenido-real.js y sala.js.
  observador = new MutationObserver(mutaciones => {
   const dicc = diccionarios[actual] || null;
   if (actual === POR_DEFECTO && !dicc) return;
   observador.disconnect();
   for (const mutacion of mutaciones) {
    if (mutacion.type === 'characterData') {
     const padre = mutacion.target.parentElement;
     if (padre?.closest('[data-flap]')) ajustarFlaps(padre, dicc);
     else aplicarA(mutacion.target.parentNode || document.body, dicc);
    } else mutacion.addedNodes.forEach(nodo => {
     if (nodo.nodeType === Node.ELEMENT_NODE || nodo.nodeType === Node.TEXT_NODE) {
      const raiz = nodo.nodeType === Node.TEXT_NODE ? nodo.parentNode || document.body : nodo;
      aplicarA(raiz, dicc);
      ajustarFlaps(raiz, dicc);
     }
    });
   }
   observador.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  actual = elegido();
  montarSelector();
  aplicar(actual);
 };

 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar, { once: true });
 else arrancar();
})();
