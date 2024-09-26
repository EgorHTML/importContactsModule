<script setup>
defineProps({
  loading: {
    required: false,
    type: Boolean,
    default() {
      return false
    },
  },
})
</script>

<template>
  <div class="el-loading-mask" :style="{ display: loading ? 'block' : 'none' }">
    <div class="el-loading-spinner">
      <svg viewBox="25 25 50 50" class="circular">
        <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
      </svg>
    </div>
  </div>
</template>
