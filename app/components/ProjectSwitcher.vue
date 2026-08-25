<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport
} from 'reka-ui'

type ProjectOption = {
  id: string
  title: string
}

const projects: ProjectOption[] = [
  { id: 'brief-os', title: 'Brief OS' },
  { id: 'landing-pack', title: 'Landing Pack' },
  { id: 'support-flow', title: 'Support Flow' },
  { id: 'design-kit', title: 'Design Kit' }
]

const selectedProject = ref<ProjectOption>(projects[0])

const displayProject = (project?: ProjectOption) => project?.title ?? ''
</script>

<template>
  <ComboboxRoot
    v-model="selectedProject"
    class="project-switcher"
    by="id"
    :open-on-click="true"
    :open-on-focus="true"
  >
    <ComboboxLabel class="project-switcher__label">Проект</ComboboxLabel>

    <ComboboxAnchor class="project-switcher__anchor">
      <ComboboxInput
        class="project-switcher__control"
        placeholder="Найти проект"
        :display-value="displayProject"
      />
      <ComboboxTrigger class="project-switcher__trigger" aria-label="Открыть список проектов">
        <svg class="project-switcher__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        class="project-switcher__content"
        position="popper"
        :side-offset="4"
        :collision-padding="16"
      >
        <ComboboxViewport class="project-switcher__viewport">
          <ComboboxEmpty class="project-switcher__empty">Проекты не найдены</ComboboxEmpty>
          <ComboboxItem
            v-for="project in projects"
            :key="project.id"
            class="project-switcher__item"
            :value="project"
          >
            <span class="project-switcher__item-text">{{ project.title }}</span>
            <ComboboxItemIndicator class="project-switcher__indicator">
              <svg class="project-switcher__check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 4 4 10-10" />
              </svg>
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
