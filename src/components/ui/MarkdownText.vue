<script setup lang="ts">
import { computed } from 'vue'
import { parseMarkdown } from '@/utils/markdown'
import MarkdownInline from '@/components/ui/MarkdownInline.vue'

const props = defineProps<{ text: string }>()

const blocks = computed(() => parseMarkdown(props.text))
</script>

<template>
  <div class="space-y-3">
    <template v-for="(block, index) in blocks" :key="index">
      <p v-if="block.type === 'p'">
        <MarkdownInline :nodes="block.content" />
      </p>

      <ul v-else-if="block.type === 'ul'" class="list-disc space-y-1.5 pl-5">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">
          <MarkdownInline :nodes="item.content" />
        </li>
      </ul>
    </template>
  </div>
</template>
