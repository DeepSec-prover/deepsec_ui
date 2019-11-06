import fs from 'fs'
import userSettings from 'electron-settings'
import BatchModel from '../models/BatchModel'

export function getBatches () {
  const batches = []

  fs.readdir(userSettings.get('resultsDirPath').toString(), (err, files) => {
    files.filter(file => file.endsWith('.json'))
         .sort()
         .reverse()
         .forEach(file => batches.push(new BatchModel(file, false)))
  })

  return batches
}
