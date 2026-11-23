(function () {
  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  var SESSION_DUREE = 30 * 24 * 60 * 60 * 1000; // 30 jours

  function saveSession(user) {
    try {
      var data = { user: user, expire: Date.now() + SESSION_DUREE };
      localStorage.setItem(window.CONFIG.SESSION_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(window.CONFIG.SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      // Ancien format (objet user direct) : migration
      if (!data.expire && data.email) {
        saveSession(data);
        return data;
      }
      if (!data.expire || !data.user) return null;
      if (Date.now() > data.expire) {
        clearSession();
        return null;
      }
      return data.user;
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

  function normaliserTelephone(tel) {
    var t = String(tel == null ? '' : tel).replace(/[^0-9]/g, '');
    if (t.length === 8 && t.charAt(0) === '7') t = '257' + t;
    else if (t.length === 9 && t.charAt(0) === '0') t = '257' + t.substring(1);
    return t;
  }

  function inscrireClient(data) {
    return sha256(data.password).then(function (hash) {
      return apiPost({
        action: 'inscrire_client',
        email: data.email,
        password: hash,
        nom: data.nom,
        telephone: normaliserTelephone(data.telephone)
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
        telephone: normaliserTelephone(data.telephone),
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
    if (!s) {
      location.href = 'connexion.html';
      return null;
    }
    if (role && s.role !== role) {
      if (s.role === 'admin') location.href = 'dashboard-admin.html';
      else if (s.role === 'vendeur') location.href = 'dashboard-vendeur.html';
      else location.href = 'dashboard-client.html';
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
    apiPost: apiPost,
    normaliserTelephone: normaliserTelephone
  };
})();