<script setup lang="ts">
const pageTitle = useState('app-page-title', () => 'Раздел')
const activeSideRailPanel = useState<'comments' | 'notes' | ''>('active-side-rail-panel', () => '')
const isSideRailOpen = computed(() => Boolean(activeSideRailPanel.value))
</script>

<template>
  <div class="app-shell">
    <Sidebar />

    <div class="app-shell__main">
      <Topbar
        :title="pageTitle"
      />

      <main class="app-shell__content" :class="{ 'app-shell__content--side-rail-open': isSideRailOpen }">
        <div class="app-shell__workspace">
          <slot />
        </div>
      </main>

      <footer class="app-footer">
        <span class="app-footer__text">Разработано</span>
        <a class="app-footer__link" href="https://yuriybevov.ru" target="_blank" rel="noopener noreferrer" aria-label="Перейти на сайт Yuriy Bevov">
          <AppFooterLogo />
        </a>
      </footer>
    </div>

    <SideRail />

    <CreationModal />
  </div>
</template>
