const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ✅ Standalone image upload route
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
});

// ✅ Get all posts
router.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM posts ORDER BY date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ✅ Get a single post
router.get('/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ✅ Create new post - FIXED: Handle image properly
router.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, imageUrl } = req.body;
    
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description, and date are required' });
    }
    
    // Use uploaded file if available, otherwise use imageUrl, otherwise default
    let imagePath = '/images/default.jpg';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }
    
    const [result] = await pool.execute(
      'INSERT INTO posts (title, description, image, date) VALUES (?, ?, ?, ?)',
      [title, description, imagePath, date]
    );
    
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ✅ Update post - FIXED: Handle image properly
router.put('/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, imageUrl } = req.body;
    const postId = req.params.id;
    
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description, and date are required' });
    }
    
    const [existingPost] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    if (existingPost.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Use uploaded file if available, otherwise use imageUrl, otherwise keep existing
    let imagePath = existingPost[0].image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }
    
    await pool.execute(
      'UPDATE posts SET title = ?, description = ?, image = ?, date = ? WHERE id = ?',
      [title, description, imagePath, date, postId]
    );
    
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// ✅ Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    const [existingPost] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    if (existingPost.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    await pool.execute('DELETE FROM posts WHERE id = ?', [postId]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;

