# Run Result

See [run result mock-data](../../mock-data/run/run.json) for example.

Definition of `<run_result>`:

At least one of `input_file` or `input_str` should be present.  
At least one of `query_result_files` or `query_results` should be present.  

```
{
  "deepsec_version": <string>, // Format as "X.X.X"
  "run_hash": <string>,
  "git_branch": <string>,
  "git_hash": <string>,
  "input_file": <string>, (optional) // Format as "<relative_path>/<name>.<version>.dps",
  "input_str": <string>, (optional) // Full content of the .dps file
  "start_time": <int>, // Timestamp
  "end_time": <int> | null, // Timestamp or null if not over
  "import_date": <int> | null, // Timestamp or null if not imported
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
      "label": "no_display_attack_trace",
      "value": <bool>
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
      "label": "without_por",
      "value": <bool>
    },
    {
      "label": "distributed",
      "value": <int> // 0 = not distributed
    }
  ],
  "query_result_files": (optional) [
    <string>, // Format as "<relative_path>/query_<id>.json"
    ...,
    <string>
  ],
  "query_results": (optional) [
    <query_result>,
    ...
    <query_result>
  ]
}
```
