import sql from 'sqlite3'
import logger from 'electron-log'
import settings from '../../settings'
import { app, ipcMain } from 'electron'
import path from 'path'
import { isFile, setDifference } from '../util/misc'
import fs from 'fs'
import userSettings from 'electron-settings'
import BatchModel from '../models/BatchModel'

if (settings.isDevelopment) {
  sql.verbose()
}

const dbPath = path.join(app.getPath('userData'), 'results.db')
let db = null

/**
 * Connect to the database and wait for renderer IPC requests.
 * If the file doesn't exist create all tables.
 *
 * @return {Promise} Result promise
 */
export function connectDatabase () {
  return new Promise((resolve, reject) => {
    // Check if it's the first connection
    if (isFile(dbPath)) {
      logger.verbose(`Database file found in "${dbPath}", no creation needed.`)
    } else {
      logger.verbose(`Database file not found in "${dbPath}", will be created`)
    }

    // Connect to the database
    db = new sql.Database(dbPath, err => {
      if (err) {
        logger.error(`An issue occurs when connecting to the database (${dbPath}):\n${err}`)
        reject()
      } else {
        logger.info(`Database successfully connected (${dbPath}).`)

        // Wait for renderer requests
        listenRendererQueries()

        resolve()
      }
    })
  })
}

/**
 * Close the database connection
 */
export function closeDatabase () {
  if (db) {
    db.close(err => {
      if (err) {
        logger.error(`An issue occurs when closing to the database (${dbPath}):\n${err}`)
      } else {
        logger.debug(`Database successfully closed (${dbPath}).`)
      }
    })
  }
}

/**
 * Look for files which are in the user result folder but not in the database.
 * When such file is found add it in the database.
 */
export function scanForNewResults () {
  const resultsDirPath = userSettings.get('resultsDirPath').toString()
  // List batches files in the folder
  fs.readdir(resultsDirPath, (_, files) => {
    if (files && files.length > 0) {
      // Filter and rename
      // TODO also filter file date to improve perf
      files = files.filter(file => file.endsWith('.json'))
                   .map(file => file.replace('.json', ''))

      logger.debug(
        `${files.length} file(s) found in the user results directory (${resultsDirPath})`)

      // Request all batch paths already in the database
      db.all(`SELECT path FROM batches WHERE path IN ('${files.join('\',\'')}')`, (err, rows) => {
        if (err) {
          logger.error(`An issue occurs when scanning for new results files:\n${err}`)
        } else {
          logger.debug(`${rows.length} file(s) are already in the database.`)
          files = new Set(files)
          rows = new Set(rows.map(row => row.path))
          const diff = setDifference(files, rows)
          logger.info(
            `${diff.size} new file(s) found in the user results directory (${resultsDirPath})`)

          for (let batchPath of diff) {
            let batch = new BatchModel(batchPath + '.json', false)
            batch.loadRelationsDeep() // Load all runs and queries
            updateOrInsertBatch(batch)
          }
        }
      })
    } else {
      logger.debug(`No file found in the user results directory (${resultsDirPath})`)
    }
  })
}

/**
 * Update the batch if exist in the database or insert a new batch in the database.
 *
 * @param {BatchModel} batch The batch to update or insert (with all relation loaded)
 */
export function updateOrInsertBatch (batch) {
  db.exec(generateBatchUpdateOrInsertSql(batch), err => {
    if (err) {
      logger.error(
        `An issue occurs when inserting a new batch (${batch.path}) in the database:\n${err}`)
    } else {
      logger.verbose(`Batch ${batch.path} successfully inserted in the database`)
    }
  })
}

/**
 * Create all tables.
 * The database should be created and connected first.
 *
 * @return {Promise} Result promise
 */
export function createTablesIfNotExist () {
  return new Promise((resolve, reject) => {
    // language=SQLite
    db.exec(`
                -- Batches table
                CREATE TABLE IF NOT EXISTS batches
                (
                    path        TEXT NOT NULL PRIMARY KEY,
                    status      TEXT NOT NULL,
                    start_time  DATE NOT NULL,
                    end_time    DATE,
                    import_date DATE,
                    stared      INT2 DEFAULT 0,
                    title       TEXT,
                    debug       INT2 NOT NULL
                );

                -- Batches indexes
                CREATE INDEX IF NOT EXISTS index_status_batches ON batches (status);
                CREATE INDEX IF NOT EXISTS index_start_time_batches ON batches (start_time);
                CREATE INDEX IF NOT EXISTS index_import_date_batches ON batches (import_date);
                CREATE INDEX IF NOT EXISTS index_stared_batches ON batches (stared);
                CREATE INDEX IF NOT EXISTS index_title_batches ON batches (title);

                -- Runs table
                CREATE TABLE IF NOT EXISTS runs
                (
                    path       TEXT NOT NULL PRIMARY KEY,
                    status     TEXT NOT NULL,
                    start_time DATE,
                    end_time   DATE,
                    stared     INT2 DEFAULT 0,
                    input_file TEXT NOT NULL
                );

                -- Runs indexes
                CREATE INDEX IF NOT EXISTS index_status_runs ON runs (status);
                CREATE INDEX IF NOT EXISTS index_start_time_runs ON runs (start_time);
                CREATE INDEX IF NOT EXISTS index_stared_runs ON runs (stared);
                CREATE INDEX IF NOT EXISTS index_input_file_runs ON runs (input_file);

                -- Queries table
                CREATE TABLE IF NOT EXISTS queries
                (
                    path         TEXT    NOT NULL PRIMARY KEY,
                    status       TEXT    NOT NULL,
                    start_time   DATE,
                    end_time     DATE,
                    stared       INT2    DEFAULT 0,
                    q_index      INTEGER NOT NULL,
                    semantics    TEXT    NOT NULL,
                    type         TEXT    NOT NULL,
                    attack_found INTEGER DEFAULT 0
                );

                -- Query indexes
                CREATE INDEX IF NOT EXISTS index_status_queries ON queries (status);
                CREATE INDEX IF NOT EXISTS index_start_time_queries ON queries (start_time);
                CREATE INDEX IF NOT EXISTS index_stared_queries ON queries (stared);

                -- Batches-Runs Join table
                CREATE TABLE IF NOT EXISTS batches_runs
                (
                    batch_path TEXT NOT NULL,
                    run_path   TEXT NOT NULL,
                    PRIMARY KEY (batch_path, run_path),
                    FOREIGN KEY (batch_path)
                        REFERENCES batches (path)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION,
                    FOREIGN KEY (run_path)
                        REFERENCES runs (path)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION
                );

                -- Runs-Queries Join table
                CREATE TABLE IF NOT EXISTS runs_queries
                (
                    run_path   TEXT NOT NULL,
                    query_path TEXT NOT NULL,
                    PRIMARY KEY (run_path, query_path),
                    FOREIGN KEY (run_path)
                        REFERENCES runs (path)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION,
                    FOREIGN KEY (query_path)
                        REFERENCES queries (path)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION
                );
      `, // language=default
         err => {
           if (err) {
             logger.error(`An issue occurs when creating the database tables:\n${err}`)
             reject()
           } else {
             logger.info(`Database tables successfully initialized.`)
             resolve()
           }
         })
  })
}

