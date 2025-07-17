<template>
  <div class="card">
    <h2>{{ isEdit ? 'Edit Post' : 'Create New Post' }}</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="5"
          required
        ></textarea>
      </div>

      <!-- Use the ImageUpload component -->
      <ImageUpload v-model="form.image" />

      <div class="form-group">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          class="form-control"
          required
        />
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-success" :disabled="loading">
          {{ loading ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post') }}
        </button>
        <NuxtLink to="/" class="btn btn-cancel">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiURL = config.public.apiURL

const props = defineProps({
  post: {
    type: Object,
    default: null
  }
})

const isEdit = computed(() => !!props.post)
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  title: props.post?.title || '',
  description: props.post?.description || '',
  image: props.post?.image || '',
  date: props.post?.date || new Date().toISOString().split('T')[0]
})

const submitForm = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('date', form.date)
    formData.append('imageUrl', form.image || '') // Send the image URL/path

    let response
    if (isEdit.value) {
      response = await $fetch(`${apiURL}/posts/${props.post.id}`, {
        method: 'PUT',
        body: formData
      })
    } else {
      response = await $fetch(`${apiURL}/posts`, {
        method: 'POST',
        body: formData
      })
    }

    success.value = isEdit.value ? 'Post updated successfully!' : 'Post created successfully!'
    
    // Navigate after a short delay to show success message
    setTimeout(() => {
      navigateTo('/')
    }, 1000)
    
  } catch (err) {
    console.error('Error saving post:', err)
    error.value = err.data?.error || 'Failed to save post'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #333;
}

.card h2 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #fff;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #2a2a2a;
  color: #fff;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #666;
}

.form-control::placeholder {
  color: #888;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: #4F46E5;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #4338CA;
}

.btn-cancel {
  background: #374151;
  color: white;
}

.btn-cancel:hover {
  background: #4B5563;
}

.error {
  color: #fff;
  background: #EF4444;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success {
  color: #fff;
  background: #10B981;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .card {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>