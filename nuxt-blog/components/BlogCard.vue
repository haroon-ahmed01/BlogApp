<template>   
  <div class="card">     
    <img        
      :src="getImageUrl(post.image)"        
      :alt="post.title"        
      class="blog-image"       
      @error="handleImageError"       
      @load="handleImageLoad"     
    />     
    <div class="blog-date">{{ formatDate(post.date) }}</div>     
    <h3 class="blog-title">{{ post.title }}</h3>     
    <p class="blog-description">{{ post.description }}</p>     
    <div class="actions">       
      <NuxtLink :to="`/edit/${post.id}`" class="btn btn-primary">         
        Edit       
      </NuxtLink>       
      <button @click="deletePost" class="btn btn-secondary">         
        Delete       
      </button>     
    </div>   
  </div> 
</template>  

<script setup> 
const props = defineProps({   
  post: {     
    type: Object,     
    required: true   
  } 
})  

const emit = defineEmits(['delete'])  

// Get the configuration for your Express server 
const config = useRuntimeConfig() 
const apiURL = config.public.apiURL || 'http://localhost:5001/api' 
const baseURL = config.public.apiURL.replace('/api', '') || 'http://localhost:5001' // For serving static files  

const formatDate = (date) => {   
  return new Date(date).toLocaleDateString('en-US', {     
    year: 'numeric',     
    month: 'long',     
    day: 'numeric'   
  }) 
}  

const getImageUrl = (imagePath) => {   
  // Handle different image path formats   
  if (!imagePath) return `${baseURL}/images/default.jpg`      
  
  // If it's already a full URL, return as is   
  if (imagePath.startsWith('http')) return imagePath      
  
  // If it starts with /, it's a relative path from your Express server   
  if (imagePath.startsWith('/')) {     
    const fullUrl = `${baseURL}${imagePath}`     
    console.log('Image URL constructed:', fullUrl) // Debug log     
    return fullUrl   
  }      
  
  // Otherwise, assume it's a filename in uploads   
  const fullUrl = `${baseURL}/uploads/${imagePath}`   
  console.log('Image URL constructed:', fullUrl) // Debug log   
  return fullUrl 
}  

const handleImageError = (event) => {   
  console.error('Image failed to load:', event.target.src)   
  console.log('Post image path:', props.post.image)   
  // Fallback to default image   
  event.target.src = `${baseURL}/images/default.jpg` 
}  

const handleImageLoad = (event) => {   
  console.log('Image loaded successfully:', event.target.src) 
}  

const deletePost = async () => {   
  if (confirm('Are you sure you want to delete this post?')) {     
    try {       
      const response = await fetch(`${apiURL}/posts/${props.post.id}`, {         
        method: 'DELETE',         
        headers: {           
          'Content-Type': 'application/json'         
        }       
      })              
      
      if (!response.ok) {         
        throw new Error('Failed to delete post')       
      }              
      
      const result = await response.json()       
      emit('delete', props.post.id)     
    } catch (error) {       
      console.error('Delete error:', error)       
      alert('Failed to delete post')     
    }   
  } 
} 
</script>  

<style scoped> 
.card {   
  background: #2d3748;   
  border: 1px solid #4a5568;   
  border-radius: 8px;   
  padding: 20px;   
  margin-bottom: 20px;   
  transition: all 0.2s ease; 
}  

.card:hover {   
  border-color: #6b7280; 
}  

.blog-image {   
  width: 100%;   
  height: 200px;   
  object-fit: cover;   
  border-radius: 6px;   
  margin-bottom: 16px;   
  background: #374151; 
}  

.blog-date {   
  color: #9ca3af;   
  font-size: 0.875rem;   
  margin-bottom: 8px;   
  font-weight: 400; 
}  

.blog-title {   
  margin: 0 0 12px 0;   
  font-size: 1.25rem;   
  font-weight: 600;   
  color: #ffffff;   
  line-height: 1.4; 
}  

.blog-description {   
  color: #d1d5db;   
  margin-bottom: 20px;   
  line-height: 1.5;   
  font-size: 0.95rem; 
}  

.actions {   
  display: flex;   
  gap: 12px; 
}  

.btn {   
  padding: 8px 16px;   
  border: none;   
  border-radius: 6px;   
  cursor: pointer;   
  text-decoration: none;   
  display: inline-block;   
  font-size: 0.875rem;   
  font-weight: 500;   
  transition: all 0.2s ease;   
  text-align: center; 
}  

.btn-primary {   
  background: #7c3aed;   
  color: white; 
}  

.btn-primary:hover {   
  background: #6d28d9; 
}  

.btn-secondary {   
  background: #4b5563;   
  color: #d1d5db; 
}  

.btn-secondary:hover {   
  background: #374151;   
  color: #ffffff; 
} 
</style>