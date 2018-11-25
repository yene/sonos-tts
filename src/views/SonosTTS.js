
var m = require('mithril');

var data = [{
    name: 'home 1',
    players: [
      {name: 'player 1', id: '123'},
      {name: 'player 2', id: '1234'},
      {name: 'player 3', id: '12345'},
    ]
  }, {
    name: 'home 2',
    players: [
      {name: 'player xy', id: '123'},
    ]
  }];

module.exports = {
  oninit: function(vnode) {
    // TODO: load homes and the players of the homes
  },
  view: function() {
    return m('.app-tts', [
      m('h2', 'Sonos Text to Speech'),
      m('span', 'Select your target player '),
      m('select',
        data.map(function(home) {
          return m('optgroup[label=' + home.name + ']',
            home.players.map(function(player) {
              return m('option[value=' + player.id + ']', player.name);
            })
          );
        })
      ),
      m('', [
        m('span', 'Enter your text to speak: '),
        m('input.input[placeholder=Good Morning]'),
      ]),
      m('button.button[type=button]', 'Send')
    ]);
  }
}
