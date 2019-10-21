# Run Result

See [run result mock-data](../../mock-data/run/run.json) for example.

## Status flow

![Status flow](../flows/result_status.svg)

## File

Format of name of json for run_result: `timestamp_random.json` (encoded)
`batch_folder` and `batch_file` have the same value.

## Definition of `<run_result>`:

### Waiting

```
{
  "status": "waiting",
  "batch_file": "batch_file.json"
  "input_file": <string>, // Format as "batch_folder/run_folder/name.dps",
  "query_files": [
    <string>, // Format as "batch_folder/run_folder/query_file.json"
    ...,
    <string>
  ],
  "warnings":  [ <string> ] (optional) // Warnings about the user inputs
}
```

### In Progress

waiting +
```
{
  "status": "in_progress",
  ...
  "start_time": <int> // Timestamp
}
```

### Canceled

waiting +
```
{
  "status": "canceled",
  ...
  "start_time": <int>, // Timestamp
  "end_time": <int> // Timestamp. When it has been canceled
}
```

### Internal error

waiting +
```
{
  "status": "internal_error",
  ...
  "start_time": <int>, // Timestamp
  "end_time": <int>, // Timestamp. When the error occure
  "error_msg": <string>
}
```

### Completed

waiting +
```
{
  "status": "canceled",
  ...
  "start_time": <int>, // Timestamp
  "end_time": <int> // Timestamp
}
```
