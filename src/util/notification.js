import logger from 'electron-log'
import { Notification } from 'element-ui'
import userSettings from 'electron-settings'

export default function notification (title, message, type, topic = 'default') {

  if (type === 'success' || type === 'info') {
    // Check skip query
    if (topic === 'query' && !userSettings.get('showQueryNotif')) {
      return
    }

    // Check skip run
    if (topic === 'run' && !userSettings.get('showRunNotif')) {
      return
    }

    // Check skip batch
    if (topic === 'batch' && !userSettings.get('showBatchNotif')) {
      return
    }
  }

  logger.silly(`Show notification : (${type}) [${topic}] ${title}`)
  Notification({
    title: title,
    message: message,
    type: type,
    duration: userSettings.get('notificationDuration') * 1000 // Seconds to ms
  })
}
