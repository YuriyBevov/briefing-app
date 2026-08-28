<script setup lang="ts">
const { canUsePermission, data, getSectionPermissionId } = useProjectStore()
const legacySectionRoutes: Record<string, string> = {
  'section-approval': '/',
  'section-design': '/design',
  'section-development': '/development',
  'section-deploy': '/deploy',
  'section-support': '/support'
}
const getSectionRoute = (sectionId: string) => legacySectionRoutes[sectionId] ?? `/sections/${sectionId}`
const visibleSections = computed(() =>
  data.value.sections.filter((section) =>
    section.isActive && canUsePermission(getSectionPermissionId(section.id)).value
  )
)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <NuxtLink class="logo" to="/" aria-label="На главную">
        <img class="logo__image" src="/lw-logo.svg" alt="Little Web" />
      </NuxtLink>
    </div>

    <div class="sidebar__content">
      <div class="sidebar__project">
        <ProjectSwitcher />
      </div>

      <nav class="sidebar__nav" aria-label="Основное меню">
        <ul class="sidebar__list">
          <li v-for="section in visibleSections" :key="section.id" class="sidebar__item">
            <NuxtLink class="sidebar__link" :to="getSectionRoute(section.id)">
              {{ section.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

    </div>

    <div class="sidebar__footer">
      <UserMenu />
      <ThemeToggle />
    </div>
  </aside>
</template>
