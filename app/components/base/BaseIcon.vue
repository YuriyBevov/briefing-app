<script setup lang="ts">
import type { Component } from 'vue'
import {
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  History,
  Lock,
  LockOpen,
  LogOut,
  Maximize2,
  MessageSquare,
  Moon,
  Pencil,
  SendHorizontal,
  StickyNote,
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
  | 'history'
  | 'lock'
  | 'logout'
  | 'maximize'
  | 'message'
  | 'moon'
  | 'note'
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
  history: History,
  lock: Lock,
  logout: LogOut,
  maximize: Maximize2,
  message: MessageSquare,
  moon: Moon,
  note: StickyNote,
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
