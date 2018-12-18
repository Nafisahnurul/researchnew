var express = require('express'),
    { google } = require('googleapis'),
    router = express.Router();
/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
  clientId: '538655775637-ae0jffp2b2euq8gm6i3jbrfdnmel9gb6.apps.googleusercontent.com', // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
  clientSecret: 'TduvWT4kY4zjElbW3LegveQe', // e.g. _ASDFA%DFASDFASDFASD#FAD-
  redirect: 'http://localhost:5000/search/', // this must match your google api settings
};

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
router.get("/urlGoogle",function (req,res) {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  res.redirect(url);
});

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
/*
function getGoogleAccountFromCode(code) {
  const data = await auth.getToken(code);
  const tokens = data.tokens;
  const auth = createConnection();
  auth.setCredentials(tokens);
  const plus = getGooglePlusApi(auth);
  const me = await plus.people.get({ userId: 'me' });
  const userGoogleId = me.data.id;
  const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
  return {
    id: userGoogleId,
    email: userGoogleEmail,
    tokens: tokens,
  };
}*/

module.exports = router;