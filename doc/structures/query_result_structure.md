# Query Result

See [query result mock-data completed](../../mock-data/run/query_completed.json) or
[query result mock-data in progress](../../mock-data/run/query_in_progress.json) for examples.

## Status flow

![Status flow](../flows/result_status.svg)

## File

`batch_folder` and `batch_file` have the same name.

## Definition of `<query_result>`:

### Waiting

```
{
  "status": "waiting",
  "batch_file": "batch_file.json",
  "run_file": "batch_folder/run_file.json"
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "type": <string>, // "trace_equiv" | "trace_incl" | "observational_equiv" | "session_equiv" | "session_incl"
  "process": [
    <process>,
    ...
    <process>
  ],
}
```

### In Progress

```
{
  "status": "in_progress",
  "batch_file": "batch_file.json",
  "run_file": "batch_folder/run_file.json"
  "start_time": <int>, // Timestamp
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "type": <string>, // "trace_equiv" | "trace_incl" | "observational_equiv" | "session_equiv" | "session_incl"
  "process": [
    <process>,
    ...
    <process>
  ],
}
```

### Canceled

```
{
  "status": "canceled",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int> (optional), // Timestamp. Not defined if the query was cancled before to start 
  "end_time": <int>, // Timestamp. When is has been canceled
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "type": <string>, // "trace_equiv" | "trace_incl" | "obs_equiv" | "session_equiv" | "session_incl"
  "process": [
    <process>,
    ...
    <process>
  ],
}
```

### Internal Error

```
{
  "status": "internal_error",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "type": <string>, // "trace_equiv" | "trace_incl" | "obs_equiv" | "session_equiv" | "session_incl"
  "process": [
    <process>,
    ...
    <process>
  ],
  "error_msg": <string>
}
```

### Completed

```
{
  "status": "completed",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "type": <string>, // "trace_equiv" | "trace_incl" | "observational_equiv" | "session_equiv" | "session_incl"
  "process": [
    <process>,
    ...
    <process>
  ],
  "attack_trace": {
    "index_process": <int>, // In process array
    "action_sequence": [
      <action>,
      ...
      <action>
    ]
  } (optional) // If not defined then the query is verified.
}
```
