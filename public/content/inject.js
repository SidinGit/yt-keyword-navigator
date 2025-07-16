// public/content/inject.js
;(function() {
  // --- wrap fetch ---
  const origFetch = window.fetch;
  window.fetch = function(input, init) {
    return origFetch(input, init).then(res => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/timedtext')) {
        res.clone().text().then(body => {
          window.dispatchEvent(new CustomEvent('YT_TIMEDTEXT', {
            detail: { url, body }
          }));
        });
      }
      return res;
    });
  };

  // --- wrap XMLHttpRequest ---
  const origXhrOpen = XMLHttpRequest.prototype.open;
  const origXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
    this.__yt_url = url;
    return origXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('load', function() {
      if (this.__yt_url && this.__yt_url.includes('/api/timedtext')) {
        window.dispatchEvent(new CustomEvent('YT_TIMEDTEXT', {
          detail: { url: this.__yt_url, body: this.responseText }
        }));
      }
    });
    return origXhrSend.apply(this, arguments);
  };
})();
