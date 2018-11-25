// Authenticate with the Sonos oauth

var m = require('mithril');

module.exports = {
  oninit: function(vnode) {
    // TODO: check if user is already authed, when he is redirect to TTS.
  },
  view: function() {
    return m('.app-auth', [
      m('h2', 'Please Sign-in with your Sonos account'),
      m('button.button[type=button]', 'Sign in')
    ]);
  }
}
