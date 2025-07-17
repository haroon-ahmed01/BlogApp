<template>
  <div>
    <header class="header">
      <div class="container">
        <h1>My Blog</h1>
        <p>Welcome to my personal blog where I share my thoughts and experiences</p>
      </div>
    </header>
    
    <main class="container">
      <div style="text-align: center; margin: 2rem 0;">
        <NuxtLink to="/create" class="btn btn-primary">Create New Post</NuxtLink>
      </div>
      
      <div v-if="pending" class="loading">Loading posts...</div>
      
      <div v-else-if="error" class="error">
        Failed to load posts. Please try again.
      </div>
      
      <div v-else-if="posts.length === 0" class="empty-state">
        <h2>No posts yet</h2>
        <p>Start by creating your first blog post!</p>
        <NuxtLink to="/create" class="btn btn-primary">Create First Post</NuxtLink>
      </div>
      
      <div v-else class="blog-grid">
        <BlogCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @delete="handleDelete"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiURL = config.public.apiURL

// SEO
useHead({
  title: 'My Blog - Home',
  meta: [
    { name: 'description', content: 'Welcome to my personal blog' }
  ]
})

// Fetch posts from Express backend
const { data: posts, pending, error, refresh } = await useFetch(`${apiURL}/posts`)

const handleDelete = (postId) => {
  refresh()
}
</script>