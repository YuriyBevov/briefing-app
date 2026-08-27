<script setup lang="ts">
const { currentProject } = useProjectStore()
</script>

<template>
  <div class="app-shell">
    <Sidebar />

    <div class="app-shell__main">
      <Topbar
        :project-title="currentProject.title"
      />

      <main class="app-shell__content">
        <div class="app-shell__workspace">
          <slot />
        </div>
      </main>

      <footer class="app-footer">Сделано&nbsp;в</footer>
    </div>

    <SideRail />

    <CreationModal />
  </div>
</template>
