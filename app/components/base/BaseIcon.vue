<script setup lang="ts">
import type { Component } from 'vue'
import {
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  Lock,
  LockOpen,
  Maximize2,
  Moon,
  Pencil,
  SendHorizontal,
  Sun,
  Trash2,
  X
} from '@lucide/vue'

type BaseIconName =
  | 'check'
  | 'copy'
  | 'edit'
  | 'chevron-down'
  | 'close'
  | 'drag-handle'
  | 'lock'
  | 'maximize'
  | 'moon'
  | 'send'
  | 'sun'
  | 'unlock'
  | 'trash'

const props = defineProps<{
  name: BaseIconName
}>()

const icons: Record<BaseIconName, Component> = {
  check: Check,
  copy: Copy,
  edit: Pencil,
  'chevron-down': ChevronDown,
  close: X,
  'drag-handle': GripVertical,
  lock: Lock,
  maximize: Maximize2,
  moon: Moon,
  send: SendHorizontal,
  sun: Sun,
  unlock: LockOpen,
  trash: Trash2
}

const icon = computed(() => icons[props.name])
</script>

<template>
  <component :is="icon" aria-hidden="true" />
</template>
