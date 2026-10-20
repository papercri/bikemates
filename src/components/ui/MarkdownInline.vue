<script setup lang="ts">
import type { InlineNode } from '@/utils/markdown'

defineProps<{ nodes: readonly InlineNode[] }>()

/** Abre enlaces externos en pestaña nueva solo cuando la URL es http(s). */
function isNewTab(href: string): boolean {
  return /^https?:\/\//i.test(href)
}
</script>

<template>
  <template v-for="(node, index) in nodes" :key="index">
    <strong v-if="node.type === 'strong'">
      <MarkdownInline :nodes="node.content" />
    </strong>

    <em v-else-if="node.type === 'em'">
      <MarkdownInline :nodes="node.content" />
    </em>

    <a
      v-else-if="node.type === 'link'"
      :href="node.href"
      :target="isNewTab(node.href) ? '_blank' : undefined"
      :rel="isNewTab(node.href) ? 'noopener noreferrer' : undefined"
      class="text-route-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <MarkdownInline :nodes="node.content" />
    </a>

    <template v-else>{{ node.value }}</template>
  </template>
</template>
