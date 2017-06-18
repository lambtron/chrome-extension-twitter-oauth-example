(function() {
  var API_URL = 'https://api.twitter.com/';
  var consumer_key = 'XXXXXXXXXXXXXXXXX';
  var consumer_secret = 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY';
  var Twitter = {
    oauth_token: null,
    oauth_token_secret: '',
    authenticate: function() {
      Twitter.oauth_token_secret = '';
      Twitter.oauth_token = null;

      this.api('oauth/request_token', 'POST', $.proxy(function(response) {
        var des = this.deparam(response);
        Twitter.oauth_token_secret = des.oauth_token_secret;
        Twitter.oauth_token = des.oauth_token;
        var url = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + Twitter.oauth_token;
        window.open(url);
      }, this));
    },
    logout: function() {
      chrome.storage.local.remove(['oauth_token', 'oauth_token_secret']);
      Twitter.oauth_token = false;
      Twitter.oauth_token_secret = false;
      chrome.browserAction.setBadgeText({text: ''});
    },
    isLoggedIn: function(cb) {
      chrome.storage.local.get(['oauth_token', 'oauth_token_secret'], cb);
    },
    setOAuthTokens: function(tokens, cb) {
      Twitter.oauth_token = tokens.oauth_token;
      Twitter.oauth_token_secret = tokens.oauth_token_secret;
      chrome.storage.local.set({ 'oauth_token': tokens.oauth_token, 'oauth_token_secret': tokens.oauth_token_secret }, cb);
    },
    api: function(path /* params obj, callback fn */) {
      var args = Array.prototype.slice.call(arguments, 1),
          fn = false,
          params = {},
          method = 'GET';

      /* Parse arguments to their appropriate position */
      for(var i in args) {
        switch(typeof args[i]) {
          case 'function':
            fn = args[i];
          break;
          case 'object':
            params = args[i];
          break;
          case 'string':
            method = args[i].toUpperCase();
          break;
        }
      }

      /* Add an oauth token if it is an api request */
      Twitter.oauth_token && (params.oauth_token = Twitter.oauth_token);

      /* Add a 1.1 and .json if its not an authentication request */
      (!path.match(/oauth/)) && (path = '1.1/' + path + '.json');

      var accessor = {consumerSecret: consumer_secret, tokenSecret: Twitter.oauth_token_secret},
        message = {
          action: API_URL + path,
          method: method,
          parameters: [['oauth_consumer_key', consumer_key], ['oauth_signature_method', 'HMAC-SHA1']]
        };

      $.each(params, function(k, v) {
        OAuth.setParameter(message, k, v);
      });

      OAuth.completeRequest(message, accessor);

      var p = [];
      $.each(OAuth.getParameterMap(message.parameters), function(k, v) {
        p.push(k + '=' + OAuth.percentEncode(v));
      });

      $[method.toLowerCase()](API_URL + path, p.join('&'), fn).error(function(res) {
        if(res && res.responseText && res.responseText.match(/89/)) {
          Twitter.authenticate();
        }
      });
    },
    deparam: function(params) {
      var obj = {};
      $.each(params.split('&'), function() {
        var item = this.split('=');
        obj[item[0]] = item[1];
      });
      return obj;
    }
  };

  window.Twitter = Twitter;
})();