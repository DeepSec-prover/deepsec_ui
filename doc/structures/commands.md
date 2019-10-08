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
  "command_options": // See deepsec documentation for command details
    {
      "nb_jobs": <int>,
      "round_timer": <int>,
      "default_semantics": "private" | "classic" | "eavesdrop",
      "distributed": <int>, // 0 is not distributed
      "distant_workers": [
         {
           "host": <string>, // Format "<login>@<host>"
           "path": <string>,
           "nb_workers": <int>
         },
         ...
       ]
    }
  ]
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
