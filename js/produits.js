(function () {
  function apiPost(payload) {
    return fetch(window.CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return true; });
  }

  function ajouterProduit(data) {
    var s = window.SM_AUTH.getSession();
    if (!s) return Promise.reject(new Error('Non connecte'));
    return apiPost({
      action: 'ajouter_produit',
      email: s.email,
      nom: data.nom,
      prix: data.prix,
      categorie: data.categorie,
      description: data.description,
      photo: data.photo
    });
  }

  function supprimerProduit(id) {
    var s = window.SM_AUTH.getSession();
    if (!s) return Promise.reject(new Error('Non connecte'));
    return apiPost({
      action: 'supprimer_produit',
      email: s.email,
      id: id
    });
  }

  function mesProduits() {
    var s = window.SM_AUTH.getSession();
    if (!s) return Promise.resolve([]);
    return window.SM_AUTH.apiGet({
      action: 'mes_produits',
      email: s.email
    }).then(function (r) { return r.produits || []; });
  }

  function tousProduits() {
    return window.SM_AUTH.apiGet({ action: 'tous_produits' })
      .then(function (r) { return r.produits || []; });
  }

  function produitsVendeur(email) {
    return window.SM_AUTH.apiGet({ action: 'produits_vendeur', email: email })
      .then(function (r) { return r.produits || []; });
  }

  function compresserImage(file, maxSize, quality) {
    maxSize = maxSize || 800;
    quality = quality || 0.75;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var w = img.width;
          var h = img.height;
          if (w > h && w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; }
          else if (h > w && h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; }
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.SM_PRODUITS = {
    ajouterProduit: ajouterProduit,
    supprimerProduit: supprimerProduit,
    mesProduits: mesProduits,
    tousProduits: tousProduits,
    produitsVendeur: produitsVendeur,
    compresserImage: compresserImage
  };
})();