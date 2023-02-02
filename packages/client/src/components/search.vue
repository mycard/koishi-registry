<template>
  <div class="search-box">
    <span
      v-for="(word, index) in modelValue.slice(0, -1)"
      :key="index" class="search-word"
      @click="onClickWord(index)"
    >{{ word }}</span>
    <input
      placeholder="输入想要查询的插件名"
      v-model="words[words.length - 1]"
      @blur="onEnter"
      @keydown.escape="onEscape"
      @keydown.backspace="onBackspace"
      @keypress.enter.prevent="onEnter"
      @keypress.space.prevent="onEnter"/>
  </div>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const words = ref<string[]>()

watch(props.modelValue, (value) => {
  words.value = value.slice()
}, { immediate: true })

watch(words, (value) => {
  emit('update:modelValue', value)
}, { deep: true })

function onClickWord(index: number) {
  words.value.splice(index, 1)
}

function onEnter() {
  const last = words.value[words.value.length - 1]
  if (!last) return
  if (words.value.slice(0, -1).includes(last)) {
    words.value.pop()
  }
  words.value.push('')
}

function onEscape(event: KeyboardEvent) {
  words.value[words.value.length - 1] = ''
}

function onBackspace(event: KeyboardEvent) {
  if (words.value[words.value.length - 1] === '' && words.value.length > 1) {
    event.preventDefault()
    words.value.splice(words.value.length - 2, 1)
  }
}

</script>

<style lang="scss" scoped>

.search-box {
  display: flex;
  flex-wrap: wrap;
  margin: 2rem auto 0;
  width: 100%;
  max-width: 600px;
  border-radius: 1.5rem;
  background-color: var(--k-color-bg-alt);
  align-items: center;
  gap: 8px 6px;
  padding: 0.75rem 1.25rem;

  input {
    height: 1.25rem;
    font-size: 0.9em;
    background-color: transparent;
    border: none;
    outline: none;
  }
}

.search-word {
  flex-shrink: 0;
  display: inline-block;
  font-size: 14px;
  height: 1.25rem;
  line-height: 1rem;
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  vertical-align: baseline;
  background-color: var(--k-color-primary);
  cursor: pointer;
  user-select: none;
}

</style>
