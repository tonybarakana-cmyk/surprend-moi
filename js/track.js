(function () {
  function track(action, data) {
    data = data || {};
    try {
      var payload = JSON.stringify({
        action: action,
        page: location.pathname,
        pseudo: new URLSearchParams(location.search).get('u') || '',
        data: data
      });
      var url = window.CONFIG ? window.CONFIG.API_URL : '';
      if (!url || url.indexOf('REMPLACE') !== -1) return;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: 'text/plain;charset=utf-8' }));
      } else {
        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}
  }

  var path = location.pathname;
  var isHome = path.endsWith('/') || path.endsWith('/index.html');
  if (isHome) {
    track('visite');
  }

  window.track = track;
})();