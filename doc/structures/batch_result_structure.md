# Batch Result

// TODO add example.

## Status flow

![Status flow](../flows/result_status.svg)

In fact batch always skip the _waiting_ state.

## File

Format of name: `timestamp_random.json`

## Definition of `<batch_result>`:

### In progress

```
{
  "status": "in_progress",
  "start_time": <int> // Timestamp.
  "import_date": <int>, (optional) // Timestamp. Only if imported
  "title": <string>, (optional)
  "deepsec_version": <string>, // Format as "X.X.X"
  "ocaml_version": <string>,
  "git_branch": <string>,
  "git_hash": <string>,
  "debug": <bool>,
  "run_files": [
    <string>,
    ...,
    <string>
  ],
  // All options are optional
  "command_options": { // See deepsec documentation for command details
    "default_semantics": "private" | "classic" | "eavesdrop",
    "distributed": <bool> | "auto",
    "nb_jobs": <int> | "auto",
    "local_workers": <int> | "auto",
    "round_timer": <int>,
    "por": <bool>,
    "distant_workers": [
      {
        "host": <string>, // Format "<login>@<host>"
        "path": <string>,
        "workers": <int> | "auto"
      },
       ...
     ],
    "title": <string>
  },
  "computed_options": {
    "default_semantics": "private" | "classic" | "eavesdrop",
    "distributed": <bool>,
    "nb_jobs": <int>, // (optional if distributed = false)
    "local_workers": <int>, // (optional if distributed = false)
    "round_timer": <int>, // (optional if distributed = false)
    "por": <bool>,
    "distant_workers": [ // (optional if distributed = false)
      {
        "host": <string>, // Format "<login>@<host>"
        "path": <string>,
        "workers": <int>
      },
       ...
     ],
    "title": <string> // (optional)
  }
}
```

### Canceled

in_progress +
```
{
  "status": "canceled",
  ...
  "end_time": <int> // Timestamp. When it has been canceled
}
```

### Internal Error

in_progress +
```
{
  "status": "internal_error",
  ...
  "end_time": <int>, // Timestamp. When the error occurs
  "error_msg": <string>
}
```

### Completed

in_progress +
```
{
  "status": "completed",
  ...
  "end_time": <int> // Timestamp.
}
```
