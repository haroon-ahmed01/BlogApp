<template>
  <div class="card">
    <h2>{{ isEdit ? 'Edit Post' : 'Create New Post' }}</h2>
    
    <div v-if="error" class="error">{{ error }}</div>
    
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
      
      <!-- Replace the old image input with the new ImageUpload component -->
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
        <NuxtLink to="/" class="btn btn-primary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    default: null
  }
})

const isEdit = computed(() => !!props.post)
const loading = ref(false)
const error = ref('')

const form = reactive({
  title: props.post?.title || '',
  description: props.post?.description || '',
  image: props.post?.image || '',
  date: props.post?.date || new Date().toISOString().split('T')[0]
})

const submitForm = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Set default image if none provided
    if (!form.image) {
      form.image = '/images/default.jpg'
    }
    
    if (isEdit.value) {
      await $fetch(`/api/posts/${props.post.id}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/posts', {
        method: 'POST',
        body: form
      })
    }
    
    await navigateTo('/')
  } catch (err) {
    error.value = 'Failed to save post'
  } finally {
    loading.value = false
  }
}
</script>