const simpleOauthModule = require('simple-oauth2');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path')
const fastify = require('fastify')({
  logger: false,
});
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '/public'),
});

const port = 3001;

if (process.env.SONOS_CLIENT_ID === undefined || process.env.SONOS_CLIENT_SECRET === undefined) {
  console.log('credentials missing, get them from https://integration.sonos.com/integrations');
  process.exit();
}

let oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.SONOS_CLIENT_ID,
    secret: process.env.SONOS_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://api.sonos.com',
    tokenPath: '/login/v3/oauth/access',
    authorizePath: '/login/v3/oauth',
  },
});

// Authorization uri definition
let authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:' + port + '/redirect',
  scope: 'playback-control-all',
  state: 'blahblah',
});

let token; // This'll hold our token, which we'll use in the Auth header on calls to the Sonos Control API
let authRequired = false; // We'll use this to keep track of when auth is needed (first run, failed refresh, etc) and return that fact to the calling app so it can redirect

// This is a function we run when we first start the app. It gets the token from the local store, or sets authRequired if it's unable to
async function init() {
  let currentToken = readToken();
  if (currentToken === undefined) {
    authRequired = true;
    return;
  }
  token = oauth2.accessToken.create(currentToken.token);

  if (token.expired()) {
    try {
      token = await token.refresh();
      writeToken(token)
    } catch (error) {
      authRequired = true;
      console.log('Error refreshing access token: ', error.message);
    }
  }
}

init();

fastify.get('/auth', (request, reply) => {
  reply.redirect(302, authorizationUri);
})

fastify.get('/redirect', async (request, reply) => {
  let code = request.query.code;
  let redirect_uri = 'http://localhost:' + port + '/redirect';
  try {
    let result = await oauth2.authorizationCode.getToken({code, redirect_uri});
    token = oauth2.accessToken.create(result); // Save the token for use in Sonos API calls
    writeToken(token);
    authRequired = false; // And we're all good now. Don't need auth any more
    reply.redirect(302, 'http://localhost:' + port); // Head back to the main app
  } catch (error) {
    console.error('Access Token Error', error.message);
    return reply.status(500).send({status: 'Authentication failed'});
  }
  reply.redirect(302, authorizationUri);
});

fastify.get('/players', async (request, reply) => {
  if (authRequired) {
    reply.send({success: false, authRequired: true});
    return;
  }

  try {
    let hhResult = await fetch(`https://api.ws.sonos.com/control/api/v1/households`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.token.access_token}` },
    });

    let json = await hhResult.json();
    if (json.households === undefined) {
      throw new Error(json.error);
    }

    // polyfill name property until it is added to the api
    var households = json.households;
    households.forEach(h => {
      if (h.name === undefined) {
        h.name = h.id;
      }
    });

    // request players for each household
    for (let household of households) {
      let groupsResult = await fetch(`https://api.ws.sonos.com/control/api/v1/households/${household.id}/groups`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.token.access_token}` },
      });

      let json = await groupsResult.json();
      if (json.groups === undefined) {
        throw new Error(json.error);
      }
      let players = json.players;
      // TODO: filter players by capabilities.includes('AUDIO_CLIP')
      household.players = players.map((p) => {
        return {id: p.id, name: p.name};
      });
    }
    reply.send({success: true, households: households});
  } catch (err) {
    reply.send({success: false, error: err});
    return;
  }
});

fastify.get('/speakText', async (request, reply) => {
  let text = request.query.text;
  let playerId = request.query.playerId;

  if (authRequired) {
    reply.send({success: false, authRequired: true});
    return;
  }

  if (text === null || playerId === null) {
    reply.send({success: false, error: 'Missing Parameters'});
    return;
  }

  let speechUrl;

  try {
    speechUrl = await googleTTS(text, 'en-US', 1, 5000);
  } catch (err) {
    reply.send({success: false, error: err.stack});
    return;
  }

  let body = { streamUrl: speechUrl, name: 'Sonos TTS', appId: 'com.me.sonosspeech' };
  let audioClipRes;
  try {
    audioClipRes = await fetch(`https://api.ws.sonos.com/control/api/v1/players/${playerId}/audioClip`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.token.access_token}` },
    });
    let json = await audioClipRes.json();
    if (json.id === undefined) {
      throw new Error(json.errorCode);
    }
    reply.send({success: true});

  } catch (err) {
    reply.send({success: false, error: err});
    return;
  }
});

fastify.get('/doorbell', async (request, reply) => {
  let playerId = request.query.playerId;

  if (authRequired) {
    reply.send({success: false, authRequired: true});
    return;
  }

  if (playerId === null) {
    reply.send({success: false, error: 'Missing Parameters'});
    return;
  }

  let body = { streamUrl: 'https://shiro.ch/dingdong.mp3', name: 'Sonos TTS', appId: 'com.me.sonosspeech' };
  let audioClipRes;
  try {
    audioClipRes = await fetch(`https://api.ws.sonos.com/control/api/v1/players/${playerId}/audioClip`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.token.access_token}` },
    });
    let json = await audioClipRes.json();
    if (json.id === undefined) {
      throw new Error(json.errorCode);
    }
    reply.send({success: true});

  } catch (err) {
    reply.send({success: false, error: err});
    return;
  }
});

fastify.listen(port, (err, address) => {
  if (err) throw err;
  console.log(`server listening on ${address}`);
});

function readToken() {
  try {
    let token = fs.readFileSync('./token.json', 'utf8');
    return JSON.parse(token);
  } catch(e) {
    return undefined;
  }
}
function writeToken(t) {
  try {
    fs.writeFileSync('./token.json', JSON.stringify(t, null, 2));
  } catch(e) {
    console.log(e);
  }
}
