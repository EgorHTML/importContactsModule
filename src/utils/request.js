/* eslint-disable no-unused-vars */
import HDE from '../plugin/index'
import { sleep } from './helpers.js'

const RPM = 250
const secondsInMinute = 60
const sleepPerRequestInMili = (secondsInMinute / RPM) * 1000

export default async function makeRequest(data) {
  let { url, method, body, contentType } = data
  if (contentType == 'application/x-www-form-urlencoded')
    body = httpBuildQuery(body)

  const request = (
    await HDE.request({
      auth: 'HDE',
      url,
      method: method || 'GET',
      data: body || '',
      contentType: contentType || 'application/json',
    })
  ).data

  if (request.errors) throw new Error(JSON.stringify(request.errors))

  await sleep(sleepPerRequestInMili)

  return request
}

export function httpBuildQuery(object_to_convert) {
  var params = new URLSearchParams()
  let property_path
  var paramsGenerator = function (parent_key, iterate_object) {
    for (var current_key in iterate_object) {
      if (
        typeof iterate_object[current_key] == 'string' ||
        typeof iterate_object[current_key] == 'number'
      ) {
        if (parent_key.length > 0) {
          property_path = parent_key + '[' + current_key + ']'
        } else {
          property_path = current_key
        }

        params.append(property_path, iterate_object[current_key])
      } else if (typeof iterate_object[current_key] == 'object') {
        if (parent_key.length > 0) {
          property_path = parent_key + '[' + current_key + ']'
        } else {
          property_path = current_key
        }

        paramsGenerator(property_path, iterate_object[current_key])
      }
    }
  }

  paramsGenerator('', object_to_convert)

  return params.toString()
}
