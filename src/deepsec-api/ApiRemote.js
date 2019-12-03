import { ipcRenderer } from 'electron'
import logger from 'electron-log'

/**
 * Class to easily communicate with the API from any renderer.
 */
export default class ApiRemote {
  /**
   * Create a new remote for a specific Api Manager.
   *
   * @param {String} namespace The namespace of the manager to reach.
   * @param {String} ipcId The ipc id of the specific instance of manager to reach.
   * @param {Boolean} started Flag to set the process as already started
   */
  constructor (namespace, ipcId, started) {
    this.started = started
    this.stopped = false
    this.namespace = namespace
    this.signalHandler = new Set()
    this.ipcId = ipcId
  }

  /**
   * Order the creation of a new API manager on the main process.
   *
   * @param {Object} command The initial command with options.
   */
  start (command) {
    if (this.started) {
      throw new Error('Can\'t start an API manager twice with the same remote.')
    }

    this.started = true

    ipcRenderer.once(`deepsec-api:${this.namespace}:exit`, this.exit.bind(this))

    ipcRenderer.send(`deepsec-api:${this.namespace}:start`, command, this.ipcId)
  }

  /**
   * Send a command to the target instance of Api manager.
   * If the ipc id doesn't match current instances or the command has no handler
   * then nothing will happen.
   *
   * @param {String} command The command to send to the target.
   * @param {any} options The options for the command.
   */
  sendQuery (command, ...options) {
    if (!this.started) {
      throw new Error('Can\'t send a query before to start an API manager with this remote.')
    }

    if (this.stopped) {
      throw new Error('Can\'t send a query after the end of the API process.')
    }

    ipcRenderer.send(`deepsec-api:${this.namespace}:${this.ipcId}:${command}`, ...options)
  }

  /**
   * Wait the event reply to trigger an action.
   *
   * @param {Function} lambda The action to trigger on the reply. Parameters : event, data
   * @param {Boolean} onlyOnce If true the action trigger only after the first reply.
   */
  onReply (lambda, onlyOnce = true) {
    if (this.stopped) {
      throw new Error('Can\'t wait a reply on a stopped process.')
    }

    if (onlyOnce) {
      ipcRenderer.once(`deepsec-api:${this.namespace}:reply`, lambda)
    } else {
      ipcRenderer.on(`deepsec-api:${this.namespace}:reply`, lambda)
    }
  }

  /**
   * Wait a signal to trigger an action.
   *
   * @param {String} label The label of the signal
   * @param {Function} lambda The action to trigger on the reply. Parameters : event, data
   * @param {Boolean} onlyOnce If true the action trigger only after the first reply.
   */
  onSignal (label, lambda, onlyOnce = true) {
    // Save the handler for remove later
    this.signalHandler.add(label)

    if (onlyOnce) {
      ipcRenderer.once(`deepsec-api:${this.namespace}:${this.ipcId}:${label}`, lambda)
    } else {
      ipcRenderer.on(`deepsec-api:${this.namespace}:${this.ipcId}:${label}`, lambda)
    }
  }

  /**
   * Trigger when the remote process exit.
   * Remove all reply listener.
   */
  exit () {
    ipcRenderer.removeAllListeners(`deepsec-api:${this.namespace}:reply`)

    this.signalHandler.forEach(s => {
      ipcRenderer.removeAllListeners(`deepsec-api:${this.namespace}:${this.ipcId}:${s}`)
    })
    this.signalHandler.clear()

    this.stopped = true
    logger.silly('API Remote disconnected.')
  }
}
