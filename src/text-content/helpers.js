const helpers = {
  runOptions: {
    defaultSemantic: 'TODO description of defaultSemantic',
    distributed: {
      auto: 'TODO description of distributed auto',
      yes: 'TODO description of distributed yes',
      no: 'TODO description of distributed no',
    },
    nbJobs: 'TODO description of nbJobs',
    localWorkers: 'TODO description of localWorkers',
    roundTimer: 'TODO description of roundTimer',
    server: {
      host: 'TODO description of server.host',
      path: 'TODO description of server.path',
      workers: 'TODO description of server.workers'
    }
  },
  query: {
    type: {
      trace_equiv: 'TODO trace equivalence',
      trace_incl: 'TODO trace inclusion',
      observational_equiv: 'TODO observational equivalence',
      session_equiv: 'TODO session equivalence',
      session_incl: 'TODO session inclusion',
    }
  },
  semantics: {
    private: 'TODO description of private',
    classic: 'TODO description of classic',
    eavesdrop: 'TODO description of eavesdrop'
  }
}

export default helpers
