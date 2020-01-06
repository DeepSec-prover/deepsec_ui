const text = {
  status: {
    waiting: 'waiting',
    in_progress: 'in progress',
    completed: 'completed',
    internal_error: 'stopped by internal error',
    canceled: 'canceled'
  },
  query: {
    type: {
      trace_equiv: 'Trace equivalence',
      trace_incl: 'Trace inclusion',
      observational_equiv: 'Observational equivalence',
      session_equiv: 'Session equivalence',
      session_incl: 'Session inclusion'
    },
    results: {
      // Use %p for attacked process number and %q for the other one
      attack: {
        trace_equiv: {
          short: 'Not trace equivalent',
          long: 'The processes are not trace equivalent. The following trace from process %p doesn\'t have an equivalent in process %q.'
        },
        trace_incl: {
          short: 'Not trace included',
          long: 'The process %p is not trace included in %q. The following trace from process %p doesn\'t have an equivalent in process %q.'
        },
        observational_equiv: {
          short: 'TODO short description attack',
          long: 'TODO long description attack'
        },
        session_equiv: {
          short: 'Not session equivalent',
          long: 'The processes are not session equivalent. The following trace from process %p doesn\'t have an equivalent in process %q.'
        },
        session_incl: {
          short: 'Not session included',
          long: 'The process %p is not session included in %q. The following trace from process %p doesn\'t have an equivalent in process %q.'
        }
      },
      no_attack: {
        trace_equiv: {
          short: 'Trace equivalent',
          long: 'The processes are trace equivalent. No attack trace found.'
        },
        trace_incl: {
          short: 'Trace included',
          long: 'The process 1 is trace included in process 2.'
        },
        observational_equiv: {
          short: 'TODO short description no attack',
          long: 'TODO long description no attack'
        },
        session_equiv: {
          short: 'Session equivalent',
          long: 'The processes are session equivalence. No attack trace found.'
        },
        session_incl: {
          short: 'Session inluded',
          long: 'The process 1 is session included in process 2.'
        }
      }
    },
    equivalence_status: {
      equivalent: 'Equivalent',
      non_equivalent_message: 'Frames not statically equivalent',
      non_equivalent_equality: 'Frames not statically equivalent'
    }
  }
}

export default text
