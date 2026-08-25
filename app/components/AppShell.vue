<script setup lang="ts">
const route = useRoute()
const project = {
  title: 'Brief OS'
}
const shouldShowComments = computed(() => route.path !== '/settings')
</script>

<template>
  <div class="app-shell">
    <Sidebar />

    <div class="app-shell__main">
      <Topbar
        :project-title="project.title"
      />

      <main class="app-shell__content" :class="{ 'app-shell__content--wide': !shouldShowComments }">
        <div class="app-shell__workspace">
          <slot />
        </div>

        <CommentsPanel v-if="shouldShowComments" />
      </main>

      <footer class="app-footer">Сделано&nbsp;в</footer>
    </div>

    <CreationModal />
  </div>
</template>
