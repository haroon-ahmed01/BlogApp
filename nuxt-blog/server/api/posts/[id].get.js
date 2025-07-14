import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id'))
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    
    if (!fs.existsSync(dataPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Posts file not found'
      })
    }
    
    const data = fs.readFileSync(dataPath, 'utf8')
    const posts = JSON.parse(data)
    
    const post = posts.find(post => post.id === id)
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }
    
    return post
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch post'
    })
  }
})