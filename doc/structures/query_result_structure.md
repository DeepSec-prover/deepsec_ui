# Query Result

See [query result mock-data completed](../../mock-data/run/query_completed.json) or
[query result mock-data in progress](../../mock-data/run/query_in_progress.json) for examples.

`<batch_folder>` and `<batch_file>` have the same value.

Definition of `<query_result>`:

```
{
  "status": "in_progress",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int> (optional), // Timestamp. If not defined then the query hasn't started
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
or
```
{
  "status": "canceled",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int> (optional), // Timestamp. If not defined then the query hasn't started
  "end_time": <int> (optional), // Timestamp. If not defined then the query hasn't started
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
or
```
{
  "status": "internal_error",
  "batch_file": "<batch_file>.json",
  "run_file": "<batch_folder>/<run_file>.json"
  "start_time": <int>,
  "end_time": <int>,
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
or
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
