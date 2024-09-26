<script setup>
import { ref } from 'vue'

const emit = defineEmits(['dropped-file'])

const input = ref()

function onDrop(event) {
  emit('dropped-file', [...event.dataTransfer.files])
}

function onInput(event) {
  emit('dropped-file', [...event.target.files])
}
</script>

<template>
  <div
    style="width: 100%"
    tabindex="0"
    class="el-upload el-upload--text"
    @dragenter.prevent="false"
    @dragleave.prevent="false"
    @dragover.prevent="false"
    @drop.prevent="onDrop"
    @click="input.click"
  >
    <div class="el-upload-dragger" style="width: 100%">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        Перетащите файл xlsx или <em>нажмите загрузить</em>
      </div>
    </div>
    <input
      ref="input"
      type="file"
      name="file"
      accept=".xlsx"
      class="el-upload__input"
      @input="onInput"
    />
  </div>
</template>
