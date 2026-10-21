/* Sustituye solo la presentación de moneda/escudo. Conserva textContent
   para los mensajes, los nombres de compra y las funciones de compartir.
   También cubre los textos que el juego vuelve a pintar con textContent. */
(() => {
  const skip = 'script,style,textarea,input,select,option,canvas,svg,[contenteditable],.game-icon';
  const pattern = /🪙\uFE0F?|🛡\uFE0F?/gu;

  function decorate(node) {
    if (!node.isConnected || !node.parentElement || node.parentElement.closest(skip)) return;
    const value = node.nodeValue;
    if (!value.includes('🪙') && !value.includes('🛡')) return;
    const fragment = document.createDocumentFragment();
    let last = 0;
    for (const match of value.matchAll(pattern)) {
      fragment.append(document.createTextNode(value.slice(last, match.index)));
      const coin = match[0].startsWith('🪙');
      const icon = document.createElement('span');
      icon.className = 'game-icon game-icon-' + (coin ? 'coin' : 'shield');
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', coin ? 'Monedas' : 'Escudo');
      const original = document.createElement('span');
      original.hidden = true;
      original.textContent = match[0];
      icon.append(original);
      fragment.append(icon);
      last = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(value.slice(last)));
    node.replaceWith(fragment);
  }

  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) return decorate(root);
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(skip)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(decorate);
  }

  scan(document.body);
  new MutationObserver(records => {
    const roots = new Set();
    for (const record of records) {
      if (record.type === 'characterData') roots.add(record.target);
      else record.addedNodes.forEach(node => roots.add(node));
    }
    roots.forEach(scan);
  }).observe(document.body, {childList: true, subtree: true, characterData: true});
})();
