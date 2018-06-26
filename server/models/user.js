'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: { 
    type: String,  
    unique: true,
    required: true
  },
  email: { 
    type: String,  
    unique: true,
    required: true
  },
  password: {
    type:String, 
    require: true
  },
  firstname: {type: String, default: ''},
  lastname: {type: String, default: ''},
  notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
});

usersSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstname: this.firstname || '',
    lastname: this.lastname || ''
  };
};

usersSchema.methods.validatePassword = function (password) {
  console.log('bcrypt.compare here',bcrypt.compare(password, this.password).then(data => console.log('.then data',data)));
  return bcrypt.compare(password, this.password);
};

usersSchema.statics.hashPassword = function (password) {

  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', usersSchema);