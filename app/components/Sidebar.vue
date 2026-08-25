<script setup lang="ts">
const mainMenu = [
  { title: 'Согласование', to: '/' },
  { title: 'Дизайн', to: '/design' },
  { title: 'Разработка', to: '/development' },
  { title: 'Деплой', to: '/deploy' },
  { title: 'Поддержка', to: '/support' }
]

const { openCreationModal } = useCreationModal()

const createMenu = [
  { title: 'Создать бриф', action: 'brief' as const },
  { title: 'Создать чеклист', action: 'checklist' as const }
]

const utilityMenu = [
  { title: 'Настройки', to: null },
  { title: 'UI-компоненты', to: '/ui-components' }
]

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
          <li v-for="item in mainMenu" :key="item.title" class="sidebar__item">
            <NuxtLink class="sidebar__link" :to="item.to">{{ item.title }}</NuxtLink>
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
          <li v-for="item in utilityMenu" :key="item.title" class="sidebar__item">
            <NuxtLink v-if="item.to" class="sidebar__link" :to="item.to">{{ item.title }}</NuxtLink>
            <button v-else class="sidebar__link" type="button">{{ item.title }}</button>
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
