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
  "command": "goto_step",
  "id": <int>
}
```

Display of a step: API -> UI

```
{
  "command": "current_step",
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "current_action_id": <int> // action index in attack_trace.action_sequence. Start from -1.
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

When the query file does not contain an attack trace: API -> UI

```
{ "command": "no_attack_trace" }
```

### Current step

Available transition: `<available_transition>`:

```
{
  "type": "direct" | "eavesdrop",
  "recipe": <recipe>
}
```
or
```
{ "type": "comm" }
```

Available actions: `<available_action>`:

```
{
  "type": "input" | "output",
  "channel": <term>,
  "position": <position>,
  "tau_positions": [<position>,...,<position>],
  "transitions": [<available_transition>,...,<available_transition>]
}
```
or
```
{
  "type": "bang" | "choice",
  "position": <position>,
  "tau_positions": [<position>,...,<position>]
}
```
or
```
{
  "type": "tau",
  "position": <position>
}
```

Witness of non static equivalence : `<status_static_equivalence>`
```
{
  "status": "equivalent"
}
```
or
```
{
  "status": "non_equivalent_message",
  "recipe": <recipe>,
  "term": <term>,
  "process_id": <int>
}
```
or
```
{
  "status": "non_equivalent_equality",
  "recipe1": <recipe>,
  "recipe2": <recipe>,
  "term_equal": <term>,
  "term1": <term>,
  "term2": <term>,
  "process_id": <int>
}
```
The status of static equivalence indicates whether the the corresponding traces are statically equivalent or not. When they are not equivalent, we have two types of witness.
- Either a recipe can compute a message on one trace but not the other: Correspond to the status `"non_equivalent_message"`. The faulty recipe is the one on label `"recipe"`. When `"on_attack_trace"` is true (resp. false), it means that the recipe can compute the term `"term"` on the attack (resp. simulated) trace but cannot compute a message on the simulated (resp. attack) trace.
- or there are two recipes `"recipe1"` and `"recipe2"` that computes to the same term `"term_equal"` on the attack (resp. simulated) trace when `"on_attack_trace"` is `true` (resp. `false`) but computes to two different terms `"term1"` and `"term2"` on the simulated (resp. attack) trace.


Current simulator step: API -> UI

```
{
  "command": "current_step_attacked",
  "process_id": <int>,
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "current_id": <int> // action index in attack_trace.action_sequence. Start from -1.
}
```
or
```
{
  "command": "current_step_simulated",
  "process_id": <int>,
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "new_actions": [ <action>,...,<action> ],
  "all_available_actions": [ <available_actions> ,..., <available_actions> ],
  "default_available_actions": [ <available_actions> ,..., <available_actions> ],
  "status_equiv": <status_static_equivalence>
}
```

This is the core data structure. As we give the possibility to the user to simultaneously display the simulated process and the attacked process, we need to keep the state of the processes and their frame in the different current step.
When the label `"on_attack_trace"` is at `true`, the current step represents the state of the attack trace whereas the current step represents the state of the simulated trace when `"on_attack_trace"` is at `false`. Note that the current step for the attack trace has the same functionalities as in the trace display.

For the simulated trace, `"new_actions"` represents the list of new actions chosen by the user. The label `"minimum_current_action"` indicates the minimal action index of that the attack trace that can be shown. That is: User is free to show the attack trace from `"minimum_current_action"` to the last one.

The available actions correspond to all the actions that the user can select for the next step. Note that there are two versions: `"full_available_actions"` represents the actions when the detail level is `"all"`; `"io_available_actions"` represents the actions when the detail level is `"io_only"` or `"default"`. Thus, in this case, there is no difference between the detail levels `"io_only"` and `"default"`.

In an available action, the label `"position"` is the position of the process and the label `"tau_positions"` is the list of tau action positions that can be automatically performed in order to apply the available action. Note that in the actions of `"full_available_actions"`, the lists `"tau_positions"` are always empty since the user must select himself all the tau actions.

For inputs and outputs, there is an additional label `"transitions"` that indicates how the input or output can be applied. The value depends on the semantics:
- `"classic"`: I/O can be used in internal communication `"comm"` and/or directly `"direct"`.
- `"private"`: I/O can be used directly xor in internal communication.
- `"eavesdrop"`: I/O can be used either be used:
  - directly and/or in eavesdrop communication `"eavesdrop"`
  - xor in internal communication

Note that for `"direct"` and `"eavesdrop"`, there is an additional argument `"recipe"` that correspond to the recipe to generate the channel of the action. For the attack simulator, that recipe is the same recie as in the corresponding attack trace. For the equivalence simulator, this recipe will be used as a suggestion for the user (though he will be able to type his own recipe if he choose to).

Finally, when the user chose an I/O (resp. input) amongst the available action that has multiple available transition, he should be able to chose which one he wants to apply. Note that in the case of `"comm"`, if the user select an output (resp. input) with `"comm"` as transition, he will also have to chose an input (resp. output) that also has `"comm"` as transition (same thing for `"eavesdrop"`).

### Browsing commands

Apply a next step: UI -> API
```
{
  "command": "next_step_simulated",
  "detail": "default" | "io_only" | "all", // Indicates the level of detail
  "selected_action": <action> // TODO maybe custom type to remove recipes
}
```

Apply the previous step: UI -> API

```
{
  "command": "goto_step",
  "process_id": <int>,
  "id": <int>
}
```

Possible errors:
```
{
  "command": "error_syntax"
  "string": <string>
}
```
or
```
{
  "command": "error_function"
  "function": <string>
}
```
or
```
{
  "command": "error_axiom",
  "recipe": <recipe>,
  "axiom": <int>
}
```
or
```
{
  "command": "error_recipe",
  "recipe": <recipe>
}
```
or
```
{
  "command": "error_channel",
  "recipe": <recipe>,
  "term": <term>
  "channel": <term>
}
```
The error `"error_syntax"` indicates that the string cannot be parsed as a recipe. The error `"error_axiom"` indicates that the recipe contains an axiom that does not fit within the frame. The error `error_function` indicates that the function `function` is unknown. The error `"error_recipe"` indicates that the recipe given by the internal user does not compute into a message. The error `"error_channel"` indicates the `term` corresponding to the `recipe` is not equal to the `channel`.

## Equivalence simulator

Commands for the simulator when the query is true, i.e. no attack has been found. The simulator works in two phases. In the first phase, the user must choose a trace in one of the two processes. In the second phase, the user choose how to match that trace in the other process.

Starting the attack simulator: UI -> API

```
{
  "command": "start_equivalence_simulator",
  "query_file": <string>, // Relative path of the query result json file
}
```

When the query file contains an attack trace: API -> UI

```
{ "command": "attack_trace" }
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
  "action_sequence": [<action>,...,<action>]
}
```

### Current step on phase 1

Send the current step: API -> UI
```
{
  "command": "current_step",
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "new_actions": [ <action>,...,<action> ],
  "default_available_actions": [ <available_actions> ,..., <available_actions> ],
  "all_available_actions": [ <available_actions> ,..., <available_actions> ]
}
```

### Current step on phase 2

Send the current step: API -> UI
```
{
  "command": "current_step",
  "process_id": <int>,
  "process": <process>,
  "frame": [ <term>,...,<term> ],
  "current_action_id": <int> // action index from the trace. Start from -1.
}
```

### Browsing commands

Go to a specific step: UI -> API

```
{
  "command": "goto_step",
  "id": <int>,
  "process_id": <int>
}
```

We have the same possible errors in phase 1 as in the attack simulator.
