<template>
  <span>{{ durationStr }}</span>
</template>

<script>

const PERIODS = [
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1]
]

export default {
  name: 'duration',
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
     * Duration in seconds, should be set if start time is not.
     * If duration and start time are set, the start time is ignored.
     */
    duration: {
      type: Number,
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
    }
  },
  data () {
    return {
      /**
       * Computed duration in seconds.
       */
      realtimeDuration: -1,
      /**
       * Time interval reference to clear when it's over.
       */
      timeInterval: undefined
    }
  },
  computed: {
    durationStr: function () {
      if (this.realtimeDuration < 0) {
        console.error(`Bad value for duration : ${this.realtimeDuration}s`)
        return '-'
      }

      // Null duration, we assume that is under 1s
      if (this.realtimeDuration === 0) {
        return '< 1 second'
      }

      let strings = []
      let precisionCount = 0
      let i = 0
      let s = this.realtimeDuration
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
  },
  watch: {
    endTime: function (newVal, oldVal) {
      // If the val is set for the first time
      if (!oldVal && newVal) {
        // Stop the duration incrementation
        clearInterval(this.timeInterval)
        this.realtimeDuration = (newVal - this.startTime) / 1000
      }
    }
  },
  beforeMount () {
    if (this.duration) {
      // Direct duration
      this.realtimeDuration = this.duration
    } else {
      if (this.endTime) {
        // Start and end time set
        this.realtimeDuration = (this.endTime - this.startTime) / 1000
      } else {
        // Still in progress
        this.realtimeDuration = (new Date(Date.now()) - this.startTime) / 1000
        // Update the duration every second
        this.timeInterval = setInterval(() => this.realtimeDuration++, 1000)
      }
    }
  }
}
</script>
