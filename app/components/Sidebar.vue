<script setup lang="ts">
const mainMenu = [
  { title: 'Согласование', to: '/' },
  { title: 'Дизайн', to: '/design' },
  { title: 'Разработка', to: '/development' },
  { title: 'Деплой', to: '/deploy' },
  { title: 'Поддержка', to: '/support' }
]

const { openCreationModal } = useCreationModal()

const bottomMenu = [
  { title: 'Настройки', action: null },
  { title: 'Создать бриф', action: 'brief' as const },
  { title: 'Создать чеклист', action: 'checklist' as const }
]

const handleBottomAction = (action: (typeof bottomMenu)[number]['action']) => {
  if (!action) {
    return
  }

  openCreationModal(action)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <NuxtLink class="logo" to="/">Логотип</NuxtLink>
      <ProjectSwitcher />
    </div>

    <nav class="sidebar__nav" aria-label="Основное меню">
      <ul class="sidebar__list">
        <li v-for="item in mainMenu" :key="item.title" class="sidebar__item">
          <NuxtLink class="sidebar__link" :to="item.to">{{ item.title }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <nav class="sidebar__nav sidebar__nav--bottom" aria-label="Нижнее меню">
      <ul class="sidebar__list">
        <li v-for="item in bottomMenu" :key="item.title" class="sidebar__item">
          <button class="sidebar__link" type="button" @click="handleBottomAction(item.action)">
            {{ item.title }}
          </button>
        </li>
      </ul>
    </nav>

    <div class="sidebar__footer">
      <ThemeToggle />
      <UserMenu />
    </div>
  </aside>
</template>
