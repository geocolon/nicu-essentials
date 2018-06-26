'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

const Note = require('../models/note');
const User = require('../models/user');

router.get('/',jwtAuth, (req, res) => { 
  Note
    .find({username:req.user.username})
    .then(notes => {
      res.json(notes);
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message:'Inernal server error'});
      });
});

router.get('/:id', [jwtAuth, jsonParser], (req, res, next) => {
  Note
    .findById(req.params.id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Inernal server error'});
    });
});

router.post('/', [jwtAuth, jsonParser], (req, res, next) => {
  const requiredFields = ['name', 'text'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  return Note.create({name:req.body.name, username:req.body.username, text:req.body.text})
    .then(data => {
      return User.findOne({username: req.user.username})
        .then((user) => {
          user.notes.push(data.id);
          // if statement here
          return user.save();

        });
    })
    .then(item => {
      res.status(201).json(item.notes);
    })
    .catch(err => {
      next(err);
    });
});
  
router.delete('/:id', jwtAuth, (req, res) => {
  Note
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500)
      .json(err, {message:'internal server error'}));
});

router.put('/:id', [jwtAuth, jsonParser], (req, res) => {
  const requiredFields = ['name', 'text', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (`Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating note list item \`${req.params.id}\``);
  Note.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    text: req.body.text
  })
    .then(() => res.status(204).end());
});
module.exports = router;