/**
 * Generate an SQL update or insert query for a specific batch.
 *
 * @param {BatchModel} batch The batch to insert (with all relation loaded)
 * @return {String} The SQL insert query for the batch its runs and queries
 */
function generateBatchUpdateOrInsertSql (batch) {
  const batchTitle = batch.defaultTitle ? `'${batch.defaultTitle}'` : 'NULL'
  const batchPath = batch.path.replace('.json', '')

  // language=SQLite
  // Try to update then insert the batch
  let sql = `
  UPDATE OR IGNORE batches
  SET status='${batch.status}',
      start_time=${timeToSql(batch.startTime)},
      end_time=${timeToSql(batch.endTime)},
      import_date=${timeToSql(batch.importTime)},
      title=${batchTitle},
      debug=${Number(batch.debug)}
  WHERE path='${batchPath}';

  INSERT OR IGNORE INTO batches (path, status, start_time, end_time, import_date, title, debug)
  VALUES ('${batchPath}',
          '${batch.status}',
          ${timeToSql(batch.startTime)},
          ${timeToSql(batch.endTime)},
          ${timeToSql(batch.importTime)},
          ${batchTitle},
          ${Number(batch.debug)});
  `

  if (batch.runs) {
    for (const run of batch.runs) {
      const runPath = run.path.replace('.json', '')

      // Try to update then insert the run
      sql += `
      UPDATE OR IGNORE runs
      SET status='${run.status}',
          start_time=${timeToSql(run.startTime)},
          end_time=${timeToSql(run.endTime)},
          input_file='${run.inputFile}'
      WHERE path='${runPath}';
  
      INSERT OR IGNORE INTO runs (path, status, start_time, end_time, input_file)
      VALUES ('${runPath}',
              '${run.status}',
              ${timeToSql(run.startTime)},
              ${timeToSql(run.endTime)},
              '${run.inputFile}');
      `

      // Insert the batch-run relation
      sql += `
      INSERT OR IGNORE INTO batches_runs (batch_path, run_path) VALUES ('${batch.path}','${run.path}');
      `

      if (run.queries) {
        for (const query of run.queries) {
          const queryPath = query.path.replace('.json', '')

          // Try to update then insert the query
          sql += `
          UPDATE OR IGNORE queries
          SET status='${query.status}', 
              start_time=${timeToSql(query.startTime)},
              end_time=${timeToSql(query.endTime)},
              q_index=${query.index},
              semantics='${query.semantics}',
              type='${query.type}'
          WHERE path='${queryPath}';
      
          INSERT OR IGNORE INTO queries (path, status, start_time, end_time, q_index, semantics, type)
          VALUES ('${queryPath}',
                  '${query.status}',
                  ${timeToSql(query.startTime)},
                  ${timeToSql(query.endTime)},
                  ${query.index},
                  '${query.semantics}',
                  '${query.type}');
          `

          // Insert the run-query relation
          sql += `
          INSERT OR IGNORE INTO runs_queries (run_path, query_path) VALUES ('${run.path}', '${query.path}');
          `
        }
      }
    }
  }

  return sql
}

/**
 * Transform a Javascript Date into a SQL Date.
 * @param {Date|null} time A javascript date object.
 */
function timeToSql (time) {
  return time ? time.getTime() : 'NULL'
}

/**
 * Setup listener for renderer.
 * @see ./database-remote.js
 */
function listenRendererQueries () {
  ipcMain.on('get-rows', (event, sqlQuery) => {
    db.all(sqlQuery, [], (err, rows) => {
      if (err) {
        logger.error(`An issue occurs when fetching rows from the database:\n${err}`)
        event.reply('get-rows-result', [])
      } else {
        logger.verbose(`${rows.length} rows successfully fetched from the database`)
        event.reply('get-rows-result', rows)
      }
    })
  })

  ipcMain.on('get-count', (event, sqlQuery) => {
    db.all(sqlQuery, [], (err, count) => {
      if (err) {
        logger.error(`An issue occurs when fetching rows count from the database:\n${err}`)
        event.reply('get-count-result', 0)
      } else {
        logger.verbose(`Rows count successfully fetched from the database`)
        event.reply('get-count-result', count)
      }
    })
  })
}
