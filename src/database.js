import sql from 'sqlite3'
import logger from 'electron-log'
import settings from '../settings'
import { app } from 'electron'
import path from 'path'
import { isFile } from './util/misc'

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
 * Create all tables.
 * The database should be created and connected first.
 */
function createTables () {
  // language=SQLite
  db.run(`
      -- Batch table
      CREATE TABLE batches
      (
          path        TEXT PRIMARY KEY,
          status      TEXT NOT NULL,
          start_time  DATE NOT NULL,
          end_time    DATE,
          import_date DATE,
          stared      INTEGER DEFAULT 0,
          title       TEXT
      );

      -- Run table
      CREATE TABLE runs
      (
          path       TEXT PRIMARY KEY,
          status     TEXT NOT NULL,
          start_time DATE,
          end_time   DATE,
          stared     INTEGER DEFAULT 0,
          input_file TEXT NOT NULL
      );

      -- Queries table
      CREATE TABLE queries
      (
          path       TEXT PRIMARY KEY,
          status     TEXT    NOT NULL,
          start_time DATE,
          end_time   DATE,
          stared     INTEGER DEFAULT 0,
          q_index    INTEGER NOT NULL,
          semantics  TEXT    NOT NULL,
          type       TEXT    NOT NULL
      );

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
  `)

  logger.info('Database tables initialized')
}
