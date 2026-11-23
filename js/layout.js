(function () {
  // Remplissez ces liens. Tant qu'ils sont vides, les liens correspondants
  // sont masques dans le pied de page.
  var CONTACT = {
    whatsapp: '',   // ex: 'https://wa.me/25779123456'
    facebook: '',   // ex: 'https://facebook.com/surprendmoi'
    instagram: ''   // ex: 'https://instagram.com/surprendmoi'
  };

  function anneeAuto() {
    var els = document.querySelectorAll('[data-annee]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = new Date().getFullYear();
    }
  }

  function appliquerContact() {
    var liens = document.querySelectorAll('[data-contact]');
    for (var i = 0; i < liens.length; i++) {
      var type = liens[i].getAttribute('data-contact');
      var url = CONTACT[type] || '';
      if (!url) {
        liens[i].style.display = 'none';
      } else {
        liens[i].href = url;
        liens[i].style.display = '';
      }
    }
  }

  function appliquerEtatSession() {
    var s = window.SM_AUTH ? window.SM_AUTH.getSession() : null;
    var zoneInvite = document.querySelectorAll('[data-si-invite]');
    var zoneConnecte = document.querySelectorAll('[data-si-connecte]');
    for (var i = 0; i < zoneInvite.length; i++) {
      zoneInvite[i].style.display = s ? 'none' : '';
    }
    for (var j = 0; j < zoneConnecte.length; j++) {
      zoneConnecte[j].style.display = s ? '' : 'none';
    }
    var lienBoutique = document.querySelectorAll('[data-lien-boutique]');
    if (s) {
      var url = s.role === 'vendeur' ? 'dashboard-vendeur.html'
              : (s.role === 'admin' ? 'dashboard-admin.html' : 'dashboard-client.html');
      for (var k = 0; k < lienBoutique.length; k++) {
        lienBoutique[k].href = url;
      }
    }
    var btnDeco = document.querySelectorAll('[data-deconnexion]');
    for (var m = 0; m < btnDeco.length; m++) {
      btnDeco[m].addEventListener('click', function (e) {
        e.preventDefault();
        if (window.SM_AUTH) window.SM_AUTH.clearSession();
        location.href = 'index.html';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    anneeAuto();
    appliquerContact();
    appliquerEtatSession();
  });

  window.SM_LAYOUT = { CONTACT: CONTACT };
})();