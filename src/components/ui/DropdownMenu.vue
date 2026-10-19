<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Button from '@/components/ui/Button.vue'
import type { ButtonSize, ButtonVariant } from '@/design-system'

interface Props {
  /** Nombre accesible del menú (`role="menu"`). */
  label: string
  /**
   * Nombre accesible del disparador, para cuando su contenido es solo
   * decorativo (p. ej. un icono). Se omite si el slot ya tiene texto.
   */
  triggerLabel?: string
  /** Variante del disparador cuando se renderiza con `Button`. */
  triggerVariant?: ButtonVariant
  /** Tamaño del disparador cuando se renderiza con `Button`. */
  triggerSize?: ButtonSize
  /** Clases propias del disparador; solo se usa si no hay variante de `Button`. */
  triggerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  triggerLabel: undefined,
  triggerVariant: undefined,
  triggerSize: undefined,
  triggerClass: undefined,
})

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => {
  isOpen.value = false
})

async function open(): Promise<void> {
  isOpen.value = true
  await nextTick()
  const first = menuRef.value?.querySelector<HTMLElement>('[role="menuitem"]')
  first?.focus()
}

function close(options?: { restoreFocus?: boolean }): void {
  isOpen.value = false
  if (options?.restoreFocus === false) return
  // El foco se devuelve al instante y de nuevo tras el render: retirar el
  // menú del DOM puede vaciar el foco en algunos entornos.
  triggerRef.value?.focus()
  void nextTick(() => {
    triggerRef.value?.focus()
  })
}

function toggle(): void {
  if (isOpen.value) close()
  else void open()
}

function menuItems(): HTMLElement[] {
  const root = menuRef.value
  if (root === null) return []
  return Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]'))
}

function focusItem(index: number): void {
  const items = menuItems()
  if (items.length === 0) return
  const bounded = Math.min(Math.max(index, 0), items.length - 1)
  items[bounded]?.focus()
}

function focusLastItem(): void {
  const items = menuItems()
  focusItem(items.length - 1)
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    void open()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    isOpen.value = true
    void nextTick(focusLastItem)
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  const items = menuItems()
  const currentIndex = items.findIndex((item) => item === document.activeElement)

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'Tab') {
    close({ restoreFocus: false })
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusItem(currentIndex + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusItem(currentIndex - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusItem(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusItem(items.length - 1)
  }
}

/** Un clic sobre un elemento cierra el menú; el foco vuelve al disparador. */
function onMenuClick(event: MouseEvent): void {
  const target = event.target
  if (target instanceof Element && target.closest('[role="menuitem"]') !== null) {
    close()
  }
}

/** Fija el elemento del disparador (nativo o `Button`) para devolverle el foco. */
function setTriggerRef(element: unknown): void {
  if (element instanceof HTMLElement) {
    triggerRef.value = element
  }
}
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <Button
      v-if="props.triggerVariant !== undefined"
      ref="setTriggerRef"
      :variant="props.triggerVariant"
      :size="props.triggerSize ?? 'md'"
      :aria-label="props.triggerLabel"
      :title="props.triggerLabel"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :is-open="isOpen" />
    </Button>
    <button
      v-else
      ref="setTriggerRef"
      type="button"
      :class="props.triggerClass"
      :aria-label="props.triggerLabel"
      :title="props.triggerLabel"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :is-open="isOpen" />
    </button>

    <div
      v-if="isOpen"
      ref="menuRef"
      role="menu"
      :aria-label="props.label"
      class="absolute right-0 z-[500] mt-1 min-w-56 overflow-hidden rounded-field border border-line bg-white py-1 shadow-lift"
      @keydown="onMenuKeydown"
      @click="onMenuClick"
    >
      <slot />
    </div>
  </div>
</template>
