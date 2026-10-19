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

  function creerCarteProduit(p, options) {
    options = options || {};
    var div = document.createElement('div');
    div.className = 'produit';

    var telephone = String(p.telephone == null ? '' : p.telephone);
    var tel = telephone.replace(/[^0-9]/g, '');

    var msgWA = encodeURIComponent(
      'Bonjour, je suis interesse par : ' + p.nom + ' (' + p.prix + ' FBu) - vu sur Surprend Moi'
    );
    var lienWA = 'https://wa.me/' + tel + '?text=' + msgWA;
    var photoOptimisee = optimiserUrlCloudinary(p.photo, 300);

    var html =
      '<div class="produit-media">' +
        '<img class="produit-img" src="' + escapeHtml(photoOptimisee) + '" alt="' + escapeHtml(p.nom) + '" loading="lazy" decoding="async">' +
        '<a class="produit-discuter" href="' + lienWA + '" target="_blank" rel="noopener" data-produit="' + escapeHtml(p.nom) + '">Discuter</a>' +
      '</div>' +
      '<div class="produit-info">' +
        '<div class="produit-nom">' + escapeHtml(p.nom) + '</div>' +
        '<div class="produit-prix">' + formaterPrix(p.prix) + '</div>' +
        '<div class="produit-vendeur">' + escapeHtml(p.zone || '') + ' - ' + escapeHtml(p.boutique || p.vendeur || '') + '</div>';

    if (options.supprimable) {
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
    optimiserUrlCloudinary: optimiserUrlCloudinary
  };
})();