<script setup lang="ts">
const route = useRoute()
const { currentProject } = useProjectStore()
const legacySectionPaths = ['/', '/design', '/development', '/deploy', '/support']
const shouldShowComments = computed(() =>
  legacySectionPaths.includes(route.path) || route.path.startsWith('/sections/')
)
</script>

<template>
  <div class="app-shell">
    <Sidebar />

    <div class="app-shell__main">
      <Topbar
        :project-title="currentProject.title"
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
