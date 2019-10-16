# Batch Result

// TODO See [run result mock-data](../../mock-data/run/run.json) for example.

Format of name of json for batch_result:

  `<timestamp>"_"<random>.json`


Definition of `<batch_result>`:

```
{
  "status": "in_progress" | "completed" | "internal_error" | "canceled",
  "error_msg": <string>, // If status = "internal_error"
  "deepsec_version": <string>, // Format as "X.X.X"
  "git_branch": <string>,
  "git_hash": <string>,
  "run_result_files": [
    <string>, // Ex: <timestamp>"_"<random>/<dps file name>_<random>.json
    ...,
    <string>
  ] (optional)
  "run_results": [
    <run_results>,
    ...,
    <run_results>
  ], (optional)
  "import_date": <int>, (optional) // Timestamp
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
