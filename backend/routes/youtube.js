const express = require('express');
const axios = require('axios');
const Log = require('../model/Log');
const router = express.Router();

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const logEvent = async (event, details = {}) => {
  await Log.create({ event, details });
};

router.get('/video', async (req, res) => {
  const videoId = process.env.VIDEO_ID;
  try {
    const { data } = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    await logEvent('FETCH_VIDEO_DETAILS', { videoId });
    res.json(data.items[0]);
  } catch (err) {
    res.status(500).send('Failed to fetch video details');
  }
});

router.post('/edit-video', async (req, res) => {
  const { title, description } = req.body;
  try {
    await axios.put(
      `${BASE_URL}/videos?part=snippet`,
      {
        id: process.env.VIDEO_ID,
        snippet: { title, description }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OAUTH_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    await logEvent('EDIT_VIDEO', { title, description });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Failed to update video');
  }
});

module.exports = router;
