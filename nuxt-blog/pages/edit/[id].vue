<template>
  <div>
    <header class="header">
      <div class="container">
        <h1>Edit Post</h1>
        <p>Update your blog post</p>
      </div>
    </header>
    
    <main class="container" style="margin-top: 2rem;">
      <div v-if="pending" class="loading">Loading post...</div>
      
      <div v-else-if="error" class="error">
        Post not found or failed to load.
        <NuxtLink to="/" class="btn btn-primary" style="margin-left: 1rem;">
          Back to Home
        </NuxtLink>
      </div>
      
      <BlogForm v-else :post="post" />
    </main>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiURL = config.public.apiURL

const route = useRoute()
const postId = route.params.id

useHead({
  title: 'Edit Post - My Blog'
})

// Fetch post data from Express backend
const { data: post, pending, error } = await useFetch(`${apiURL}/posts/${postId}`)

// Handle post not found
if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found'
  })
}
</script>