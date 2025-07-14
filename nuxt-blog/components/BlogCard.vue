<template>
  <div class="card">
    <img :src="post.image" :alt="post.title" class="blog-image" />
    <div class="blog-date">{{ formatDate(post.date) }}</div>
    <h3 class="blog-title">{{ post.title }}</h3>
    <p class="blog-description">{{ post.description }}</p>
    <div class="actions">
      <NuxtLink :to="`/edit/${post.id}`" class="btn btn-primary">
        Edit
      </NuxtLink>
      <button @click="deletePost" class="btn btn-danger">
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const deletePost = async () => {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      await $fetch(`/api/posts/${props.post.id}`, {
        method: 'DELETE'
      })
      emit('delete', props.post.id)
    } catch (error) {
      alert('Failed to delete post')
    }
  }
}
</script>