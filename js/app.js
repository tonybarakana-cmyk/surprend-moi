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

  function calculerTempsRestant(dateVente) {
    if (!dateVente) return null;
    var t = new Date(dateVente).getTime();
    if (isNaN(t)) return null;
    var limite = 48 * 60 * 60 * 1000;
    var reste = (t + limite) - new Date().getTime();
    if (reste <= 0) return { expire: true, texte: 'Expire' };
    var heures = Math.floor(reste / (60 * 60 * 1000));
    var minutes = Math.floor((reste % (60 * 60 * 1000)) / (60 * 1000));
    return { expire: false, texte: 'Expire dans ' + heures + 'h ' + minutes + 'min' };
  }

  function creerCarteProduit(p, options) {
    options = options || {};
    var div = document.createElement('div');
    div.className = 'produit';
    div.setAttribute('data-id', p.id || '');

    var telephone = String(p.telephone == null ? '' : p.telephone);
    var tel = telephone.replace(/[^0-9]/g, '');
    var msgWA = encodeURIComponent('Bonjour, je suis interesse par : ' + p.nom + ' (' + p.prix + ' FBu) - vu sur Surprend Moi');
    var lienWA = 'https://wa.me/' + tel + '?text=' + msgWA;
    var photoOptimisee = optimiserUrlCloudinary(p.photo, 400);
    var estVendu = p.statut === 'vendu';

    var badgeCat = !estVendu && p.categorie ? '<span class="badge-cat">' + escapeHtml(p.categorie) + '</span>' : '';
    var badgeVendu = estVendu ? '<span class="badge-vendu">VENDU</span>' : '';
    var iconCoeur = '<div class="badge-fav"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>';

    var html =
      '<div class="produit-media" style="cursor:pointer;" onclick="location.href=\'produit.html?id=' + escapeHtml(p.id) + '\'">' +
        '<img class="produit-img" src="' + escapeHtml(photoOptimisee) + '" alt="' + escapeHtml(p.nom) + '" loading="lazy" decoding="async">' +
        badgeCat + badgeVendu + iconCoeur +
      '</div>' +
      '<div class="produit-info">' +
        '<div class="produit-nom" style="cursor:pointer;" onclick="location.href=\'produit.html?id=' + escapeHtml(p.id) + '\'">' + escapeHtml(p.nom) + '</div>' +
        '<div class="produit-prix">' + formaterPrix(p.prix) + '</div>' +
        '<div class="produit-meta">' +
          '<span>' + escapeHtml(p.boutique || p.vendeur || '') + '</span>' +
          '<span>' + escapeHtml(p.zone || '') + '</span>' +
        '</div>' +
        '<a class="produit-voir" href="produit.html?id=' + escapeHtml(p.id) + '">Voir</a>';

    // DESIGN AMÉLIORÉ DES BOUTONS D'ACTION
    if (options.actions === 'disponible') {
      html += '<div class="produit-actions">' +
                '<button class="btn-action btn-marquer" data-id="' + escapeHtml(p.id) + '" style="display:flex; align-items:center; justify-content:center; gap:6px;">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>' +
                  'Marquer vendu' +
                '</button>' +
                '<button class="btn-action btn-supprimer" data-id="' + escapeHtml(p.id) + '" style="display:flex; align-items:center; justify-content:center; gap:6px;">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                  'Supprimer' +
                '</button>' +
              '</div>';
    } else if (options.actions === 'vendu') {
      var temps = calculerTempsRestant(p.dateVente);
      if (temps) {
        html += '<div class="compte-a-rebours" data-datevente="' + escapeHtml(p.dateVente || '') + '">' + temps.texte + '</div>';
      }
      html += '<div class="produit-actions">' +
                '<button class="btn-action btn-restaurer" data-id="' + escapeHtml(p.id) + '" style="display:flex; align-items:center; justify-content:center; gap:6px;">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>' +
                  'Restaurer' +
                '</button>' +
                '<button class="btn-action btn-supprimer" data-id="' + escapeHtml(p.id) + '" style="display:flex; align-items:center; justify-content:center; gap:6px;">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                  'Supprimer' +
                '</button>' +
              '</div>';
    } else if (options.supprimable) {
      html += '<button class="btn-supprimer" data-id="' + escapeHtml(p.id) + '">Supprimer</button>';
    }

    html += '</div>';
    div.innerHTML = html;

    return div;
  }

  window.SM_APP = {
    qs: qs,
    escapeHtml: escapeHtml,
    formaterPrix: formaterPrix,
    creerCarteProduit: creerCarteProduit,
    optimiserUrlCloudinary: optimiserUrlCloudinary,
    calculerTempsRestant: calculerTempsRestant
  };
})();