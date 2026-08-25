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

const { currentProject, setCurrentProject, visibleProjects } = useProjectStore()

const selectedProject = computed<ProjectOption>({
  get: () => currentProject.value,
  set: (project) => {
    if (project) {
      setCurrentProject(project.id)
    }
  }
})

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
        <BaseIcon class="project-switcher__icon" name="chevron-down" />
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
            v-for="project in visibleProjects"
            :key="project.id"
            class="project-switcher__item"
            :value="project"
          >
            <span class="project-switcher__item-text">{{ project.title }}</span>
            <ComboboxItemIndicator class="project-switcher__indicator">
              <BaseIcon class="project-switcher__check" name="check" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
