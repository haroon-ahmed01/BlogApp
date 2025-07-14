<template>
  <div>
    <header class="header">
      <div class="container">
        <h1>Create New Post</h1>
        <p>Share your thoughts with the world</p>
      </div>
    </header>
    
    <main class="container" style="margin-top: 2rem;">
      <BlogForm />
    </main>
  </div>
</template>

<script setup>
useHead({
  title: 'Create New Post - My Blog'
})
</script>