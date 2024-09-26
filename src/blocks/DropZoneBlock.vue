<!-- eslint-disable no-unused-vars -->
<script setup>
import LoadingComponent from '../components/LoadingComponent.vue'
import { inject, ref } from 'vue'
import DropZone from '../components/DropZoneComponent.vue'
import { read } from 'xlsx'

const loading = ref(false)

const file = inject('file')

async function onDroppedFile(files) {
  loading.value = true
  const firstFile = files[0]
  try {
    const buf = await firstFile.arrayBuffer()
    const workBookObject = read(buf, {
      type: 'buffer',
    })

    file.value = workBookObject
  } catch (error) {
    console.warn(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <DropZone @dropped-file="onDroppedFile" />
    <div class="el-upload__tip">Файл формата XLSX размером до 128M</div>
  </div>
</template>
