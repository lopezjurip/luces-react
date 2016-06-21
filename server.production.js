/* eslint no-console:0 strict:0 */

'use strict';

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms')); // eslint-disable-line

// serve static assets normally
app.use(express.static(`${__dirname}/public`));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(5000, err => {
  if (err) console.error(err);
  console.log('Web client listening on port 5000');
});
