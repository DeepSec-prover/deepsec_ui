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
      "label": "distributed",
      "value": <int> // 0 = not distributed
    }
  ]
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "start_run",
  "result_file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "start_query",
  "result_file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "end_run",
  "status": "user_error" | "internal_error" | "completed" | "canceled",
  "result_file": <string> // Path
}
```

Reply to start a run : DeepSec -> UI

```
{
  "command": "end_query",
  "status": "internal_error" | "completed" | "canceled",
  "result_file": <string> // Path
}
```

Ending all run : DeepSec -> UI

```
{
  "command": "end_all_run"
}
```


Canceling a run : UI -> DeepSec

```
{
  "command": "cancel_run",
  "result_file": <string> // Path
}
```

Canceling a query : UI -> DeepSec

```
{
  "command": "cancel_query",
  "result_file": <string> // Path
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
