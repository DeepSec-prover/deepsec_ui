# Query Result

See [query result mock-data completed](../../mock-data/run/query_completed.json) or
[query result mock-data in progress](../../mock-data/run/query_in_progress.json) for examples.

Definition of `<query_result>`:

```
{
  "status": "in_progress",
  "start_time": <int> // Timestamp
}
```
or
```
{
  "status": "completed",
  "start_time": <int> // Timestamp
  "end_time": <int> | null, // Timestamp or null if not over
  "atomic_data": <atomic_data>,
  "rewrite_rules": [
    {
      "symbol": <int>, // index of atomic data
      "left_hand_side": [
        <term>,
        ...
        <term>
      ],
      "right_hand_side": <term>
    }
  ],
  "semantics": <string>, // "private" | "classic" | "eavesdrop"
  "process": [
    <process>,
    ...
    <process>
  ],
  "is_verified": <bool>,
  "attack_trace": {
    "index_process": <int>, // In process array
    "action_sequence": [
      <action>,
      ...
      <action>
    ]
  }
}
```
