<script setup>
import DropZoneBlock from '../blocks/DropZoneBlock.vue'
import ImportSettingsBlock from '../blocks/ImportSettingsBlock.vue'

import { ref, shallowRef, provide, watchEffect } from 'vue'

const file = ref()

provide('file', file)

const currentBlock = shallowRef(DropZoneBlock)

watchEffect(() => {
  if (file.value) {
    currentBlock.value = ImportSettingsBlock
  } else {
    currentBlock.value = DropZoneBlock
  }
})
</script>

<template>
  <div class="settings_container">
    <h1>Импорт пользователей при помощи XLSX файла</h1>
    <component :is="currentBlock"></component>
  </div>
</template>

<style scoped>
.settings_container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
