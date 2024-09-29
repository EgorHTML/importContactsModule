<script setup>
import { computed, ref } from 'vue'
import TableBlock from './TableBlock.vue'

const emit = defineEmits(['updateTable'])
const props = defineProps(['basicFields', 'sheetRows'])

const headerNames = computed(() => props.sheetRows[0])

const rowsForPreview = computed(() => props.sheetRows.slice(0, 5))

const noSelectedFields = computed(() =>
  props.basicFields.filter((field) => !field.selected)
)

const selectLabels = ref(new Array(headerNames.value.length).fill(''))
const selectValues = computed(() => {
  return selectLabels.value.map((label, index) => {
    const basicValue = props.basicFields.find(
      (field) => field.label == label
    )?.value
    return {
      value: basicValue || headerNames.value[index],
      basicField: !!basicValue,
    }
  })
})

function change() {
  const selectedValues = [...selectLabels.value]
  const fields = props.basicFields.map((field) => {
    const selectedValue = selectedValues.includes(field.label)

    return { ...field, selected: selectedValue }
  })

  emit('updateTable', {
    selects: selectValues.value,
    fields: fields,
  })
}

function remoteMethod(query) {
  console.log(query, 'query')
}
</script>

<template>
  <div class="contact-users-import-export__preview" style="overflow: auto">
    <div class="contact-users-import-export__row">
      <div
        v-for="(v, i) in headerNames"
        :key="headerNames[i]"
        class="contact-users-import-export__column"
        style="overflow: visible; min-width: 100px"
      >
        <el-select
          v-model="selectLabels[i]"
          :remote-method="remoteMethod"
          placeholder="Выбрать"
          style="min-width: 100px"
          clearable
          :value-on-clear="''"
          filterable
          @change="change"
        >
          <el-option
            v-for="field in noSelectedFields"
            :key="field.value + headerNames[i]"
            :label="field.label"
            :value="field.label"
          />
        </el-select>
      </div>
    </div>
    <TableBlock :rows="rowsForPreview" />
  </div>
</template>
