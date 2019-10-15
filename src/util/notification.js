import logger from 'electron-log'
import { Notification } from 'element-ui'
import userSettings from 'electron-settings'

export default function notification (title, message, type) {
  logger.silly(`Show notification : (${type}) ${title} - ${message}`)
  Notification({
    title: title,
    message: message,
    type: type,
    duration: userSettings.get('notificationDuration') * 1000 // Seconds to ms
  })
}
