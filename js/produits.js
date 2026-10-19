(function () {
  function apiPost(payload) {
    return fetch(window.CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return true; });
  }

  function compresserImage(file, maxSize, quality) {
    maxSize = maxSize || 600;
    quality = quality || 0.65;
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

  function uploaderCloudinary(dataUrl) {
    var cloudName = window.CONFIG.CLOUDINARY_CLOUD_NAME;
    var preset = window.CONFIG.CLOUDINARY_PRESET;
    if (!cloudName || cloudName.indexOf('REMPLACE') !== -1) {
      return Promise.reject(new Error('Cloudinary non configure'));
    }
    var url = 'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';
    var formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', preset);
    return fetch(url, {
      method: 'POST',
      body: formData
    }).then(function (res) {
      if (!res.ok) throw new Error('Upload Cloudinary echoue');
      return res.json();
    }).then(function (json) {
      return json.secure_url || json.url;
    });
  }

  function ajouterProduit(data) {
    var s = window.SM_AUTH.getSession();
    if (!s) return Promise.reject(new Error('Non connecte'));

    var uploadPromise = data.photo.indexOf('data:') === 0
      ? uploaderCloudinary(data.photo)
      : Promise.resolve(data.photo);

    return uploadPromise.then(function (photoUrl) {
      return apiPost({
        action: 'ajouter_produit',
        email: s.email,
        nom: data.nom,
        prix: data.prix,
        categorie: data.categorie,
        description: data.description,
        photo: photoUrl
      });
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

  window.SM_PRODUITS = {
    ajouterProduit: ajouterProduit,
    supprimerProduit: supprimerProduit,
    mesProduits: mesProduits,
    tousProduits: tousProduits,
    produitsVendeur: produitsVendeur,
    compresserImage: compresserImage,
    uploaderCloudinary: uploaderCloudinary
  };
})();