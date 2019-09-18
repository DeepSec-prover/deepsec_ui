<template>
  <form>
    <div>
      <label for="files">Files : </label>
      <input type="file" id="files" name="files"/>
    </div>
    <div>
      <span>Default Semantic : </span>
      <span>
        <input type="radio" id="semantic_private" name="default_semantic" value="private">
        <label for="semantic_private">Private</label>
      </span>
      <span>
        <input type="radio" id="semantic_classic" name="default_semantic" value="classic">
        <label for="semantic_classic">Classic</label>
      </span>
      <span>
        <input type="radio" id="semantic_eavesdrop" name="default_semantic" value="eavesdrop">
        <label for="semantic_eavesdrop">Eavesdrop</label>
      </span>
    </div>
    <div>
      <input type="checkbox" id="distributed" name="distributed" v-model="isDistributed">
      <label for="distributed">Distributed</label>
    </div>
    <div v-show="isDistributed">
      <div>
        <label for="nb_jobs">Nb jobs : </label>
        <input type="number" id="nb_jobs" name="nb_jobs">
      </div>
      <div>
        <label for="timer">Timer (s) : </label>
        <input type="number" id="timer" name="timer">
      </div>
      <div>
        <label for="nb_process_local">Nb process local : </label>
        <input type="number" id="nb_process_local" name="nb_process_local">
      </div>
      <div>
        <button>Add distant server</button>
      </div>
      <div>
        <div><label for="distant_hostname">Hostname : </label><input type="text" id="distant_hostname"></div>
        <div><label for="distant_local_path">Local path : </label><input type="text" id="distant_local_path"></div>
        <div><label for="nb_process_distant">Nb Process : </label><input type="number" id="nb_process_distant"></div>
      </div>
    </div>
  </form>
</template>

<script>
  export default {
    name: 'preferences',
    data () {
      return {
        isDistributed: false
      }
    }
  }
</script>

<style scoped>

</style>
