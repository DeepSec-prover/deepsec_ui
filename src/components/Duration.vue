<template>
  <span>{{ durationStr }}</span>
</template>

<script>
  import logger from 'electron-log'

  const PERIODS = [
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1]
  ]

  export default {
    name: 'Duration',
    props: {
      /**
       * Start time, should be set if duration is not.
       * If duration and start time are set, the start time is ignored.
       */
      startTime: {
        type: Date,
        default: null
      },
      /**
       * End time, if missing use current time and refresh every seconds.
       * TODO duration in progress refresh
       */
      endTime: {
        type: Date,
        default: null
      },
      /**
       * The number of unit to show in the string.
       * If 0 then use maximal precision.
       * Eg: 1 hour 10 minutes 5 seconds
       * with precision = 1: 1 hour
       * with precision = 2: 1 hour 10 minutes
       * with precision = 3: 1 hour 10 minutes 5 seconds
       * with precision = 4: 1 hour 10 minutes 5 seconds
       */
      precision: {
        type: Number,
        default: 2
      },
      /**
       * Duration in seconds, should be set if start time is not.
       * If duration and start time are set, the start time is ignored.
       */
      duration: {
        type: Number,
        default: null
      }
    },
    computed: {
      durationStr: function () {
        let s = -1
        if (this.duration === null) {
          let end = this.endTime ? this.endTime : new Date(Date.now())
          s = (end - this.startTime) / 1000
        } else {
          s = this.duration
        }

        if (s < 0 ) {
          logger.error(`Bad value for duration : ${s}s`)
          return '-'
        }

        // Null duration, we assume that is under 1s
        if (s === 0) {
          return '< 1 second'
        }

        let strings = []
        let precisionCount = 0
        let i = 0
        while (i < PERIODS.length) {
          let periodLabel = PERIODS[i][0]
          let periodSec = PERIODS[i][1]

          if (s >= periodSec) {
            let value = Math.floor(s / periodSec)
            s = s % periodSec
            if (value > 1) {
              periodLabel += 's'
            }
            strings.push(`${value} ${periodLabel}`)
          }

          // Never break if precision is 0
          if (strings.length > 0 && ++precisionCount === this.precision) {
            break
          }

          i++
        }

        return strings.join(' ')
      }
    }
  }
</script>
