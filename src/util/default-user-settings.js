import userSettings from 'electron-settings'
import logger from 'electron-log'

const defaultUserSettings = {
  showHelpers: true,
  deepsecApiPath: '',
  resultsDirPath: '',
  notificationDuration: 5, // seconds
  showBatchNotif: true,
  showRunNotif: false,
  showQueryNotif: true,
  stickyErrorNotif: true,
  stickyWarningNotif: true,
  codeStyleTheme: 'coy',
  defaultSpecFilesPath: ''
}

/**
 * Check every setting and set to default if missing
 */
function unsetToDefault () {
  Object.keys(defaultUserSettings).forEach(setting => {
    if (!userSettings.has(setting)) {
      const value = defaultUserSettings[setting]
      logger.debug(`User setting "${setting}" set as default value : ${value}`)
      userSettings.set(setting, value)
    }
  })
}

/**
 * Remove all user setting then set them with default value
 */
function resetAll () {
  logger.info('Reset all user settings to default')
  userSettings.deleteAll()
  userSettings.setAll(defaultUserSettings)
}

export { defaultUserSettings, unsetToDefault, resetAll }
