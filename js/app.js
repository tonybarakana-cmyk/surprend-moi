(function () {
  function qs(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text == null ? '' : String(text);
    return d.innerHTML;
  }

  function formaterPrix(n) {
    return Number(n).toLocaleString('fr-FR') + ' FBu';
  }

  function optimiserUrlCloudinary(url, largeur) {
    if (!url) return url;
    if (url.indexOf('res.cloudinary.com') === -1) return url;
    if (url.indexOf('/upload/') === -1) return url;
    var transformation = 'w_' + (largeur || 400) + ',q_auto,f_auto';
    return url.replace('/upload/', '/upload/' + transformation + '/');
  }

  // Créer la carte produit (utilisée sur l'accueil et le catalogue)
  function creerCarteProduit(p) {
    var div = document.createElement('div');
    div.className = 'produit';

    var photo = optimiserUrlCloudinary(p.photo, 400);
    
    div.innerHTML = `
      <div class="produit-media" style="cursor:pointer;" onclick="location.href='produit.html?id=${escapeHtml(p.id)}'">
        <img class="produit-img" src="${escapeHtml(photo)}" alt="${escapeHtml(p.nom)}" loading="lazy">
        ${p.categorie ? `<span class="badge-cat">${escapeHtml(p.categorie)}</span>` : ''}
        <div class="badge-fav">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
      </div>
      <div class="produit-info">
        <div class="produit-nom" style="cursor:pointer;" onclick="location.href='produit.html?id=${escapeHtml(p.id)}'">${escapeHtml(p.nom)}</div>
        <div class="produit-prix">${formaterPrix(p.prix)}</div>
        <div class="produit-meta">
          <span>${escapeHtml(p.boutique || p.vendeur || '')}</span>
          <span>${escapeHtml(p.zone || '')}</span>
        </div>
        <a class="produit-discuter" href="produit.html?id=${escapeHtml(p.id)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          Voir le produit
        </a>
      </div>
    `;
    return div;
  }

  window.SM_APP = {
    qs: qs,
    escapeHtml: escapeHtml,
    formaterPrix: formaterPrix,
    optimiserUrlCloudinary: optimiserUrlCloudinary,
    creerCarteProduit: creerCarteProduit
  };
})();