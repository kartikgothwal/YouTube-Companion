const express = require('express');
const Note = require('../model/Note');
const Log = require('../model/Log');
const router = express.Router();

router.get('/', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

router.post('/', async (req, res) => {
  const note = await Note.create({ content: req.body.content });
  await Log.create({ event: 'ADD_NOTE', details: { note } });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  await Log.create({ event: 'DELETE_NOTE', details: { noteId: req.params.id } });
  res.sendStatus(200);
});

module.exports = router;
