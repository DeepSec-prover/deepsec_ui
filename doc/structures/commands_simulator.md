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
  "command": "start_display_trace",
  "query_file": <string>, // Relative path of the query result json file
}
```

When the query file does not contain an attack trace: API -> UI

```
{ "command": "no_attack_trace" }
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

Display of a step: API -> UI

```
{
  "command": "current_step",
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "current_action": <int> // action index in attack_trace.action_sequence. Start from -1.s
}
```
