import logger from 'electron-log'
import { isEmptyOrBlankStr } from '../util/misc'
import BatchModel from '../models/BatchModel'
import RunModel from '../models/RunModel'
import QueryModel from '../models/QueryModel'
import { ApiManager } from './ApiManager'

export class ApiStartRun extends ApiManager {
  static namespace () { return 'start-run' }

  constructor (event, mainWindow) {
    super(true, event, mainWindow, null) // We don't know the id at the beginning
  }

  start (options) {
    options = {
      command: 'start_run',
      input_files: options.input_files,
      command_options: options.command_options
    }

    return super.start(options)
  }

  cancelBatch () {
    this.sendCommand({ command: 'cancel_batch' })
  }

  cancelRun (_, runPath) {
    this.sendCommand({ command: 'cancel_run', file: runPath })
  }

  cancelQuery (_, queryPath) {
    this.sendCommand({ command: 'cancel_query', file: queryPath })
  }

  registerAllAnswers () {
    // Normal answers
    this.addAnswerHandler('batch_started', this.batchStarted)
    this.addAnswerHandler('run_started', this.runStarted)
    this.addAnswerHandler('query_started', this.queryStarted)
    this.addAnswerHandler('query_ended', this.queryEnded)
    this.addAnswerHandler('run_ended', this.runEnded)
    this.addAnswerHandler('batch_ended', this.batchEnded)
    this.addAnswerHandler('query_progression', this.queryProgression)
    // Error answers
    this.addAnswerHandler('init_error', this.initError)
    this.addAnswerHandler('user_error', this.userError)
    this.addAnswerHandler('batch_internal_error', this.batchEnded)
    this.addAnswerHandler('query_internal_error', this.queryEnded)
  }

  // ====================== Normal Answers ======================

