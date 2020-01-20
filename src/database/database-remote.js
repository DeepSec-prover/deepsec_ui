import { ipcRenderer } from 'electron'
import BatchModel from '../models/BatchModel'

/**
 * Get batches from the database
 *
 * @returns {Promise<Array<BatchModel>>} A promise of batches
 */
export function getBatches () {
  return new Promise((resolve, reject) => {
    // Wait for result (before send because of async)
    ipcRenderer.once('get-rows-result', (event, rows) => {
      const batches = []

      for (const row of rows) {
        batches.push(new BatchModel(row, false, true, true))
      }

      resolve(batches)
    })

    // Send the query
    ipcRenderer.send('get-rows', `SELECT * FROM batches`)
  })
}

/**
 * Get the total number of batches from the database
 *
 * @returns {Promise<Number>} A promise of total number of batches
 */
export function getCountBatches () {
  return new Promise((resolve, reject) => {
    // Wait for result (before send because of async)
    ipcRenderer.once('get-count-result', (event, result) => {
      resolve(result[0].total)
    })

    // Send the query
    ipcRenderer.send('get-count', `SELECT COUNT(*) AS total
                                   FROM batches`)
  })
}
