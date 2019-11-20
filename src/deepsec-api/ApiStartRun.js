import logger from 'electron-log'
import { isEmptyOrBlankStr } from '../util/misc'
import BatchModel from '../models/BatchModel'
import RunModel from '../models/RunModel'
import QueryModel from '../models/QueryModel'
import { ApiManager } from './ApiManager'

export class ApiStartRun extends ApiManager {
  constructor () {
    super('start-run', true, null) // We don't know the id at the beginning
  }

  cancelBatch () {
    this.sendCommand({command: 'cancel_batch'})
  }

  cancelRun (runPath) {
    this.sendCommand({command: 'cancel_run', file: runPath})
  }

  cancelQuery (queryPath) {
    this.sendCommand({command: 'cancel_query', file: queryPath})
  }

  registerAllAnswers () {
    // Normal answers
    this.addAnswerHandler('batch_started', this.batchStarted)
    this.addAnswerHandler('run_started', this.runStarted)
    this.addAnswerHandler('query_started', this.queryStarted)
    this.addAnswerHandler('query_ended', this.queryEnded)
    this.addAnswerHandler('run_ended', this.runEnded)
    this.addAnswerHandler('batch_ended', this.batchEnded)
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
    this.eventReply({ 'success': true })

    // Started with warning
    if (answer.warning_runs && answer.warning_runs.length > 0) {
      const nbFilesWarning = answer.warning_runs.length
      const nbTotalWarning = answer.warning_runs.reduce((sum, a) => sum + a.warnings.length, 0)

      // Send ui notification
      this.pushNotification(
        `Batch started with warnings`,
        `${nbTotalWarning} warning${nbTotalWarning > 1 ? 's' : ''} in
              ${nbFilesWarning} file${nbFilesWarning > 1 ? 's' : ''}`,
        'warning',
        'batch',
        { name: 'batch', params: { 'path': answer.file } }
      )
    } else {
      // Send ui notification
      this.pushNotification(
        'Batch started',
        '',
        'info',
        'batch',
        { name: 'batch', params: { 'path': answer.file } })
    }
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
      { name: 'run', params: { 'path': answer.file } })
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
      { name: 'query', params: { 'path': answer.file } })
  }

  queryEnded (answer) {
    let title
    let type
    const query = new QueryModel(answer.file)
    query.loadRun()
    switch (answer.status) {
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
        logger.error(`Unknown query status : ${answer.status}`)
        title = `Query ${query.title()} ended (${answer.status})`
        type = 'error'
    }

    // Send ui notification
    this.pushNotification(
      title,
      `From run ${query.run.title()} <br> Query ${query.index} / ${query.run.nbQueries()}`,
      type,
      'query',
      { name: 'query', params: { 'path': answer.file } })
  }

  runEnded (answer) {
    let title
    let type
    const run = new RunModel(answer.file)
    run.loadBatch()
    switch (answer.status) {
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
        logger.error(`Unknown run status : ${answer.status}`)
        title = `Run ${run.title()} ended (${answer.status})`
        type = 'error'
    }

    // Send ui notification
    this.pushNotification(
      title,
      `From batch ${run.batch.title()} <br> Run ${run.batch.runIndex(
        run)} / ${run.batch.nbRun()}`,
      type,
      'run',
      { name: 'run', params: { 'path': answer.file } })
  }

  batchEnded (answer) {
    let title
    let type
    const batch = new BatchModel(answer.file, true) // Load with runs
    const nbRun = batch.nbRun()
    const runStatus = batch.runsStatusCount()

    switch (answer.status) {
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
        logger.error(`Unknown batch status : ${answer.status}`)
        title = `Batch ${batch.title()} ended (${answer.status})`
        type = 'error'
    }

    // TODO use vue component for notification message (if possible)
    // Send ui notification
    this.pushNotification(
      title,
      `Batch of ${nbRun} run${nbRun > 1 ? 's' : ''}.
              <ul>
                <li>${runStatus['completed']} completed</li>
                <li>${runStatus['canceled']} canceled</li>
                <li>${runStatus['internal_error']} error</li>
              </ul>
              `,
      type,
      'batch',
      { name: 'batch', params: { 'path': answer.file } })
  }

// ======================= Error Answers ======================

  initError (answer) {
    // Send bad result to the Start Run page
    this.eventReply(
      { 'success': false, 'errorMsg': answer.error_msg, 'isInternal': answer.is_internal })
  }

  userError (answer) {
    const nbFilesIssue = answer.error_runs.length
    let nbTotalWarnings = 0
    let nbTotalError = 0

    answer.error_runs.forEach(error => {
      if (!isEmptyOrBlankStr(error.error_msg)) {
        nbTotalError++
      }
      if (error.warning) {
        nbTotalWarnings += error.warning.length
      }
    })

    // Send bad result to the Start Run page
    this.eventReply({
                      'success': false,
                      'isInternal': false,
                      'errorMsg': `${nbTotalError} error${nbTotalError > 1 ? 's' : ''} and
                      ${nbTotalWarnings} warning${nbTotalWarnings > 1 ? 's' : ''} in
                      ${nbFilesIssue} file${nbFilesIssue > 1 ? 's' : ''}.`,
                      'files_issues': answer.error_runs
                    })
  }
}