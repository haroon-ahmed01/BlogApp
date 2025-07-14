<template>
  <div class="image-upload">
    <div class="form-group">
      <label for="image-upload">Upload Image</label>
      <div class="upload-container">
        <input
          id="image-upload"
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="file-input"
        />
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <div v-if="uploading" class="upload-loading">
            <div class="spinner"></div>
            <p>Uploading...</p>
          </div>
          <div v-else-if="previewUrl" class="preview-container">
            <img :src="previewUrl" :alt="fileName" class="preview-image" @error="handleImageError" />
            <div class="preview-overlay">
              <button @click.stop="removeImage" class="remove-btn">×</button>
            </div>
            <div class="upload-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
              <span>Image uploaded successfully!</span>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <p>Click to upload or drag and drop</p>
            <p class="upload-hint">PNG, JPG, GIF, WebP up to 5MB</p>
          </div>
        </div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
    
    <!-- Alternative: Manual URL input - only show when no image is uploaded -->
    <div v-if="!previewUrl" class="form-group">
      <label for="image-url">Or enter image URL</label>
      <input
        id="image-url"
        v-model="imageUrl"
        type="url"
        class="form-control"
        placeholder="https://example.com/image.jpg"
        @input="handleUrlInput"
      />
    </div>
    
    <!-- Show current image URL when image is selected -->
    <div v-else class="form-group">
      <label>Selected Image URL:</label>
      <div class="url-display">
        <code>{{ imageUrl }}</code>
        <button @click="removeImage" class="btn-change">Change Image</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const error = ref('')
const previewUrl = ref('')
const fileName = ref('')
const imageUrl = ref('')

// Initialize with existing value
onMounted(() => {
  if (props.modelValue) {
    imageUrl.value = props.modelValue
    previewUrl.value = props.modelValue
    fileName.value = 'Current image'
  }
})

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== imageUrl.value) {
    imageUrl.value = newValue
    previewUrl.value = newValue
    fileName.value = 'Current image'
  } else if (!newValue) {
    imageUrl.value = ''
    previewUrl.value = ''
    fileName.value = ''
  }
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadFile(file)
  }
}

const uploadFile = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size must be less than 5MB'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    // Create a local preview first
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
      fileName.value = file.name
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)

    // Use Nuxt's $fetch with proper error handling
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      // In Nuxt 3, files in public directory are served from root
      const serverUrl = response.url // This should be like "/uploads/filename.webp"
      
      previewUrl.value = serverUrl
      fileName.value = response.originalName || file.name
      imageUrl.value = serverUrl
      emit('update:modelValue', serverUrl)
    } else {
      throw new Error(response.message || 'Upload failed')
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = err.data?.message || err.message || 'Failed to upload image'
    // Keep the local preview if upload fails
  } finally {
    uploading.value = false
  }
}

const handleUrlInput = () => {
  error.value = ''
  if (imageUrl.value) {
    // Validate URL format
    try {
      new URL(imageUrl.value)
      previewUrl.value = imageUrl.value
      fileName.value = 'External image'
      emit('update:modelValue', imageUrl.value)
    } catch (e) {
      error.value = 'Please enter a valid image URL'
      previewUrl.value = ''
      fileName.value = ''
      emit('update:modelValue', '')
    }
  } else {
    previewUrl.value = ''
    fileName.value = ''
    emit('update:modelValue', '')
  }
}

const handleImageError = (event) => {
  console.error('Image failed to load:', previewUrl.value)
  console.error('Image error event:', event)
  error.value = 'Failed to load image. Please check the URL or try uploading again.'
}

const removeImage = () => {
  previewUrl.value = ''
  fileName.value = ''
  imageUrl.value = ''
  error.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.image-upload {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.upload-container {
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-area:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-placeholder svg {
  margin-bottom: 1rem;
  color: #adb5bd;
}

.upload-placeholder p {
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #adb5bd;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  min-height: 150px;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  display: block;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c82333;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.url-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.url-display code {
  flex: 1;
  min-width: 0;
  background: none;
  padding: 0;
  font-size: 0.875rem;
  color: #495057;
  word-break: break-all;
}

.btn-change {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-change:hover {
  background: #5a6fd8;
}

.upload-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  font-size: 0.875rem;
  width: 100%;
  justify-content: center;
}

.upload-success svg {
  flex-shrink: 0;
  color: #28a745;
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .upload-area {
    padding: 1rem;
    min-height: 150px;
  }
  
  .upload-placeholder svg {
    width: 32px;
    height: 32px;
  }
  
  .upload-placeholder p {
    font-size: 0.875rem;
  }
  
  .upload-hint {
    font-size: 0.75rem;
  }
  
  .preview-image {
    max-height: 250px;
  }
  
  .url-display {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .url-display code {
    font-size: 0.75rem;
  }
  
  .btn-change {
    width: 100%;
  }
  
  .upload-success {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
  
  .upload-success span {
    font-size: 0.75rem;
  }
}

/* Tablet Responsive Design */
@media (min-width: 769px) and (max-width: 1024px) {
  .preview-image {
    max-width: 400px;
    max-height: 300px;
  }
  
  .upload-area {
    padding: 1.75rem;
  }
}

/* Large Screen Optimization */
@media (min-width: 1025px) {
  .preview-image {
    max-width: 600px;
    max-height: 450px;
  }
  
  .upload-area {
    padding: 2rem;
    min-height: 220px;
  }
}

/* Extra Large Screen Optimization */
@media (min-width: 1440px) {
  .preview-image {
    max-width: 700px;
    max-height: 500px;
  }
  
  .upload-area {
    padding: 2.5rem;
    min-height: 240px;
  }
}

/* Ultra-wide Screen Optimization */
@media (min-width: 1920px) {
  .preview-image {
    max-width: 800px;
    max-height: 600px;
  }
  
  .upload-area {
    padding: 3rem;
    min-height: 280px;
  }
}
</style>