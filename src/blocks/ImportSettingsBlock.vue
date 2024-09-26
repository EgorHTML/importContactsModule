<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { utils } from 'xlsx'
import TableSelectsBlock from './TableSelectsBlock.vue'
import { getContactCustomFieldByName, createContact } from '../utils/contact.js'
import makeRequest from '../utils/request.js'
import { sleep, normalizeMatrix, findMaxLength } from '../utils/helpers.js'
import TableBlock from './TableBlock.vue'

const RPM = 250
const secondsInMinute = 60
const sleepPerRequest = (secondsInMinute / RPM) * 1000

const file = inject('file')

const departments = ref([])
const department = ref([])

const groups = ref([])
const groupId = ref()

const selectValues = ref([])
const startRow = ref(1)
const progress = ref(0)
const missedUsers = ref([])

const basicFields = ref([
  {
    label: 'Имя',
    value: 'name',
    selected: false,
    required: true,
  },
  {
    label: 'Компания',
    value: 'organization',
    selected: false,
    required: false,
  },
  {
    label: 'Телефон',
    value: 'phone',
    selected: false,
    required: true,
  },
])
const noSelectedRequiredFields = computed(() =>
  basicFields.value.filter((field) => field.required && !field.selected)
)

const requiredConditions = computed(() => {
  const cond = []

  if (noSelectedRequiredFields.value.length)
    cond.push(`Выберите колонку "${noSelectedRequiredFields.value[0].label}"`)

  if (!groupId.value) cond.push(`Выберите группу`)

  if (!department.value.length) cond.push('Выберите департамент')

  return cond
})

const conditionsNotMet = computed(() => !!requiredConditions.value.length)

const worksheet = computed(() => file.value.Sheets[file.value.SheetNames[0]])
const sheetRows = computed(() =>
  utils.sheet_to_json(worksheet.value, { header: 1, range: startRow.value - 1 })
)
const sheetRowsNormalized = computed(() =>
  normalizeMatrix(sheetRows.value, findMaxLength(sheetRows.value))
)

const bodyTable = computed(() => sheetRowsNormalized.value.slice(1))

onMounted(async () => {
  departments.value = (
    await makeRequest({
      url: `${window.location.origin}/api/v2/departments/`,
    })
  ).data

  groups.value = (
    await makeRequest({
      url: `${window.location.origin}/api/v2/groups/`,
    })
  ).data
})

async function importContacts() {
  progress.value = 0
  missedUsers.value = []

  const basicSelectValues = selectValues.value
    .filter((value) => value.basicField)
    .map((proxy) => proxy.value)
  const customSelectValues = selectValues.value
    .filter((value) => !value.basicField)
    .map((proxy) => proxy.value)

  const contactCustomFieldsByName = []

  for (let i = 0; i < customSelectValues.length; i++) {
    contactCustomFieldsByName.push(
      await getContactCustomFieldByName(customSelectValues[i])
    )
  }

  for (let i = 0; i < bodyTable.value.length; i++) {
    const contactRow = bodyTable.value[i]
    const user = { custom_fields: {} }

    user.department = [...department.value]
    user.group_id = groupId.value

    basicSelectValues.forEach(
      (field) =>
        (user[field] = contactRow[getIndexOfFields(selectValues.value, field)])
    )

    user.email = `${user.phone}@helpdeskeddy.com`
    user.password = user.email

    for (let i = 0; i < customSelectValues.length; i++) {
      const selectField = customSelectValues[i]
      const contactCustomField = contactCustomFieldsByName[i]

      if (contactCustomField)
        user.custom_fields[contactCustomField.id] =
          contactRow[getIndexOfFields(selectValues.value, selectField)]
    }
    createContact(user).catch((error) => {
      const jsonErrors = JSON.parse(error.message)
      console.warn(jsonErrors)
      missedUsers.value = [
        ['Имя', 'Телефон', 'E-mail', 'Описание'],
        ...missedUsers.value.slice(1),
        [user.name, user.phone, user.email, jsonErrors[0].details],
      ]
    })
    progress.value = ((i + 1) / bodyTable.value.length) * 100

    await sleep(sleepPerRequest)
  }
}

function getIndexOfFields(selectValues, name) {
  return selectValues.findIndex((field) => field.value == name)
}

function goBack() {
  file.value = undefined
}

function updateSelects(table) {
  selectValues.value = table.selects
  basicFields.value = table.fields
}
</script>

<template>
  <div class="settings">
    <div class="contact-users-import-export__row">
      <div class="contact-users-import-export__column">
        № строки заголовка таблицы<el-input-number
          v-model="startRow"
          :min="1"
          controls-position="right"
          size="small"
        />
      </div>
    </div>
    <div class="contact-users-import-export__row">
      <div class="contact-users-import-export__column">
        <el-select
          v-model="department"
          placeholder="Департаменты"
          style="min-width: 100px"
          clearable
          :value-on-clear="''"
          multiple
        >
          <el-option
            v-for="dep in departments"
            :key="dep.id"
            :label="dep.name.ru"
            :value="dep.id"
          />
        </el-select>
      </div>
      <div class="contact-users-import-export__column">
        <el-select
          v-model="groupId"
          placeholder="Группа"
          style="min-width: 100px"
          clearable
          :value-on-clear="''"
        >
          <el-option
            v-for="group in groups"
            :key="group.id"
            :label="group.name.ru"
            :value="group.id"
          />
        </el-select>
      </div>
    </div>

    <TableSelectsBlock
      :basic-fields="basicFields"
      :sheet-rows="sheetRowsNormalized"
      @update-table="updateSelects"
    />
    <div class="button_groups">
      <el-button
        :disabled="conditionsNotMet || (progress != 0 && progress != 100)"
        :type="conditionsNotMet ? 'danger' : 'warning'"
        @click="importContacts"
      >
        {{ conditionsNotMet ? requiredConditions[0] : 'Импорт' }}
      </el-button>
      <el-button type="info" class="back" @click="goBack">
        Вернуться назад
      </el-button>
    </div>
    <el-progress
      v-if="progress > 0"
      :percentage="progress"
      :status="progress >= 100 ? 'success' : 'warning'"
    />

    <div v-if="missedUsers.length > 0">
      Пропущенные пользователи:
      <TableBlock white-space="normal" :rows="missedUsers" />
    </div>
  </div>
</template>

<style>
.el-input__inner {
  padding: 0 !important;
}

.settings {
  display: flex;
  flex-direction: column;
  flex: 1 1;
}
</style>
