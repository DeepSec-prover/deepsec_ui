# Commands for simulator and trace display

## Main commands

Kill the API: UI -> API

```
{ "command": "die" }
```

Request a specific step: UI -> API

```
{
  "command": "goto_step",
  "id": <int>,
  "process_id": <int> // 1 or 2
}
```

Current step of a displayed process: API -> UI

```
{
  "command": "current_step_displayed",
  "process_id": <int>, // 1 or 2. Optional (Only used for attack and equivalence simulator)
  "process": <process>,
  "frame": [ <term> ],
  "current_action_id": <int> // Do you actually use that ? I don't think so.
}
```

Current step of a process with user selected actions: API -> UI

```
{
  "command": "current_step_user",
  "process_id": <int>,
  "process": <process>,
  "frame": [ <term> ],
  "available_actions": {
    "all": [ <available_actions> ],
    "default": [ <available_actions> ]
  }
  "status_equiv": <status_static_equivalence>, // Optional. Used only in the attacker and generic simulator.
  "new_actions": [ <action>,...,<action> ], // Empty in response of a "goto_step" command.
}
```

This is the core data structure that provide the next available actions that a user can select. The label `new_actions` represents the list of last actions chosen by the user. This list is empty in response to a `goto_step` command. The available actions correspond to all the actions that the user can select for the next step depending on the detail level. Note that there is only two detail level for the user : `all` and `default`. The detail lelvel `IO` is only available for a displayed process.

Apply a next step chosen by user: UI -> API

```
{
  "command": "next_step_user",
  "action": <selected_action>
}
```

Apply several steps (to redo the steps): UI -> API

```
{
  "command": "next_steps",
  "actions": [ <actions> ]
}
```

## Trace display

Starting a trace display: UI -> API

```
{
  "command": "start_display_trace",
  "query_file": <string>, // Relative path of the query result json file
  "id": <int> // Id of the first action to display.
}
```

## Attack simulator

Commands for the simulator when the query is false, i.e. an attack has been found. We call `attacked_process` the process that contains the attack trace. We call `simulated_process` the process that the user can simulate. As such, the user has the possibility to chose actions in the simulated process but it must follow the attack trace.

Starting the attack simulator: UI -> API

```
{
  "command": "start_attack_simulator",
  "query_file": <string>, // Relative path of the query result json file
}
```

## Equivalence simulator

Commands for the simulator when the query is true, i.e. no attack has been found. The simulator works in two phases. In the first phase, the user must choose a trace in one of the two processes. In the second phase, the user choose how to match that trace in the other process.

Starting the equivalence simulator: UI -> API

```
{
  "command": "start_equivalence_simulator",
  "query_file": <string>, // Relative path of the query result json file,
  "process_id": <int>
}
```

Search for a trace: API -> UI
This command can be run whenever the user wish to select a new trace to match. It restart the
phase 1 of the simulator.
```
{
  "command": "select_trace",
  "start": <int> // 0, 1 or 2 : If 0 then the the simulator restart at the same the current attack trace was
    // if 1 then the simulator restarts from the initial process 1
    // if 2 then the simulator restarts from the initial process 2
}
```

Find an equivalent trace: API -> UI

```
{ "command": "find_equivalent_trace" }
```

Equivalent trace found: UI -> API

```
{
  "command": "found_equivalent_trace",
  "action_sequence": [ <action> ]
}
```



User error from the user when inputing recipes : API -> UI

```
{
  "command": "user_error",
  "string": <string>
}
```

## Generic simulator

Starting the generic equivalence simulator: UI -> API

```
{
  "command": "start_generic_simulator",
  "file": <string>, // Path of the dps,
  "query_id": <int> // User select directly which query he wants to check ?
}
```

Reply to the start of generic equivalence simulator: API -> UI

```
{
  "command": "generic_simulator_started",
  "query_result": <query_result>
}
```

The generic simulator proceeds like the equivalence simulator except that the command `find_equivalent_trace` could potentially be answered by the negative, as shown in the following command.

No equivalent trace has been found, i.e. the user trace is an attack trace: UI -> API

```
{
  "command": "no_equivalent_trace"
}
```

In such a case, we just ask the user if he want to simulate this attack trace. If so then we just run the attack simulator using the following starting command:

```
{
  "command": "simulate_attack",
  "attack_trace": [<action>]
}
```
