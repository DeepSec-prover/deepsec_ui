# Commands : Start Run

Starting a run: UI -> DeepSec

```
{
  "command": "start_run",
  "input_files": [
    <string>, // Path
    ...,
    <string>
  ],
  "command_options": { // See deepsec documentation for command details
    "nb_jobs": <int> | "auto",
    "local_workers": <int> | "auto",
    "round_timer": <int>,
    "default_semantics": "private" | "classic" | "eavesdrop",
    "distributed": <bool> | "auto",
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
  }
}
```
Reply to start of a batch : DeepSec -> UI

```
{
  "command": "batch_started",
  "file": <string> // Path,
  "warning_runs": [
    {
      "file": <string>,
      "warnings": [<string>]
    }
  ]
}
```

Reply to start of a run / query : DeepSec -> UI

```
{
  "command": "run_started" | "query_started",
  "file": <string> // Path
}
```

Command sent when a batch / run / query has ended : DeepSec -> UI

```
{
  "command": "batch_ended" | "run_ended" | "query_ended",
  "file": <string> // Path
}
```

Canceling a run / query : UI -> DeepSec

```
{
  "command": "cancel_run" | "cancel_query",
  "file": <string> // Path
}
```

Canceling a batch: UI -> DeepSec

```
{
  "command": "cancel_batch"
}
```
The two previous commands behave similarly.


Get config: UI -> DeepSec
```
{
  "command": "get_config"
}
```

Set config: UI -> DeepSec
```
{
  "command": "set_config",
  "output_dir": <string>
}
```

Progression: DeepSec -> UI
```
{
  "command": "query_progression",
  "file": <string>,
  "round": <int>, // Single core = 0
  "verification": {
    "percent": <int>, // 0-100
    "jobs_remaining": <int>
  },
  "generation": {
    "minimum_jobs": <int>,
    "jobs_created": <int>
  }
  // Can have either verification or generation but not both at the same time.
}
```
