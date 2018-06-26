'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const usersRouter = require('./routes/users');
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');
const {localStrategy, jwtStrategy } = require('./passport/local');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');
const app = express();
// Mount routers
app.use( cors({ origin: CLIENT_ORIGIN }) );
// app.options('*', cors());
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static('public'));
app.use('/api/', usersRouter); 
app.use('/api/notes', notesRouter); 
// app.use('/api/recipes', recipesRouter); 
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });
 
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'Chewie'
  });
});


// app.post('/refresh', jwtAuth, (req, res) => {
//   const authToken = createAuthToken(req.user);
//   res.json({authToken});
// });

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);


app.use((req, res, next) => { 
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Credentials','true'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization'); 
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if(req.method === 'OPTIONS') { return res.sendStatus(204); } return next(); });


app.use(
  express.json()
);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
