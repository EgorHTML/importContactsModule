<script setup>
defineProps({
  rows: {
    default() {
      return []
    },
    required: false,
    type: Array,
  },
  whiteSpace: {
    default: 'nowrap',
    required: false,
    type: String,
  },
})
</script>

<template>
  <div
    v-for="row in rows"
    :key="row[0]"
    class="contact-users-import-export__row"
  >
    <div
      v-for="name in row"
      :key="name"
      class="contact-users-import-export__column"
      style="overflow: hidden"
      :style="{ whiteSpace }"
    >
      {{ name }}
    </div>
  </div>
</template>
