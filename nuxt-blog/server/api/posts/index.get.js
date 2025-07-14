import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dataPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    if (!fs.existsSync(dataPath)) {
      // Create empty posts file if it doesn't exist
      const initialPosts = [
        {
          "id": 1,
          "title": "Welcome to My Blog",
          "description": "This is my first blog post. I'm excited to share my thoughts and experiences with you!",
          "image": "/images/welcome.jpg",
          "date": "2024-01-15"
        },
        {
          "id": 2,
          "title": "Learning Nuxt.js",
          "description": "Nuxt.js is an amazing framework for building Vue.js applications. Here's what I've learned so far.",
          "image": "/images/nuxt.jpg",
          "date": "2024-01-20"
        }
      ]
      fs.writeFileSync(dataPath, JSON.stringify(initialPosts, null, 2))
    }
    
    const data = fs.readFileSync(dataPath, 'utf8')
    const posts = JSON.parse(data)
    
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})