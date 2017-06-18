# Chrome Extension Twitter Oauth Example

This is an example of a Chrome Extension that allows the user to perform a three-legged oauth into Twitter. It uses [`chrome.storage.local`](https://developer.chrome.com/extensions/storage) for storing the oauth tokens.

![The chrome extension with twitter oauth flow](http://i.imgur.com/aCJLuvQ.gif)

## Setup

1. Clone this repo.
2. Point your Chrome browser to `chrome://extensions/`. Select `developer mode`.
3. Click "Load unpacked extension..."
4. Then select the directory where the `manifest.json` file lives

## How it works

Because chrome extensions don't have a callback URL that you can provide Twitter to make the oauth process seamless, you have to use [content scripts](https://developer.chrome.com/extensions/content_scripts) to inject a script onto the callback page that parses the tokens from the query string, and then [sends it as a message to the background script](https://developer.chrome.com/extensions/messaging).

### Setting Up Your Twitter App

On your [application management interface](https://apps.twitter.com), be sure to add a callback URL in the field. It doesn't matter too much what URL you stick in here, so long as you update your `manifest.json` file to include that domain for when you inject your content script.

For this example, I will just use my personal domain, [https://andyjiang.com/](https://andyjiang.com/).

![Adding my personal website as the callback URL](http://i.imgur.com/4AFL2CE.png)

Note that if it's left blank, the oauth flow will default to a [pin-based out-of-band oauth process](https://dev.twitter.com/oauth/pin-based).

Then, grab your consumer key and consumer secret from your application settings and paste them in [`js/lib/twitter.js`](https://github.com/lambtron/chrome-extension-twitter-oauth-example/blob/master/js/lib/twitter.js#L3-L4):

```javascript
  var consumer_key = 'XXXXXXXXXXXXXXXXX';
  var consumer_secret = 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY';
```

This will let Twitter know which app is trying to authenticate when the user kicks off the oauth process.

### Updating your manifest.json file

Your `manifest.json` file tells Chrome everything it needs to know about your extension, including permissions and which scripts to inject on which sites.

First, let's set the permissions. This is an array that tells Chrome what your extension can and cannot do:
- tabs: for opening a new tab when we start the oauth process that directs users to their twitter login screen
- storage: for saving tokens to `chrome.storage.local`
- https://api.twitter.com/*: we need to make requests to this endpoint for the oauth process

```json
    "permissions": [
        "tabs",
        "storage",
        "https://api.twitter.com/*"
    ],
```

Next, let's define how our content scripts are used. You need to have [`js/session.js`](https://github.com/lambtron/chrome-extension-twitter-oauth-example/blob/master/js/session.js) load on https://andyjiang.com/*, because when Twitter redirects the user to that domain provided in the callback URL, `js/session.js` will parse the tokens from the query string and send it to your [`js/background.js`](https://github.com/lambtron/chrome-extension-twitter-oauth-example/blob/master/js/background.js) file.

```json
    "content_scripts": [{
      "matches": ["https://andyjiang.com/*"],
      "js": ["js/session.js"]
    }]
```

If you take a look at `js/session.js`, you can see all it does is parse the querystring from the URL and send it to the background script as a message. Afterwards, it closes the tab automatically.

```js
chrome.runtime.sendMessage({type: 'auth', session: window.location.search.substr(1)}, function(response) {
    window.open('', '_self', '');
    window.close();
});
```

Finally, we have to make sure chrome is made aware of all of the background scripts. If we omit one, then it won't be included, even if it's referenced in `background.html`.

```json
  "background": {
    "scripts": [
      "js/lib/jquery.min.js",
      "js/lib/oAuth.js",
      "js/lib/sha1.js",
      "js/lib/twitter.js",
      "js/background.js"
    ],
    "persistent": false
  },
```

There you have it.

Find me on [twitter](https://twitter.com/andyjiang) if you have any questions or comments!

