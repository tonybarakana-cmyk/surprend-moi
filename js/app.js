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

    var msgWA = encodeURIComponent(
      'Bonjour, je suis interesse par : ' + p.nom + ' (' + p.prix + ' FBu) - vu sur Surprend Moi'
    );
    var lienWA = 'https://wa.me/' + tel + '?text=' + msgWA;
    var photoOptimisee = optimiserUrlCloudinary(p.photo, 400);
    var estVendu = p.statut === 'vendu';

    var badgeCat = !estVendu && p.categorie ? '<span class="badge-cat">' + escapeHtml(p.categorie) + '</span>' : '';
    var badgeVendu = estVendu ? '<span class="badge-vendu">VENDU</span>' : '';
    var iconCoeur = '<div class="badge-fav"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>';

    var html =
      '<div class="produit-media">' +
        '<img class="produit-img" src="' + escapeHtml(photoOptimisee) + '" alt="' + escapeHtml(p.nom) + '" loading="lazy" decoding="async">' +
        badgeCat + badgeVendu + iconCoeur +
      '</div>' +
      '<div class="produit-info">' +
        '<div class="produit-nom">' + escapeHtml(p.nom) + '</div>' +
        '<div class="produit-prix">' + formaterPrix(p.prix) + '</div>' +
        '<div class="produit-meta">' +
          '<span>' + escapeHtml(p.boutique || p.vendeur || '') + '</span>' +
          '<span>' + escapeHtml(p.zone || '') + '</span>' +
        '</div>' +
        '<a class="produit-discuter" href="' + lienWA + '" target="_blank" rel="noopener" data-produit="' + escapeHtml(p.nom) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>' +
          'Discuter' +
        '</a>';

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

    var lien = div.querySelector('.produit-discuter');
    if (lien) {
      lien.addEventListener('click', function () {
        if (window.track) {
          window.track('negociation', {
            produit: p.nom,
            vendeur: p.boutique || p.vendeur || '',
            prix: p.prix
          });
        }
      });
    }

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