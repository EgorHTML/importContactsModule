export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

export function normalizeMatrix(matrix, targetLength, fillValue = undefined) {
  const normalizedMatrix = matrix.map((row) => {
    while (row.length < targetLength) {
      row.push(fillValue)
    }
    return row.slice(0, targetLength)
  })

  const columnCount = normalizedMatrix[0].length
  const nonEmptyColumns = []

  for (let col = 0; col < columnCount; col++) {
    const hasNonEmptyValue = normalizedMatrix.some(
      (row) => row[col] !== fillValue
    )
    if (hasNonEmptyValue) {
      nonEmptyColumns.push(col)
    }
  }

  return normalizedMatrix
    .map((row) => {
      return nonEmptyColumns.map((col) => row[col])
    })
    .filter((row) => row.find((c) => c !== undefined))
}

export function findMaxLength(nestedArray) {
  if (nestedArray.length === 0) return 0

  const lengths = nestedArray.map((subArray) => subArray.length)

  return Math.max(...lengths)
}
