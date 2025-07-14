// server/api/upload.post.js
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)
    
    if (!form || !form.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const file = form.find(item => item.name === 'file')
    
    if (!file || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file data found'
      })
    }

    // Validate file type
    if (!file.type?.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only image files are allowed'
      })
    }

    // Validate file size (5MB)
    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File size must be less than 5MB'
      })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.filename || '')
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    
    // Create uploads directory in public folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filePath = path.join(uploadsDir, uniqueFilename)
    await fs.writeFile(filePath, file.data)

    // Return the public URL (Nuxt serves files from public directory at root)
    const publicUrl = `/uploads/${uniqueFilename}`

    return {
      success: true,
      url: publicUrl,
      originalName: file.filename,
      size: file.data.length,
      type: file.type
    }

  } catch (error) {
    console.error('Upload error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Upload failed'
    })
  }
})