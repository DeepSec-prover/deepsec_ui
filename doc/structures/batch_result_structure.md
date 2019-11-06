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
  "deepsec_version": <string>, // Format as "X.X.X"
  "ocaml_version": <string>,
  "git_branch": <string>,
  "git_hash": <string>,
  "run_files": [
    <string>,
    ...,
    <string>
  ],
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
  },
  "computed_options": {
    "default_semantics": "private" | "classic" | "eavesdrop",
    "distributed": <bool>,
    "nb_jobs": <int>,
    "local_workers": <int>,
    "round_timer": <int>,
    "por": <bool>,
    "distant_workers": [
      {
        "host": <string>, // Format "<login>@<host>"
        "path": <string>,
        "workers": <int>
      },
       ...
     ],
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
