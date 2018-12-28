
var m = require('mithril');

var SonosTTS = {
  data: [{
    name: 'loading...',
    players: [{
      id: '',
      name: 'loading...',
    }],
  }],
  selectedPlayer: '',
  textToSpeak: '',
  oninit: function(vnode) {
    this.loadPlayers();
  },
  loadPlayers: function() {
    return m.request({
      method: 'GET',
      url: window.location.protocol + '//' + window.location.host + '/players',
      withCredentials: true,
    })
    .then(function(result) {
      if (result.success === false || result.households === undefined) {
        if (result.authRequired !== undefined && result.authRequired === true) {
          window.location.href = '/auth';
          return;
        }
        console.log('Unexpected error happend', result);
        return;
      }
      SonosTTS.data = result.households;
    })
  },
  view: function(vnode) {
    return m('.app-tts', [
      m('h2', 'Sonos Text to Speech'),
      m('span', 'Select your target player '),
      m('select',
        {onchange: function(e) {
          SonosTTS.selectedPlayer = e.target.options[e.target.selectedIndex].value;
        }},
        m('option', {value: '', selected: 'true'}, 'Choose a player'),
        this.data.map(function(home) {
          return m('optgroup[label=' + home.name + ']',
            home.players.map(function(player) {
              return m('option',
                {value: player.id, selected: SonosTTS.selectedPlayer === player.id},
                player.name
              );
            })
          );
        })
      ),
      m('', [
        m('span', 'Enter your text to speak: '),
        m('input.input[placeholder=Good Morning]', {
          oninput: function (e) {SonosTTS.textToSpeak = e.target.value},
          value: SonosTTS.textToSpeak
        }),
      ]),
      m('button.button[type=button]', {disabled: SonosTTS.selectedPlayer === '' || SonosTTS.textToSpeak === '' , onclick: function() {
        m.request({
          method: 'GET',
          url: window.location.protocol + '//' + window.location.host + '/speakText?playerId=' + SonosTTS.selectedPlayer + '&text=' + SonosTTS.textToSpeak,
          withCredentials: true,
        })
      }}, 'Play Text'),
      m('button.button[type=button]', {disabled: SonosTTS.selectedPlayer === '', onclick: function() {
        m.request({
          method: 'GET',
          url: window.location.protocol + '//' + window.location.host + '/doorbell?playerId=' + SonosTTS.selectedPlayer,
          withCredentials: true,
        })
      }}, 'Play Doorbell')
    ]);
  }
}

module.exports = SonosTTS;
