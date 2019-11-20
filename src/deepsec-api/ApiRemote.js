import { ipcRenderer } from 'electron'

/**
 * Class to easily communicate with the API from any renderer.
 */
export default class ApiRemote {
  /**
   * Create a new remote for a specific Api Manager.
   *
   * @param {String} namespace The namespace of the manager to reach.
   * @param {String} ipcId The ipc id of the specific instance of manager to reach.
   */
  constructor (namespace, ipcId) {
    this.namespace = namespace
    this.ipcId = ipcId
  }

  /**
   * Send a command to the target instance of Api manager.
   * If the ipc id doesn't match current instances or the command has no handler
   * then nothing will happen.
   *
   * @param {String} command The command to send to the target.
   * @param {Object} options The options for the command.
   */
  sendCommand (command, options = null) {
    ipcRenderer.send(`deepsec-api:${this.namespace}:${this.ipcId}:${command}`, options)
  }
}
