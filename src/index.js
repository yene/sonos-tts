import m from 'mithril';

var SonosTTS = require('./views/SonosTTS.js')

var app = document.querySelector('.app');
m.route(app, '/', {
  '/': SonosTTS,
})
