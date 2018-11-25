import m from 'mithril';

var SonosAuth = require('./views/SonosAuth.js');
var SonosTTS = require('./views/SonosTTS.js')

var app = document.querySelector('.app');
m.route(app, '/auth', {
  '/auth': SonosAuth,
  '/tts': SonosTTS,
})
