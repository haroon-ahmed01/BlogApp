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
    let posts = JSON.parse(data)
    
    const postIndex = posts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }
    
    // Remove post
    posts.splice(postIndex, 1)
    
    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2))
    
    return { success: true, message: 'Post deleted successfully' }
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete post'
    })
  }
})