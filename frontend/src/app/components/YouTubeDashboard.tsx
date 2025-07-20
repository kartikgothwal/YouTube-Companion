"use client";
import React, { useState, useEffect } from "react";
import {
  PlayIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Reply = {
  id: string;
  author: string;
  text: string;
  publishedAt: string;
};

type Comment = {
  id: string;
  author: string;
  authorProfileImageUrl: string;
  text: string;
  publishedAt: string;
  likeCount: number;
  replies?: Reply[];
};

type Note = {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Video = {
  id: string;
  title: string;
  description?: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails?: {
    medium?: { url: string };
  };
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
};

const YouTubeDashboard = () => {
  const [videoId, setVideoId] = useState<string>("");
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newNote, setNewNote] = useState("");

  const fetchVideo = async (id: string) => {
    if (!id.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
        headers: {
          "user-id": "demo-user",
        },
      });

      if (!response.ok) {
        throw new Error("Video not found");
      }

      const videoData = await response.json();
      setVideo(videoData);
      setEditTitle(videoData.title);
      setEditDescription(videoData.description || "");

      // Fetch comments
      await fetchComments(id);
      // Fetch notes
      await fetchNotes(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/videos/${id}/comments`,
        {
          headers: {
            "user-id": "demo-user",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchNotes = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}/notes`, {
        headers: {
          "user-id": "demo-user",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const updateVideo = async () => {
    if (!video) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${video.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": "demo-user",
          Authorization: "Bearer YOUR_ACCESS_TOKEN", // You'll need to implement OAuth
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (response.ok) {
        setVideo({ ...video, title: editTitle, description: editDescription });
        setEditMode(false);
        alert("Video updated successfully!");
      } else {
        throw new Error("Failed to update video");
      }
    } catch (err) {
      alert("Error updating video: " + err.message);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !video) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/videos/${video.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": "demo-user",
            Authorization: "Bearer YOUR_ACCESS_TOKEN",
          },
          body: JSON.stringify({ text: newComment }),
        }
      );

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        alert("Comment added successfully!");
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (err) {
      alert("Error adding comment: " + err.message);
    }
  };

  const addReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": "demo-user",
            Authorization: "Bearer YOUR_ACCESS_TOKEN",
          },
          body: JSON.stringify({
            text: replyText,
            videoId: video.id,
          }),
        }
      );

      if (response.ok) {
        const reply = await response.json();
        // Update comments with the new reply
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, replies: [...(c.replies || []), reply] }
              : c
          )
        );
        setReplyText("");
        setReplyingTo(null);
        alert("Reply added successfully!");
      } else {
        throw new Error("Failed to add reply");
      }
    } catch (err) {
      alert("Error adding reply: " + err.message);
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}?videoId=${video.id}`,
        {
          method: "DELETE",
          headers: {
            "user-id": "demo-user",
            Authorization: "Bearer YOUR_ACCESS_TOKEN",
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
        alert("Comment deleted successfully!");
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (err) {
      alert("Error deleting comment: " + err.message);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !video) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/videos/${video.id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": "demo-user",
          },
          body: JSON.stringify({ content: newNote }),
        }
      );

      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        setNewNote("");
      } else {
        throw new Error("Failed to add note");
      }
    } catch (err) {
      alert("Error adding note: " + err.message);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "user-id": "demo-user",
        },
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n._id !== noteId));
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (err) {
      alert("Error deleting note: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            YouTube Companion Dashboard
          </h1>

          <div className="flex gap-4 mb-6">
            <input
            type="text"
            placeholder="Enter YouTube Video ID or URL"
            value={videoId}
            onChange={(e) => {
              const input = e.target.value.trim();
              const match = input.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
              const id = match ? match[1] : input;
              setVideoId(id);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
            <button
              onClick={() => fetchVideo(videoId)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Loading..." : "Load Video"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {video && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <PlayIcon className="h-6 w-6 mr-2 text-red-500" />
                    Video Details
                  </h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={updateVideo}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={video.thumbnails?.medium?.url}
                        alt="Video thumbnail"
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {video.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          by {video.channelTitle}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Published: {formatDate(video.publishedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {parseInt(video.viewCount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {parseInt(video.likeCount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {parseInt(video.commentCount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Comments</div>
                      </div>
                    </div>

                    {video.description && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Description
                        </h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {video.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
                  <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-blue-500" />
                  Comments ({comments.length})
                </h2>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addComment}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={comment.authorProfileImageUrl}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {comment.author}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(comment.publishedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setReplyingTo(
                                replyingTo === comment.id ? null : comment.id
                              )
                            }
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2">{comment.text}</p>

                      <div className="text-xs text-gray-500">
                        {comment.likeCount > 0 && `${comment.likeCount} likes`}
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-6 border-l-2 border-gray-100">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="py-2 border-b border-gray-50 last:border-0"
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                  {reply.author}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.publishedAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {reply.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => addReply(comment.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
                  <PencilIcon className="h-6 w-6 mr-2 text-green-500" />
                  Notes ({notes.length})
                </h2>

                <div className="mb-4">
                  <textarea
                    placeholder="Add a note about this video..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                  />
                  <button
                    onClick={addNote}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Note
                  </button>
                </div>

                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                          {note.updatedAt !== note.createdAt && " (edited)"}
                        </div>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeDashboard;
