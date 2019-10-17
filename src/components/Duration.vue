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
      startTime: {
        type: Date
      },
      endTime: {
        type: Date,
        default: null
      },
      precision: {
        type: Number,
        default: 2
      }
    },
    computed: {
      durationStr: function () {
        let end = this.endTime ? this.endTime : new Date(Date.now())
        let s = (end - this.startTime) / 1000

        if (s < 0) {
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
