# Query Result

See [query result mock-data completed](../../mock-data/run/query_completed.json) or
[query result mock-data in progress](../../mock-data/run/query_in_progress.json) for examples.

Definition of `<query_result>`:

```
{
  "status": "in_progress",
  "start_time": <int> | null, // Timestamp or null if not started yet
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
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
  "status": "completed",
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "atomic_data": <atomic_data>,
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "process": [
    <process>,
    ...
    <process>
  ],
  "attack_trace": null | {
    "index_process": <int>, // In process array
    "action_sequence": [
      <action>,
      ...
      <action>
    ]
  } // null when the property holds.
}
```
