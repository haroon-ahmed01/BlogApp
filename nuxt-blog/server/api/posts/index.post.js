import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    console.log('Full file path:', dataPath);

    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dataPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Read existing posts
    let posts = []
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8')
      posts = JSON.parse(data)
    }
    
    // Create new post
    const newPost = {
      id: Date.now(),
      title: body.title,
      description: body.description,
      image: body.image || '/images/default.jpg',
      date: body.date || new Date().toISOString().split('T')[0]
    }
    
    posts.push(newPost)
    
    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2))
    
    return newPost
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post'
    })
  }
})