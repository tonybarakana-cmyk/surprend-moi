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
    var transformation = 'w_' + (largeur || 300) + ',q_auto,f_auto';
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
    var photoOptimisee = optimiserUrlCloudinary(p.photo, 300);
    var estVendu = p.statut === 'vendu';

    var badge = estVendu ? '<span class="badge-vendu">VENDU</span>' : '';

    var html =
      '<div class="produit-media">' +
        '<img class="produit-img" src="' + escapeHtml(photoOptimisee) + '" alt="' + escapeHtml(p.nom) + '" loading="lazy" decoding="async">' +
        badge +
        '<a class="produit-discuter" href="' + lienWA + '" target="_blank" rel="noopener" data-produit="' + escapeHtml(p.nom) + '">Discuter</a>' +
      '</div>' +
      '<div class="produit-info">' +
        '<div class="produit-nom">' + escapeHtml(p.nom) + '</div>' +
        '<div class="produit-prix">' + formaterPrix(p.prix) + '</div>' +
        '<div class="produit-vendeur">' + escapeHtml(p.zone || '') + ' - ' + escapeHtml(p.boutique || p.vendeur || '') + '</div>';

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