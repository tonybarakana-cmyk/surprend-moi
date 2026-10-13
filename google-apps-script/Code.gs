var SHEET_ID = '1VpZUuuQJR3CbLlbntgRd5hL7f73JrvHUOKxYcvu-lOE';
var ADMIN_EMAIL = 'admin@surprendmoi.bi';

var ONGLETS = {
  clients: 'Clients',
  vendeurs: 'Vendeurs',
  produits: 'Produits',
  visites: 'Visites',
  negociations: 'Negociations',
  tentatives: 'TentativesVendeur'
};

function doGet(e) {
  var action = e.parameter.action;

  if (action === 'connexion') {
    return jsonResponse(connexion(e.parameter.email, e.parameter.password));
  }
  if (action === 'mes_produits') {
    return jsonResponse({ produits: mesProduits(e.parameter.email) });
  }
  if (action === 'tous_produits') {
    return jsonResponse({ produits: tousProduits() });
  }
  if (action === 'produits_vendeur') {
    return jsonResponse({ produits: produitsVendeur(e.parameter.email) });
  }
  if (action === 'admin_stats') {
    return jsonResponse(adminStats(e.parameter.email));
  }

  return jsonResponse({ ok: true });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'inscrire_client') return jsonResponse(inscrireClient(body));
    if (action === 'inscrire_vendeur') return jsonResponse(inscrireVendeur(body));
    if (action === 'ajouter_produit') return jsonResponse(ajouterProduit(body));
    if (action === 'supprimer_produit') return jsonResponse(supprimerProduit(body));
    if (action === 'visite') { ajouterVisite(body.page, body.pseudo); return jsonResponse({ ok: true }); }
    if (action === 'negociation') {
      var d = body.data || {};
      ajouterNegociation(d.produit, d.vendeur, d.prix);
      return jsonResponse({ ok: true });
    }
    if (action === 'vendeur_tentative') { ajouterTentative(body); return jsonResponse({ ok: true }); }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(nom) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(nom);
  if (!sh) {
    sh = ss.insertSheet(nom);
    sh.appendRow(enTetes(nom));
  }
  return sh;
}

function enTetes(nom) {
  if (nom === ONGLETS.clients) return ['Date', 'Nom', 'Email', 'Telephone', 'PasswordHash'];
  if (nom === ONGLETS.vendeurs) return ['Date', 'Nom', 'Boutique', 'Email', 'Telephone', 'Categorie', 'Zone', 'PasswordHash', 'Statut'];
  if (nom === ONGLETS.produits) return ['Date', 'ID', 'EmailVendeur', 'Boutique', 'Telephone', 'Nom', 'Prix', 'Categorie', 'Description', 'Photo'];
  if (nom === ONGLETS.visites) return ['Date', 'Page', 'Pseudo'];
  if (nom === ONGLETS.negociations) return ['Date', 'Produit', 'Vendeur', 'Prix'];
  if (nom === ONGLETS.tentatives) return ['Date', 'Nom', 'WhatsApp', 'Message'];
  return [];
}

function initialiserOnglets() {
  for (var k in ONGLETS) getSheet(ONGLETS[k]);
}

function inscrireClient(body) {
  var sh = getSheet(ONGLETS.clients);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][2]).toLowerCase() === String(body.email).toLowerCase()) {
      return { error: 'Email deja utilise' };
    }
  }
  sh.appendRow([new Date(), body.nom || '', body.email || '', body.telephone || '', body.password || '']);
  return { ok: true };
}

function inscrireVendeur(body) {
  var sh = getSheet(ONGLETS.vendeurs);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][3]).toLowerCase() === String(body.email).toLowerCase()) {
      return { error: 'Email deja utilise' };
    }
  }
  sh.appendRow([new Date(), body.nom || '', body.boutique || '', body.email || '', body.telephone || '', body.categorie || '', body.zone || '', body.password || '', 'actif']);
  return { ok: true };
}

function connexion(email, password) {
  email = String(email || '').toLowerCase();
  password = String(password || '');

  if (email === ADMIN_EMAIL) {
    var shAdmin = getSheet('Admin');
    var dataAdmin = shAdmin.getDataRange().getValues();
    if (dataAdmin.length < 2) {
      shAdmin.appendRow([new Date(), ADMIN_EMAIL, 'admin1234', 'Administrateur']);
      dataAdmin = shAdmin.getDataRange().getValues();
    }
    if (String(dataAdmin[1][2]) === password) {
      return { user: { email: ADMIN_EMAIL, nom: 'Administrateur', role: 'admin' } };
    }
    return { error: 'Mot de passe incorrect' };
  }

  var shV = getSheet(ONGLETS.vendeurs);
  var dv = shV.getDataRange().getValues();
  for (var i = 1; i < dv.length; i++) {
    if (String(dv[i][3]).toLowerCase() === email && String(dv[i][7]) === password) {
      return { user: {
        email: dv[i][3],
        nom: dv[i][1],
        boutique: dv[i][2],
        telephone: dv[i][4],
        categorie: dv[i][5],
        zone: dv[i][6],
        role: 'vendeur'
      }};
    }
  }

  var shC = getSheet(ONGLETS.clients);
  var dc = shC.getDataRange().getValues();
  for (var j = 1; j < dc.length; j++) {
    if (String(dc[j][2]).toLowerCase() === email && String(dc[j][4]) === password) {
      return { user: {
        email: dc[j][2],
        nom: dc[j][1],
        telephone: dc[j][3],
        role: 'client'
      }};
    }
  }

  return { error: 'Email ou mot de passe incorrect' };
}

