'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const User = require('../models/user');
const Note = require('../models/note');

const seedUsers = require('../db/seed/users');
const seedNotes = require('../db/seed/notes');

mongoose.connect( DATABASE_URL )
  .then(() => mongoose.connection.db.dropDatabase())
  .then(()=> {
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),
      Note.insertMany(seedNotes)
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });