<script setup lang="ts">
const project = {
  title: 'Brief OS'
}
</script>

<template>
  <div class="app-shell">
    <Sidebar />

    <div class="app-shell__main">
      <Topbar
        :project-title="project.title"
      />

      <main class="app-shell__content">
        <div class="app-shell__workspace">
          <slot />
        </div>

        <CommentsPanel />
      </main>

      <footer class="app-footer">Сделано&nbsp;в</footer>
    </div>
  </div>
</template>
