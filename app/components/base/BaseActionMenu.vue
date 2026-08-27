<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: 'Действия'
})

const menuElement = ref<HTMLDetailsElement | null>(null)

const closeMenu = () => {
  if (menuElement.value) {
    menuElement.value.open = false
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Node) || menuElement.value?.contains(target)) {
    return
  }

  closeMenu()
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <details ref="menuElement" class="action-menu" @click.stop>
    <summary class="action-menu__toggle" :aria-label="label" :title="label">
      <BaseIcon class="action-menu__toggle-icon" name="menu" />
    </summary>
    <div class="action-menu__list">
      <slot />
    </div>
  </details>
</template>
