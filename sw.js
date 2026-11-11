/* Kaizen Bible v0.5 — hors connexion : l'appli et ses données sont gardées en cache. */
var CACHE = 'kaizen-bible-0.6.1-31ff131a';
var FICHIERS = ['./', 'index.html', 'assets/kaizen.js', 'assets/kaizen.css', 'manifest.webmanifest', 'icones/icone.svg',
  'icones/icone-180.png', 'icones/icone-192.png', 'icones/icone-512.png', 'data/manifeste.js', 'data/contenu.js', 'data/principes.js', 'data/graphe.js',
  'polices/polices.css'];
self.addEventListener('install', function (e) {
  // « reload » : on va chercher chaque fichier sur le serveur, jamais dans le cache HTTP du navigateur
  // (sinon une mise à jour publiée il y a moins de dix minutes pourrait remettre l'ancien code en cache)
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: 'reload' }); })); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); })); })
    .then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request).then(function (rep) {   // les livres LSG sont mis en cache à la première lecture
      if (rep.ok && e.request.url.indexOf('/data/lsg/') > 0) { var copie = rep.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copie); }); }
      return rep;
    });
  }));
});
