import m from 'mithril';

var SonosAuth = require('./views/SonosAuth.js');
var SonosTTS = require('./views/SonosTTS.js')

m.route(document.body, '/auth', {
    '/auth': SonosAuth,
    '/tts': SonosTTS,
})