function ajouterProduit(body) {
  var shV = getSheet(ONGLETS.vendeurs);
  var dv = shV.getDataRange().getValues();
  var vendeur = null;
  for (var i = 1; i < dv.length; i++) {
    if (String(dv[i][3]).toLowerCase() === String(body.email).toLowerCase()) {
      vendeur = dv[i];
      break;
    }
  }
  if (!vendeur) return { error: 'Vendeur introuvable' };

  var sh = getSheet(ONGLETS.produits);
  var id = 'P' + Date.now();
  sh.appendRow([
    new Date(),
    id,
    vendeur[3],
    vendeur[2],
    vendeur[4],
    body.nom || '',
    body.prix || 0,
    body.categorie || '',
    body.description || '',
    body.photo || ''
  ]);
  return { ok: true, id: id };
}

function supprimerProduit(body) {
  var sh = getSheet(ONGLETS.produits);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(body.id) &&
        String(data[i][2]).toLowerCase() === String(body.email).toLowerCase()) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'Produit introuvable' };
}

function mesProduits(email) {
  var sh = getSheet(ONGLETS.produits);
  var data = sh.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][2]).toLowerCase() === String(email).toLowerCase()) {
      result.push(ligneProduit(data[i]));
    }
  }
  return result.reverse();
}

function tousProduits() {
  var sh = getSheet(ONGLETS.produits);
  var data = sh.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push(ligneProduit(data[i]));
  }
  return result.reverse();
}

function produitsVendeur(email) {
  return mesProduits(email);
}

function ligneProduit(row) {
  return {
    id: row[1],
    vendeur: row[3],
    boutique: row[3],
    telephone: row[4],
    nom: row[5],
    prix: row[6],
    categorie: row[7],
    description: row[8],
    photo: row[9],
    date: formaterDate(row[0])
  };
}

function ajouterVisite(page, pseudo) {
  var sh = getSheet(ONGLETS.visites);
  sh.appendRow([new Date(), page || '', pseudo || '']);
}

function ajouterNegociation(produit, vendeur, prix) {
  var sh = getSheet(ONGLETS.negociations);
  sh.appendRow([new Date(), produit || '', vendeur || '', prix || '']);
}

function ajouterTentative(body) {
  var sh = getSheet(ONGLETS.tentatives);
  sh.appendRow([new Date(), body.nom || '', body.whatsapp || '', body.message || '']);
}

function adminStats(email) {
  if (String(email).toLowerCase() !== ADMIN_EMAIL) return { error: 'forbidden' };

  var shVi = getSheet(ONGLETS.visites);
  var shVe = getSheet(ONGLETS.vendeurs);
  var shP = getSheet(ONGLETS.produits);
  var shN = getSheet(ONGLETS.negociations);
  var shT = getSheet(ONGLETS.tentatives);

  return {
    visites: Math.max(0, shVi.getLastRow() - 1),
    vendeurs: Math.max(0, shVe.getLastRow() - 1),
    produits: Math.max(0, shP.getLastRow() - 1),
    negociations: Math.max(0, shN.getLastRow() - 1),
    listeVendeurs: lireDerniers(shVe, ['date', 'nom', 'boutique', 'email', 'telephone', 'categorie', 'zone']),
    listeProduits: lireDerniers(shP, ['date', 'nom', 'prix', 'boutique', 'categorie']),
    listeVisites: lireDerniers(shVi, ['date', 'page', 'pseudo']),
    listeNegos: lireDerniers(shN, ['date', 'produit', 'vendeur']),
    listeTentatives: lireDerniers(shT, ['date', 'nom', 'whatsapp', 'message'])
  };
}

function lireDerniers(sheet, colonnes) {
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < colonnes.length; j++) {
      var val = data[i][j];
      if (val instanceof Date) val = formaterDate(val);
      obj[colonnes[j]] = val;
    }
    result.push(obj);
  }
  return result;
}

function formaterDate(d) {
  if (!(d instanceof Date)) return String(d);
  var jour = ('0' + d.getDate()).slice(-2);
  var mois = ('0' + (d.getMonth() + 1)).slice(-2);
  var annee = d.getFullYear();
  var h = ('0' + d.getHours()).slice(-2);
  var m = ('0' + d.getMinutes()).slice(-2);
  return jour + '/' + mois + '/' + annee + ' ' + h + ':' + m;
}