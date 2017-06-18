
/**
 * Get tokens.
 */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({});

  var params = Twitter.deparam(request.session);

  // Get access tokens again.
  Twitter.api('oauth/access_token', 'POST', params, function(res) {
    Twitter.setOAuthTokens(Twitter.deparam(res), function() {});
  });
});