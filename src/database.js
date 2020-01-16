import sql from 'sqlite3'
import logger from 'electron-log'
import settings from '../settings'
import { app } from 'electron'
import path from 'path'
import { isFile, setDifference } from './util/misc'
import fs from 'fs'
import userSettings from 'electron-settings'

if (settings.isDevelopment) {
  sql.verbose()
}

const dbPath = path.join(app.getPath('userData'), 'results.db')
let db = null

/**
 * Connect to the database.
 * If the file doesn't exist create all tables.
 */
export function connectDatabase () {
  // Check if it's the first connection
  let firstConnection = false
  if (isFile(dbPath)) {
    logger.verbose(`Database file found in "${dbPath}", no creation needed.`)
  } else {
    firstConnection = true
  }

  // Connect to the database
  db = new sql.Database(dbPath, err => {
    if (err) {
      logger.error(`An issue occurs when connecting to the database (${dbPath}):\n${err}`)
    } else {
      logger.info(`Database successfully connected (${dbPath}).`)
      // Create tables if it's the first connection
      if (firstConnection) {
        logger.info('No previous database found, let\'s create the tables.')
        createTables()
      } else {
        scanForNewResults()
      }
    }
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
      files = files.filter(file => file.endsWith('.json')) // TODO also filter file date to improve perf
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
        }
      })
    } else {
      logger.debug(`No file found in the user results directory (${resultsDirPath})`)
    }
  })
}

/**
 * Create all tables.
 * The database should be created and connected first.
 */
function createTables () {
  // language=SQLite
  db.exec(`
              -- Batches table
              CREATE TABLE batches
              (
                  path        TEXT NOT NULL PRIMARY KEY,
                  status      TEXT NOT NULL,
                  start_time  DATE NOT NULL,
                  end_time    DATE,
                  import_date DATE,
                  stared      INTEGER DEFAULT 0,
                  title       TEXT
              );

              -- Batches indexes
              CREATE INDEX index_status_batches ON batches (status);
              CREATE INDEX index_start_time_batches ON batches (start_time);
              CREATE INDEX index_import_date_batches ON batches (import_date);
              CREATE INDEX index_stared_batches ON batches (stared);
              CREATE INDEX index_title_batches ON batches (title);

              -- Runs table
              CREATE TABLE runs
              (
                  path       TEXT NOT NULL PRIMARY KEY,
                  status     TEXT NOT NULL,
                  start_time DATE,
                  end_time   DATE,
                  stared     INTEGER DEFAULT 0,
                  input_file TEXT NOT NULL
              );

              -- Runs indexes
              CREATE INDEX index_status_runs ON runs (status);
              CREATE INDEX index_start_time_runs ON runs (start_time);
              CREATE INDEX index_stared_runs ON runs (stared);
              CREATE INDEX index_input_file_runs ON runs (input_file);

              -- Queries table
              CREATE TABLE queries
              (
                  path         TEXT    NOT NULL PRIMARY KEY,
                  status       TEXT    NOT NULL,
                  start_time   DATE,
                  end_time     DATE,
                  stared       INTEGER DEFAULT 0,
                  q_index      INTEGER NOT NULL,
                  semantics    TEXT    NOT NULL,
                  type         TEXT    NOT NULL,
                  attack_found INTEGER DEFAULT 0
              );

              -- Query indexes
              CREATE INDEX index_status_queries ON queries (status);
              CREATE INDEX index_start_time_queries ON queries (start_time);
              CREATE INDEX index_stared_queries ON queries (stared);

              -- Batches-Runs Join table
              CREATE TABLE batches_runs
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
              CREATE TABLE runs_queries
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
         } else {
           logger.info(`Database tables successfully initialized.`)
           scanForNewResults()
         }
       })
}
