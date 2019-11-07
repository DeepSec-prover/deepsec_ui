# Commands

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
Reply to start a run : DeepSec -> UI

```
{
  "command": "batch_started",
  "file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "run_started",
  "file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "query_started",
  "file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "run_ended",
  "status": "user_error" | "internal_error" | "completed" | "canceled",
  "file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "query_ended",
  "status": "internal_error" | "completed" | "canceled",
  "file": <string> // Path
}
```

Ending all run : DeepSec -> UI

```
{
  "command": "batch_ended"
}
```


Canceling a run : UI -> DeepSec

```
{
  "command": "cancel_run",
  "file": <string> // Path
}
```

Canceling a query : UI -> DeepSec

```
{
  "command": "cancel_query",
  "file": <string> // Path
}
```

Canceling a batch: UI -> DeepSec

```
{
  "command": "cancel_batch"
}
```

```
{
  "command": "exit"
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
