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

    var photoOptimisee = optimiserUrlCloudinary(p.photo, 400);
    var estVendu = p.statut === 'vendu';

    var badgeCat = !estVendu && p.categorie ? '<span class="badge-cat">' + escapeHtml(p.categorie) + '</span>' : '';
    var badgeVendu = estVendu ? '<span class="badge-vendu">VENDU</span>' : '';
    var iconCoeur = '<div class="badge-fav"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>';

    // Le clic sur l'image ouvre la page produit
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
        // Petit bouton discret "Voir"
        '<a class="produit-voir" href="produit.html?id=' + escapeHtml(p.id) + '">Voir</a>';

    if (options.actions === 'disponible') {
      html += '<div class="produit-actions">' +
                '<button class="btn-action btn-marquer" data-id="' + escapeHtml(p.id) + '">Marquer vendu</button>' +
                '<button class="btn-action btn-supprimer" data-id="' + escapeHtml(p.id) + '">Supprimer</button>' +
              '</div>';
    } else if (options.actions === 'vendu') {
      var temps = calculerTempsRestant(p.dateVente);
      if (temps) {
        html += '<div class="compte-a-rebours" data-datevente="' + escapeHtml(p.dateVente || '') + '">' + temps.texte + '</div>';
      }
      html += '<div class="produit-actions">' +
                '<button class="btn-action btn-restaurer" data-id="' + escapeHtml(p.id) + '">Restaurer</button>' +
                '<button class="btn-action btn-supprimer" data-id="' + escapeHtml(p.id) + '">Supprimer</button>' +
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