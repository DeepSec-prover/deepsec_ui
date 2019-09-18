<template>
  <div class="home">
    <Process v-bind:code="code"/>
  </div>
</template>

<script>
  // @ is an alias to /src
  import Process from '@/components/Process.vue'
  import { ipcRenderer } from 'electron'
  import logger from 'electron-log'
  import openJsonFile from '@/util/input-tools'
  import formatProcess from '@/util/process-parser'
  import settings from '../../settings'
  import path from 'path'

  export default {
    name: 'home',
    components: {
      Process
    },
    data: () => {
      return {
        code: ''
      }
    },
    methods: {
      showProcess (filePath) {
        let process = openJsonFile(filePath)
        if (process) {
          this.code = formatProcess(process.process1, process.atomic_data)
        }
      }
    },
    mounted () {
      // Wait to receive a path to a result file, then show it on the page
      ipcRenderer.on('result:show', (event, filePath) => {
        logger.debug('Received IPC message : result:show')
        this.showProcess(filePath)
      })

      if (settings.mockDataAsDefault) {
        this.showProcess(path.join(__static, '../mock-data/process_example.json'))
      }
    }
  }
</script>
