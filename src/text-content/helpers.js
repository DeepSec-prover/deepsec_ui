const helpers = {
  runOptions: {
    defaultSemantic: 'Specify the default semantics of the process calculus.',
    distributed: {
      auto: 'Activates the distributed computation when the<br>number of physical cores in your computer > 1.',
      true: 'Activates the distributed computation.',
      false: 'Does not activate the distributed computation.'
    },
    nbJobs: 'Number of computation jobs generated and then distributed to the local workers.',
    localWorkers: 'Number of local workers on which the computation is distributed.',
    roundTimer: 'Number of seconds to wait between the first time a local<br>worker becomes idle and the generation of a new set of jobs.',
    por: 'When true, Partial Order Reduction (POR) techniques are<br>used to verify trace equivalence on determinate processes.',
    server: {
      host: 'SSH address of the distant server.',
      path: 'Path on the server to the directory containing the deepsec executable. ',
      workers: 'Number of workers used on the server.'
    }
  },
  query: {
    type: {
      trace_equiv: 'Trace equivalence between processes 1 and 2.',
      trace_incl: 'Trace inclusion of process 1 into process 2.',
      observational_equiv: 'Oberservational equivalence between processes 1 and 2.',
      session_equiv: 'Session equivalence between processes 1 and 2.',
      session_incl: 'Session inclusion of process 1 into process 2.'
    }
  },
  semantics: {
    private: 'Internal communication only allowed on private channels.',
    classic: 'Internal communicationons allowed on all channels.',
    eavesdrop: 'Internal communication only allowed on private channels and<br>the attacker is allowed to eavesdrop on public channels.'
  },
  traceLevel: {
    default: 'Only display input/output/choice/replication transitions. Other &tau; transitions are hidden.',
    io: 'Only display input/output transitions. &tau; transitions are hidden.',
    all: 'Display all transitions.'
  }
}

export default helpers
