# Sonos TTS

Using Mithril to create a web app that allows you to play text-to-speech audio files form google on your Sonos.

## Learning Mithril
This project was done to learn about Mithril. You can follow along in the commits.

## Learned
* Install Typescript definitions and enable checkJs in Visual Studio Code settings, to get auto completion and checking.
* Code Style: Module names are camelcase with first letter uppercase.
* Input and select values have to be binded manually.

## How it works
The `fastify` server (not express this time, but they are very similar), has to be started with the credentials.
`SONOS_CLIENT_ID=xxxx SONOS_CLIENT_SECRET=xxx node server.js`

The credentials can be created in the [developer portal](https://integration.sonos.com/integrations). After successfull login you are redirected (with a token) back to the web server.
Add `http://localhost:3001/redirect` to the Redirect URIs for it to work.

## Questions
* How to do conditional rendering (if not possible add hidden CSS class)?
* How did mithril know to redraw after `data` was populated?
* Is there a way to bind a variable directly to a `<select>` selected value?
* Why is not possible to render an `<option>` with a hardcoded `selected`?
*

## Material
* [Sonos TTS with React](https://developer.sonos.com/code/making-sonos-talk-with-the-audioclip-api/)
* google-tts-api: This puts a nice, neat, promise-ready wrapper around the Google Text-to-Speech API.
* simple-oauth2: A handy package to simplify the process of getting and refreshing access tokens.
