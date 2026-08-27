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
  Menu,
  MessageSquare,
  Moon,
  PanelTop,
  Pencil,
  Plus,
  SendHorizontal,
  Settings,
  StickyNote,
  Sun,
  Trash2,
  X
} from '@lucide/vue'

export type BaseIconName =
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
  | 'menu'
  | 'message'
  | 'moon'
  | 'note'
  | 'panel'
  | 'plus'
  | 'send'
  | 'settings'
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
  menu: Menu,
  message: MessageSquare,
  moon: Moon,
  note: StickyNote,
  panel: PanelTop,
  plus: Plus,
  send: SendHorizontal,
  settings: Settings,
  sun: Sun,
  unlock: LockOpen,
  trash: Trash2
}

const icon = computed(() => icons[props.name])
</script>

<template>
  <component :is="icon" aria-hidden="true" />
</template>
