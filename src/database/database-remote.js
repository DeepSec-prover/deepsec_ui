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
