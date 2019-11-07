# Commands for simulator and trace display

## Generic command

Kill the API: UI -> API

```
{ "command": "die" }
```

API is dead: API -> UI

```
{ "command": "exit" }
```


## Trace display

Starting a trace display: UI -> API

```
{
  "command": "start_trace_display",
  "query_file": <string>, // Path of the query result json file

}
```

When the query file does not contain an attack trace: API -> UI

```
{ "command": "no_attack_trace" }
```

When the query file contains an attack trace and finished loading: API -> UI

```
{ "command": "ready" }
```

Displaying next step: UI -> API

```
{
  "command": "next_step",
  "detail": "standard" | "io_only" | "full" // Indicates the level of detail
}
```

Displaying previous step: UI -> API

```
{
  "command": "previous_step",
  "detail": "standard" | "io_only" | "full" // Indicates the level of detail
}
```

When no step is available (next of prev): API -> UI

```
{ "command": "step_unavailable" }
```

Display of a step: API -> API

```
{
  "command": "current_step",
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "trace": [ <action>,...,<action> ]
}
```
