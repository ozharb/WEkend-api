'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const EventsRouter = require('./events/events-router');
const FriendsRouter = require('./friends/friends-router');
const AttendanceRouter = require('./attendance/attendance-router');
const UsersRouter = require('./users/users-router');
const AuthRouter = require('./auth/auth-router');

const app = express();
app.use(cors());
app.use(helmet());

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use('/api/events', EventsRouter);
app.use('/api/friends', FriendsRouter);
app.use('/api/attendance', AttendanceRouter);
app.use('/api/users', UsersRouter);
app.use('/api/auth', AuthRouter);

app.get('/', (req, res) => {
  res.send('Running WEkend-Api!');
});
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {

    console.error(error);
    response = { message: error.message, error };
  }
  console.error(error)
  res.status(500).json(response);
});



module.exports = app;