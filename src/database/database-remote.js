import { ipcRenderer } from 'electron'
import BatchModel from '../models/BatchModel'
import { isEmptyOrBlankStr } from '../util/misc'

/**
 * Get batches from the database.
 *
 * @param {Number} pageSize The maximum number of batch to return
 * @param {Number} pageNumber The current page number to compute to appropriate offset
 * @param {Object} sort The sort criteria
 * @param {Object} filters The filter criteria
 * @returns {Promise<Array<BatchModel>>} A promise of batches
 */
export function getBatches (pageSize, pageNumber, sort, filters) {
  return new Promise((resolve, reject) => {
    // Wait for result (before send because of async)
    ipcRenderer.once('get-rows-result', (event, rows) => {
      const batches = []

      for (const row of rows) {
        batches.push(new BatchModel(row, false, true, true))
      }

      resolve(batches)
    })

    let sqlQuery = `
        SELECT *
        FROM batches`

    // Filters
    if (filters) {
      sqlQuery += buildWhereSearch(filters)
    }

    // Sort
    if (sort && sort.order) {
      const sortOrder = sort.order === 'descending' ? 'DESC' : 'ASC'
      let sortField = undefined
      switch (sort.prop) {
        case 'startTime':
          sortField = 'start_time'
          break
        case 'defaultTitle':
          sortField = 'title'
          break
        default:
          throw new Error(`Unknown sort field "${sort.prop}"`)
      }
      sqlQuery += `
      ORDER BY ${sortField} ${sortOrder}`
    }

    // Limit
    const offset = pageSize * (pageNumber - 1)
    sqlQuery += `
    LIMIT ${pageSize} OFFSET ${offset}`

    // Send the query
    ipcRenderer.send('get-rows', sqlQuery)
  })
}

/**
 * Get the total number of batches from the database
 *
 * @param {Object} filters The filter criteria
 * @returns {Promise<Number>} A promise of total number of batches
 */
export function getCountBatches (filters) {
  return new Promise((resolve, reject) => {
    // Wait for result (before send because of async)
    ipcRenderer.once('get-count-result', (event, result) => {
      resolve(result[0].total)
    })

    // Send the query
    ipcRenderer.send('get-count', `
        SELECT COUNT(*) AS total
        FROM batches ${buildWhereSearch(filters)}`)
  })
}

/**
 * Remotely call the database function.
 */
export function scanForInProgress () {
  ipcRenderer.send('scan-in-progress')
}

/**
 * Remotely call the database function.
 */
export function scanForNewResults () {
  ipcRenderer.send('scan-new-batch')
}

/**
 * Build the WHERE part of a SQL query depending of filters
 *
 * @param {Object} filters The list of filters
 * @returns {string} The WHERE SQL part or empty if no valid filter
 */
function buildWhereSearch (filters) {
  if (filters) {
    const filterQuery = []

    for (const filter of filters) {
      switch (filter.type) {
        case 'text':
          if (!isEmptyOrBlankStr(filter.value)) {
            // Escape wildcards
            const value = filter.value.replace(/%/g, '\\%').replace(/_/g, '\\_')
            filterQuery.push(`${filter.search_prop} LIKE '%${value}%' ESCAPE '\\'`)
          }
          break
        case 'select':
          if (filter.value.length > 0) {
            filterQuery.push(`${filter.search_prop} IN ('${filter.value.join('\', \'')}')`)
          }
          break
        default:
          throw new Error(`Unknown filter type ${filter.type}`)
      }
    }

    if (filterQuery.length > 0) {
      return `
        WHERE ${filterQuery.join(' AND ')}`
    }
  }

  // No filters (or only empty ones)
  return ''
}
