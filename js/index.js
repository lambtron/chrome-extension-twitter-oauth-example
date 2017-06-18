
/**
 * Login logic.
 */

Twitter.isLoggedIn(function(items) {
  if (!items.oauth_token || !items.oauth_token_secret) {
    document.getElementById('authenticate').addEventListener('click', function() {
      Twitter.authenticate();
    })
  } else {
    document.getElementById('content').innerText = 'Logged in'
  }
});
