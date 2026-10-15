(function () {
  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  function saveSession(user) {
    try {
      localStorage.setItem(window.CONFIG.SESSION_KEY, JSON.stringify(user));
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(window.CONFIG.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearSession() {
    try {
      localStorage.removeItem(window.CONFIG.SESSION_KEY);
    } catch (e) {}
  }

  function apiPost(payload) {
    return fetch(window.CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return true; });
  }

  function apiGet(params) {
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    return fetch(window.CONFIG.API_URL + '?' + qs).then(function (r) { return r.json(); });
  }

  function inscrireClient(data) {
    return sha256(data.password).then(function (hash) {
      return apiPost({
        action: 'inscrire_client',
        email: data.email,
        password: hash,
        nom: data.nom,
        telephone: data.telephone
      });
    });
  }

  function inscrireVendeur(data) {
    return sha256(data.password).then(function (hash) {
      return apiPost({
        action: 'inscrire_vendeur',
        email: data.email,
        password: hash,
        nom: data.nom,
        telephone: data.telephone,
        boutique: data.boutique,
        categorie: data.categorie,
        zone: data.zone
      });
    });
  }

  function connexion(email, password) {
    return sha256(password).then(function (hash) {
      return apiGet({
        action: 'connexion',
        email: email,
        password: hash
      });
    });
  }

  function exigerConnexion(role) {
    var s = getSession();
    if (!s || (role && s.role !== role)) {
      location.href = 'connexion.html';
      return null;
    }
    return s;
  }

  window.SM_AUTH = {
    sha256: sha256,
    saveSession: saveSession,
    getSession: getSession,
    clearSession: clearSession,
    inscrireClient: inscrireClient,
    inscrireVendeur: inscrireVendeur,
    connexion: connexion,
    exigerConnexion: exigerConnexion,
    apiGet: apiGet,
    apiPost: apiPost
  };
})();