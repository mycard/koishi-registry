<template>
  <div class="search-box">
    <div class="search-container">
      <span
        v-for="(word, index) in modelValue.slice(0, -1)"
        :key="index" class="search-word"
        :class="{ invalid: !validateWord(word) }"
        @click="onClickWord(index)"
      >{{ word }}</span>
      <input
        :placeholder="placeholder || '输入想要查询的插件名'"
        v-model="words[words.length - 1]"
        @blur="onEnter"
        @keydown.escape="onEscape"
        @keydown.backspace="onBackspace"
        @keypress.enter.prevent="onEnter"
        @keypress.space.prevent="onEnter"/>
    </div>
    <div class="search-action">
      <market-icon name="search"></market-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue'
import { validateWord } from '../utils'
import MarketIcon from '../icons'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const words = ref<string[]>()

watch(() => props.modelValue, (value) => {
  words.value = value.slice()
}, { immediate: true })

function onClickWord(index: number) {
  words.value.splice(index, 1)
  emit('update:modelValue', words.value)
}

function onEnter() {
  const last = words.value[words.value.length - 1]
  if (!last) return
  if (words.value.slice(0, -1).includes(last)) {
    words.value.pop()
  }
  words.value.push('')
  emit('update:modelValue', words.value)
}

function onEscape(event: KeyboardEvent) {
  words.value[words.value.length - 1] = ''
  emit('update:modelValue', words.value)
}

function onBackspace(event: KeyboardEvent) {
  if (words.value[words.value.length - 1] === '' && words.value.length > 1) {
    event.preventDefault()
    words.value.splice(words.value.length - 2, 1)
    emit('update:modelValue', words.value)
  }
}

</script>

<style lang="scss" scoped>

.search-box {
  display: flex;
  margin: 2rem auto 0;
  width: 100%;
  max-width: 600px;
  border-radius: 1.5rem;
  align-items: center;
}

.search-container {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 6px;
  padding: 0.75rem 1.25rem;
  padding-right: 0;

  input {
    flex: 1 1 auto;
    height: 1.25rem;
    min-width: 10rem;
    font-size: 0.9em;
    padding: 0;
    box-sizing: border-box;
    color: inherit;
    background-color: transparent;
    border: none;
    outline: none;
  }
}

.search-action {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;

  .market-icon {
    height: 1rem;
    opacity: 0.5;
  }
}

.search-word {
  flex: 0 0 auto;
  display: inline-block;
  font-size: 14px;
  height: 1.25rem;
  line-height: 1rem;
  border-radius: 4px;
  padding: 2px 6px;
  box-sizing: border-box;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  vertical-align: baseline;
  background-color: var(--k-color-active);
  cursor: pointer;
  user-select: none;
  transition: opacity 0.3s ease, background-color 0.3s ease;

  &.invalid {
    opacity: 0.5;
    text-decoration: line-through;
  }

  &.invalid:hover {
    opacity: 1;
  }
}

</style>
