import settings from 'electron-settings';   // stays in main
import defaultValues from './default-values';
/**
 * Check every setting and set to default if missing
 */
function unsetToDefault () {
    Object.keys(defaultValues).forEach(setting => {
      if (!settings.has(setting)) {
        const value = defaultValues[setting]
        settings.set(setting, value)
      }
    })
  }
  
  /**
   * Remove all user setting then set them with default value
   */
  function resetAll () {
    logger.info('Reset all user settings to default')
    settings.deleteAll()
    settings.setAll(defaultValues)
  }

export {settings, unsetToDefault, resetAll, defaultValues};

