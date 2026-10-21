<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBold, faItalic, faLink, faList } from '@fortawesome/free-solid-svg-icons'
import Textarea from '@/components/ui/Textarea.vue'
import {
  BOLD_MARKER,
  ITALIC_MARKER,
  LIST_PREFIX,
  prefixLines,
  wrapInline,
  wrapLink,
  type TextEdit,
} from '@/utils/textFormat'

withDefaults(
  defineProps<{
    id: string
    name?: string
    rows?: number
    minlength?: number
    maxlength?: number
    placeholder?: string
    required?: boolean
    disabled?: boolean
    ariaInvalid?: boolean
    ariaDescribedby?: string
  }>(),
  {
    name: undefined,
    rows: undefined,
    minlength: undefined,
    maxlength: undefined,
    placeholder: undefined,
    required: false,
    disabled: false,
    ariaInvalid: false,
    ariaDescribedby: undefined,
  },
)

const model = defineModel<string>({ required: true })

const textareaRef = ref<InstanceType<typeof Textarea> | null>(null)

const textareaEl = computed(() => textareaRef.value?.el ?? null)

interface FormatAction {
  label: string
  icon: typeof faBold
  apply: (value: string, start: number, end: number) => TextEdit
}

/** Toolbar de formato en texto plano: no genera HTML, solo inserta marcadores. */
const actions: readonly FormatAction[] = [
  {
    label: 'Negrita',
    icon: faBold,
    apply: (value, start, end) => wrapInline(value, start, end, BOLD_MARKER),
  },
  {
    label: 'Cursiva',
    icon: faItalic,
    apply: (value, start, end) => wrapInline(value, start, end, ITALIC_MARKER),
  },
  {
    label: 'Lista',
    icon: faList,
    apply: (value, start, end) => prefixLines(value, start, end, LIST_PREFIX),
  },
  { label: 'Enlace', icon: faLink, apply: (value, start, end) => wrapLink(value, start, end) },
]

async function runAction(action: FormatAction): Promise<void> {
  const el = textareaEl.value
  if (el === null) return

  const start = el.selectionStart ?? model.value.length
  const end = el.selectionEnd ?? start

  const edit = action.apply(model.value, start, end)
  model.value = edit.value

  await nextTick()

  el.focus()
  el.setSelectionRange(edit.selectionStart, edit.selectionEnd)
}
</script>

<template>
  <div
    class="rounded-field border border-line bg-white transition-colors focus-within:border-signal-blue focus-within:ring-2 focus-within:ring-signal-blue/25"
  >
    <div
      class="flex items-center gap-1 border-b border-line px-2 py-1.5"
      role="toolbar"
      aria-label="Formato del texto"
    >
      <button
        v-for="action in actions"
        :key="action.label"
        type="button"
        class="inline-flex size-8 items-center justify-center rounded-field text-graphite transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
        :aria-label="action.label"
        :title="action.label"
        :disabled="disabled"
        @mousedown.prevent
        @click="runAction(action)"
      >
        <FontAwesomeIcon :icon="action.icon" aria-hidden="true" class="size-3.5" />
      </button>
    </div>

    <Textarea
      ref="textareaRef"
      :id="id"
      v-model="model"
      :name="name"
      :rows="rows"
      :minlength="minlength"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedby"
      bare
    />
  </div>
</template>
