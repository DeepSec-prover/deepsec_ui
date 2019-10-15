# Run Result

See [run result mock-data](../../mock-data/run/run.json) for example.

## Status flow

![Status flow](../flows/result_status.svg)

Format of name of json for run_result: `timestamp_random.json` (encoded)

## Definition of `<run_result>`:

At least one of `input_file` or `input_str` should be present.  
At least one of `query_result_files` or `query_results` should be present.

`<batch_folder>` and `<batch_file>` have the same value.

```
{
  "status": "completed" | "in_progress",
  "batch_file": "batch_file.json"
  "input_file": <string>, (optional) // Format as "<batch_folder>/<run_folder>/<name>.dps",
  "input_str": <string>, (optional) // Full content of the .dps file
  "start_time": <int>, // Timestamp. If not defined then file hasn't been run yet.
  "end_time": <int>, (optional) // Timestamp. If not defined then status is "in_progress"
  "query_result_files": (optional) [
    <string>, // Format as "batch_folder/run_folder/query_file.json"
    ...,
    <string>
  ],
  "query_results": (optional) [
    <query_result>,
    ...
    <query_result>
  ],
  "warnings":  [ <string> ] (optional)
}
```
or
```
{
  "status": "internal_error",
  "batch_file": "<batch_file>.json"
  "input_file": <string>, (optional) // Format as "<batch_folder>/<run_folder>/<name>.dps",
  "input_str": <string>, (optional) // Full content of the .dps file
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "query_result_files": (optional) [
    <string>, // Format as "<batch_folder>/<run_folder>/query_<id>.json"
    ...,
    <string>
  ],
  "error_msg": <string>,
  "warnings":  [ <string> ] (optional)
}
```
or
```
{
  "status": "canceled",
  "batch_file": "<batch_file>.json"
  "input_file": <string>, (optional) // Format as "<batch_folder>/<run_folder>/<name>.dps",
  "input_str": <string>, (optional) // Full content of the .dps file
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp
  "query_result_files": (optional) [
    <string>, // Format as "<batch_folder>/<run_folder>/query_<id>.json"
    ...,
    <string>
  ],
  "warnings":  [ <string> ] (optional)
}
```
