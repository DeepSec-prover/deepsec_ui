# Batch Result

// TODO See [run result mock-data](../../mock-data/run/run.json) for example.

Format of name of json for batch_result:

  `<timestamp>"_"<random>.json`


Definition of `<batch_result>`:

```
{
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
  "command_options": [ // See deepsec documentation for command details
    {
      "label": "nb_jobs",
      "value": <int>
    },
    {
      "label": "round_timer",
      "value": <int>
    },
    {
      "label": "default_semantics",
      "value": <string> // "private" | "classic" | "eavesdrop"
    },
    {
      "label": "distant_workers",
      "value": [
        {
          "host": <string>, // Format "<login>@<host>"
          "path": <string>,
          "nb_workers": <int>
        },
        ...
      ]
    },
    {
      "label": "without_por"
    },
    {
      "label": "distributed",
      "value": <int> // 0 = not distributed
    }
  ]
}
```
