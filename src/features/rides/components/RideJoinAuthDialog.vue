<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const titleId = useId()
const panel = ref<HTMLElement | null>(null)

/**
 * Tras el acceso vuelve a la ruta desde la que se intentó participar. Se lee del
 * `location` en vez del router para no depender de inyectarlo en este diálogo.
 */
const redirect = computed(() => `${window.location.pathname}${window.location.search}`)

const focusablesSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(focusablesSelector))
}

function focusInitialElement(): void {
  const target = focusables()[0] ?? panel.value
  target?.focus()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
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
</script>

<template>
  <Teleport to="body">
    <Transition name="ride-auth-dialog">
      <div v-if="open" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/45" aria-hidden="true" @click="emit('close')" />

        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="relative flex w-full max-w-md flex-col rounded-card border border-line bg-canvas shadow-lift focus:outline-none"
        >
          <div class="flex items-start justify-between gap-4 border-b border-line p-6 pb-4">
            <h2 :id="titleId" class="text-lg font-semibold tracking-tight text-ink">
              Inicia sesión para participar
            </h2>

            <button
              type="button"
              class="-m-1 rounded-btn p-1 text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              aria-label="Cerrar"
              data-dialog-close
              @click="emit('close')"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div class="p-6 pt-4">
            <p class="text-sm text-graphite">
              Necesitas una cuenta para inscribirte en esta ruta y ver quién va contigo. Inicia
              sesión o regístrate y volverás justo aquí.
            </p>

            <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                to="/register"
                variant="outline"
                data-dialog-register
                @click="emit('close')"
              >
                Registrarse
              </Button>
              <Button :to="{ path: '/login', query: { redirect } }" data-dialog-login>
                Iniciar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ride-auth-dialog-enter-active,
.ride-auth-dialog-leave-active {
  transition: opacity 0.18s ease;
}

.ride-auth-dialog-enter-active > div:last-child,
.ride-auth-dialog-leave-active > div:last-child {
  transition: transform 0.18s ease;
}

.ride-auth-dialog-enter-from,
.ride-auth-dialog-leave-to {
  opacity: 0;
}

.ride-auth-dialog-enter-from > div:last-child,
.ride-auth-dialog-leave-to > div:last-child {
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ride-auth-dialog-enter-active,
  .ride-auth-dialog-leave-active,
  .ride-auth-dialog-enter-active > div:last-child,
  .ride-auth-dialog-leave-active > div:last-child {
    transition: none;
  }
}
</style>
