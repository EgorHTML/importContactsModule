import makeRequest from './request.js'

const customFields = {}

export async function getContactCustomFieldByName(name) {
  if (!String(name).trim()) return undefined
  let totalPages = 1

  for (let i = 1; i <= totalPages; i++) {
    const fieldsData = await getContactCustomFields(i)
    const fields = fieldsData.data

    for (const id in fields) {
      const field = fields[id]

      for (const lang in field.name) {
        const value = field.name[lang]

        if (value == name) return field
      }
    }

    totalPages = fieldsData.pagination.total_pages
  }
}

export function createContact(user) {
  const data = {
    url: `${window.location.origin}/api/v2/users/`,
    method: 'POST',
    body: user,
    contentType: 'application/x-www-form-urlencoded',
  }

  return makeRequest(data)
}

async function getContactCustomFields(page = 1) {
  const data = {
    url: `${window.location.origin}/api/v2/users/custom_fields/?page=${page}`,
  }

  if (!customFields[page]) {
    const contactCustomFields = await makeRequest(data)
    customFields[page] = contactCustomFields
  }

  return customFields[page]
}
