<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import Button from '@/components/ui/Button.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'default' | 'danger'
    isBusy?: boolean
  }>(),
  {
    description: undefined,
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    tone: 'default',
    isBusy: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const descriptionId = useId()

const panel = ref<HTMLElement | null>(null)

const focusablesSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(focusablesSelector))
}

function focusInitialElement(): void {
  // En acciones irreversibles el foco arranca en "Cancelar" para evitar confirmaciones accidentales.
  const target = focusables()[0] ?? panel.value
  target?.focus()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    if (!props.isBusy) emit('cancel')
    return
  }

  if (event.key !== 'Tab') return

  const elements = focusables()
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) return

  const active = document.activeElement

  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

let previousOverflow = ''

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
      void nextTick(focusInitialElement)
      return
    }

    document.body.style.overflow = previousOverflow
    document.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  document.removeEventListener('keydown', handleKeydown)
})

function handleBackdropClick(): void {
  if (!props.isBusy) emit('cancel')
}

function handleConfirm(): void {
  if (props.isBusy) return
  emit('confirm')
}

const confirmVariant = computed(() => (props.tone === 'danger' ? 'destructive' : 'primary'))
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/45" aria-hidden="true" @click="handleBackdropClick" />

        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          tabindex="-1"
          class="relative w-full max-w-md rounded-card border border-line bg-canvas p-6 shadow-lift focus:outline-none"
        >
          <h2 :id="titleId" class="text-lg font-semibold tracking-tight text-ink">
            {{ title }}
          </h2>

          <p v-if="description" :id="descriptionId" class="mt-2 text-sm leading-6 text-graphite">
            {{ description }}
          </p>

          <div
            class="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-dialog-cancel
              :disabled="isBusy"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </Button>

            <Button
              type="button"
              :variant="confirmVariant"
              size="sm"
              :loading="isBusy"
              :disabled="isBusy"
              data-dialog-confirm
              @click="handleConfirm"
            >
              {{ confirmLabel }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.18s ease;
}

.confirm-dialog-enter-active > div:last-child,
.confirm-dialog-leave-active > div:last-child {
  transition: transform 0.18s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from > div:last-child,
.confirm-dialog-leave-to > div:last-child {
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .confirm-dialog-enter-active,
  .confirm-dialog-leave-active,
  .confirm-dialog-enter-active > div:last-child,
  .confirm-dialog-leave-active > div:last-child {
    transition: none;
  }
}
</style>
