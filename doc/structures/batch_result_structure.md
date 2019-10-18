# Batch Result

// TODO add example.

## Status flow

![Status flow](../flows/result_status.svg)

In fact batch always skip the _waiting_ state.

## File

Format of name: `timestamp_random.json`

## Definition of `<batch_result>`:

```
{
  "status": "in_progress" | "completed" | "internal_error" | "canceled",
  "error_msg": <string>, (optional) // If status = "internal_error"
  "deepsec_version": <string>, // Format as "X.X.X"
  "git_branch": <string>,
  "git_hash": <string>,
  "run_files": [
    <string>,
    ...,
    <string>
  ],
  "import_date": <int>, (optional) // Timestamp. Only if imported
  "command_options": { // See deepsec documentation for command details
    "nb_jobs": <int>,
    "round_timer": <int>,
    "default_semantics": "private" | "classic" | "eavesdrop",
    "distributed": <int>, // 0 is not distributed
    "without_por": <bool>,
    "distant_workers": [
      {
        "host": <string>, // Format "<login>@<host>"
        "path": <string>,
        "nb_workers": <int>
      },
       ...
     ]
  }
}
```
