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

waiting +
```
{
  "status": "in_progress",
  ...
  "start_time": <int> // Timestamp
}
```

### Canceled

waiting +
```
{
  "status": "canceled",
  ...
  "start_time": <int> (optional), // Timestamp. Not defined if the query was cancled before to start 
  "end_time": <int> // Timestamp. When it has been canceled
}
```

### Internal Error

waiting +
```
{
  "status": "internal_error",
  ...
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp. When the error occure
  "error_msg": <string>
}
```

### Completed

waiting +
```
{
  "status": "completed",
  ...
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "attack_trace": {
    "index_process": <int>, // In process array (starting from 1)
    "action_sequence": [
      <action>,
      ...
      <action>
    ]
  } (optional) // If not defined then the query is verified.
}
```
