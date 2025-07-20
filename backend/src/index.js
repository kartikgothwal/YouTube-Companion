// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

 let videoData = {};
let commentsData = {};
let notesData = {};

const generateId = () => Math.random().toString(36).substring(2, 10);

/**
 * GET /api/videos/:id - Fetch video details
 */
app.get("/api/videos/:id", async (req, res) => {
  const videoId = req.params.id;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          id: videoId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const items = response.data.items;

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const video = items[0];
    const result = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    };

    res.json(result);
  } catch (error) {
    console.error("YouTube API error:", error.message);
    res.status(500).json({ message: "Failed to fetch video from YouTube API" });
  }
});

/**
 * PUT /api/videos/:id - Update title and description
 */
app.put("/api/videos/:id", (req, res) => {
  const { title, description } = req.body;
  const video = videoData[req.params.id];
  if (!video) return res.status(404).json({ message: "Video not found" });
  video.title = title;
  video.description = description;
  res.json(video);
});

/**
 * GET /api/videos/:id/comments - Get all comments for a video
 */
app.get("/api/videos/:id/comments", (req, res) => {
  const comments = commentsData[req.params.id] || [];
  res.json({ comments });
});

/**
 * POST /api/videos/:id/comments - Add a comment
 */
app.post("/api/videos/:id/comments", (req, res) => {
  const { text } = req.body;
  const videoId = req.params.id;

  if (!text) return res.status(400).json({ message: "Comment text is required" });

  const comment = {
    id: generateId(),
    text,
    author: "Anonymous",
    authorProfileImageUrl: "https://via.placeholder.com/40",
    publishedAt: new Date().toISOString(),
    likeCount: 0,
    replies: [],
  };

  commentsData[videoId] = [comment, ...(commentsData[videoId] || [])];
  res.status(201).json(comment);
});

/**
 * DELETE /api/comments/:id?videoId= - Delete a comment
 */
app.delete("/api/comments/:id", (req, res) => {
  const { videoId } = req.query;
  if (!videoId || !commentsData[videoId]) {
    return res.status(404).json({ message: "Video not found for comments" });
  }
  commentsData[videoId] = commentsData[videoId].filter(
    (comment) => comment.id !== req.params.id
  );
  res.status(204).send();
});

/**
 * POST /api/comments/:id/replies - Add reply to a comment
 */
app.post("/api/comments/:id/replies", (req, res) => {
  const { text, videoId } = req.body;
  const commentId = req.params.id;
  const comments = commentsData[videoId] || [];
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  const reply = {
    id: generateId(),
    text,
    author: "Anonymous",
    publishedAt: new Date().toISOString(),
  };
  comment.replies = [...(comment.replies || []), reply];
  res.status(201).json(reply);
});

/**
 * GET /api/videos/:id/notes - Get all notes for a video
 */
app.get("/api/videos/:id/notes", (req, res) => {
  const notes = notesData[req.params.id] || [];
  res.json({ notes });
});

/**
 * POST /api/videos/:id/notes - Add a note
 */
app.post("/api/videos/:id/notes", (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Note content required" });

  const note = {
    _id: generateId(),
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notesData[req.params.id] = [note, ...(notesData[req.params.id] || [])];
  res.status(201).json(note);
});

/**
 * DELETE /api/notes/:id - Delete a note by ID
 */
app.delete("/api/notes/:id", (req, res) => {
  for (const videoId in notesData) {
    const initialLength = notesData[videoId].length;
    notesData[videoId] = notesData[videoId].filter((n) => n._id !== req.params.id);
    if (notesData[videoId].length < initialLength) break;
  }
  res.status(204).send();
});

/**
 * POST /api/mock-video - Mock a video manually
 */
app.post("/api/mock-video", (req, res) => {
  const { id, title, description, channelTitle } = req.body;
  if (!id || !title || !channelTitle)
    return res.status(400).json({ message: "Missing required fields" });

  videoData[id] = {
    id,
    title,
    description,
    channelTitle,
    publishedAt: new Date().toISOString(),
    thumbnails: {
      medium: { url: "https://via.placeholder.com/320x180" },
    },
    viewCount: "12345",
    likeCount: "678",
    commentCount: "2",
  };
  res.status(201).json(videoData[id]);
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));