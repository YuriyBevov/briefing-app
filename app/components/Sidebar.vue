<script setup lang="ts">
const { openCreationModal } = useCreationModal()

const createMenu = [
  { title: 'Создать бриф', action: 'brief' as const },
  { title: 'Создать чеклист', action: 'checklist' as const }
]

const utilityMenu = [
  { title: 'Настройки', to: '/settings', permission: 'view_settings' as const },
  { title: 'UI-компоненты', to: '/ui-components', permission: 'view_ui_components' as const }
]

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
const visibleUtilityMenu = computed(() =>
  utilityMenu.filter((item) => !item.permission || canUsePermission(item.permission).value)
)

const handleCreateAction = (action: (typeof createMenu)[number]['action']) => {
  openCreationModal(action)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <NuxtLink class="logo" to="/">Логотип</NuxtLink>
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

      <nav class="sidebar__nav sidebar__nav--create" aria-label="Создание">
        <ul class="sidebar__list">
          <li v-for="item in createMenu" :key="item.title" class="sidebar__item">
            <button class="sidebar__link" type="button" @click="handleCreateAction(item.action)">
              {{ item.title }}
            </button>
          </li>
        </ul>
      </nav>

      <nav class="sidebar__nav sidebar__nav--utility" aria-label="Настройки">
        <ul class="sidebar__list">
          <li v-for="item in visibleUtilityMenu" :key="item.title" class="sidebar__item">
            <NuxtLink class="sidebar__link" :to="item.to">{{ item.title }}</NuxtLink>
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