  batchStarted (answer) {
    // Save IPC id and setup queries handlers
    this.ipcId = answer.file
    this.addQueryHandler('cancel-batch', this.cancelBatch)
    this.addQueryHandler('cancel-run', this.cancelRun)
    this.addQueryHandler('cancel-query', this.cancelQuery)

    // Send good result to the Start Run page
    this.eventReply({ success: true })

    // Started with warning
    if (answer.warning_runs && answer.warning_runs.length > 0) {
      const nbFilesWarning = answer.warning_runs.length
      const nbTotalWarning = answer.warning_runs.reduce((sum, a) => sum + a.warnings.length, 0)

      // Send ui notification
      this.pushNotification(
        'Batch started with warnings',
        `${nbTotalWarning} warning${nbTotalWarning > 1 ? 's' : ''} in
              ${nbFilesWarning} file${nbFilesWarning > 1 ? 's' : ''}`,
        'warning',
        'batch',
        { name: 'batch', params: { path: answer.file } }
      )
    } else {
      // Send ui notification
      this.pushNotification(
        'Batch started',
        '',
        'info',
        'batch',
        { name: 'batch', params: { path: answer.file } })
    }

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  runStarted (answer) {
    const run = new RunModel(answer.file)
    run.loadBatch()
    // Send ui notification
    this.pushNotification(
      `Run ${run.title()} started`,
      `From batch ${run.batch.title()} <br> Run ${run.batch.runIndex(
        run)} / ${run.batch.nbRun()}`,
      'info',
      'run',
      { name: 'run', params: { path: answer.file } })

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  queryStarted (answer) {
    const query = new QueryModel(answer.file)
    query.loadRun()
    // Send ui notification
    this.pushNotification(
      `Query ${query.title()} started`,
      `From run ${query.run.title()} <br> Query ${query.index} / ${query.run.nbQueries()}`,
      'info',
      'query',
      { name: 'query', params: { path: answer.file } })

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  queryEnded (answer) {
    let title
    let type
    const query = new QueryModel(answer.file)
    query.loadRun()
    switch (query.status) {
      case 'completed':
        title = `Query ${query.title()} completed`
        type = 'success'
        break
      case 'canceled':
        title = `Query ${query.title()} canceled`
        type = 'warning'
        break
      case 'internal_error':
        title = `Query ${query.title()} internal error`
        type = 'error'
        break
      default:
        logger.error(`Unknown query status : ${query.status}`)
        title = `Query ${query.title()} ended (${query.status})`
        type = 'error'
    }

    // Send ui notification
    this.pushNotification(
      title,
      `From run ${query.run.title()} <br> Query ${query.index} / ${query.run.nbQueries()}`,
      type,
      'query',
      { name: 'query', params: { path: answer.file } })

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  runEnded (answer) {
    let title
    let type
    const run = new RunModel(answer.file)
    run.loadBatch()
    switch (run.status) {
      case 'completed':
        title = `Run ${run.title()} completed`
        type = 'success'
        break
      case 'canceled':
        title = `Run ${run.title()} canceled`
        type = 'warning'
        break
      case 'internal_error':
        title = `Run ${run.title()} internal error`
        type = 'error'
        break
      default:
        logger.error(`Unknown run status : ${run.status}`)
        title = `Run ${run.title()} ended (${run.status})`
        type = 'error'
    }

    // Send ui notification
    this.pushNotification(
      title,
      `From batch ${run.batch.title()} <br> Run ${run.batch.runIndex(
        run)} / ${run.batch.nbRun()}`,
      type,
      'run',
      { name: 'run', params: { path: answer.file } })

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  batchEnded (answer) {
    let title
    let type
    const batch = new BatchModel(answer.file, true) // Load with runs
    const nbRun = batch.nbRun()
    const runStatus = batch.runsStatusCount()

    switch (batch.status) {
      case 'completed':
        title = `Batch ${batch.title()} completed`
        type = 'success'
        break
      case 'canceled':
        title = `Batch ${batch.title()} canceled`
        type = 'warning'
        break
      case 'internal_error':
        title = `Batch ${batch.title()} internal error`
        type = 'error'
        break
      default:
        logger.error(`Unknown batch status : ${batch.status}`)
        title = `Batch ${batch.title()} ended (${batch.status})`
        type = 'error'
    }

    // TODO use vue component for notification message (if possible)
    // Send ui notification
    this.pushNotification(
      title,
      `Batch of ${nbRun} run${nbRun > 1 ? 's' : ''}.
              <ul>
                <li>${runStatus.completed} completed</li>
                <li>${runStatus.canceled} canceled</li>
                <li>${runStatus.internal_error} error</li>
              </ul>
              `,
      type,
      'batch',
      { name: 'batch', params: { path: answer.file } })

    // Send update signal with the result file name as content
    this.sendSignalToRemote('update', { file: answer.file })
  }

  queryProgression (answer) {
    this.sendSignalToRemote('progression', {
      file: answer.file,
      progression: answer
    })
  }

  // ======================= Error Answers ======================

  initError (answer) {
    // Send bad result to the Start Run page
    this.eventReply(
      { success: false, errorMsg: answer.error_msg, isInternal: answer.is_internal })
  }

  userError (answer) {
    // Compute the file errors
    const nbFilesIssue = answer.error_runs.length
    let nbTotalWarnings = 0
    let nbTotalErrors = 0

    answer.error_runs.forEach(error => {
      if (!isEmptyOrBlankStr(error.error_msg)) {
        nbTotalErrors++
      }
      if (error.warnings) {
        nbTotalWarnings += error.warnings.length
      }
    })

    let strTotalWarnings = ''

    if (nbTotalWarnings === 1) {
      strTotalWarnings = nbTotalWarnings + ' warning'
    } else if (nbTotalWarnings > 1){
      strTotalWarnings = nbTotalWarnings + ' warnings'
    }

    let strTotalErrors = ''

    if (nbTotalErrors === 1) {
      strTotalErrors = nbTotalErrors + ' error'
    } else if (nbTotalErrors > 1) {
      strTotalErrors = nbTotalErrors + ' errors'
    }

    const areErrorsInFile = nbTotalErrors !== 0 || nbTotalWarnings !== 0

    let strErrorMsg = ''
    if (areErrorsInFile) {
      if (nbTotalWarnings === 0) {
        strErrorMsg = strTotalErrors
      } else if (nbTotalErrors === 0) {
        strErrorMsg = strTotalWarnings
      } else {
        strErrorMsg = strTotalErrors + ' and ' + strTotalWarnings
      }
      strErrorMsg += ` in ${nbFilesIssue} file${nbFilesIssue > 1 ? 's' : ''}.`
    }

    // Compute the host errors
    const nbHostIssue = answer.error_hosts.length
    let nbTotalHostErrors = 0

    answer.error_hosts.forEach(error => {
      if (error.error_msgs) {
        nbTotalHostErrors += error.error_msgs.length
      }
    })

    if (nbTotalHostErrors !== 0) {
      if (areErrorsInFile) {
        strErrorMsg += ' '
      }
      strErrorMsg += `${nbTotalHostErrors} errors with ${nbHostIssue} distant server${nbHostIssue >
      1 ? 's' : ''}.`
    }

    // Send bad result to the Start Run page
    this.eventReply({
                      success: false,
                      isInternal: false,
                      errorMsg: strErrorMsg,
                      files_issues: answer.error_runs,
                      host_issues: answer.error_hosts
                    })
  }
}
