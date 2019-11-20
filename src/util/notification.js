import logger from 'electron-log'
import { Notification } from 'element-ui'
import userSettings from 'electron-settings'

/**
 * Send a notification depending of the user settings.
 *
 * @param {String} title The title of the notification
 * @param {String} message The content message of the notification (HTML)
 * @param {String} type The type of notification (success/warning/info/error)
 * @param {String} topic The name of the topic, for filter
 * @param {Object} link The route description for vue-router
 * @param {Object} router The vue router to use
 */
export default function notification (title,
                                      message = '',
                                      type = 'info',
                                      topic = 'default',
                                      link = null,
                                      router = null) {

  if (type === 'success' || type === 'info' || type === '') {
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

  // Set time
  let time // in ms
  if (type === 'error' && userSettings.get('stickyErrorNotif')) {
    time = 0 // no auto dismiss
  } else {
    time = userSettings.get('notificationDuration') * 1000 // Seconds to ms
  }

  // If link add click event and css class
  let customClasses = ['background-' + type]
  let onClick = null
  if (link) {
    customClasses.push('clickable')
    onClick = function () {
      router.push(link)
      this.close()
    }
  }

  logger.silly(`Show notification : (${type}) [${topic}] ${title}`)
  Notification({
                 title: title,
                 message: message,
                 type: type,
                 duration: time,
                 onClick: onClick,
                 customClass: customClasses.join(' '),
                 dangerouslyUseHTMLString: true // Never a problem
               })
}
