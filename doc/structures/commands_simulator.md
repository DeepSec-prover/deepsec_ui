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
  "current_action": <int> // action index in attack_trace.action_sequence. Start from -1.
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
  "position": <position>,
  "tau_positions": [<position>,...,<position>], //
  "transitions": [<available_transition>,...,<available_transition>]
}
```
or
```
{
  "type": "bang" | "choice",
  "position": <position>,
  "tau_positions": [<position>,...,<position>] //
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
  "on_attack_trace": <bool>
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
  "on_attack_trace": <bool>
}
```
The status of static equivalence indicates whether the the corresponding traces are statically equivalent or not. When they are not equivalent, we have two types of witness.
- Either a recipe can compute a message on one trace but not the other: Correspond to the status `"non_equivalent_message"`. The faulty recipe is the one on label `"recipe"`. When `"on_attack_trace"` is true (resp. false), it means that the recipe can compute the term `"term"` on the attack (resp. simulated) trace but cannot compute a message on the simulated (resp. attack) trace.
- or there are two recipes `"recipe1"` and `"recipe2"` that computes to the same term `"term_equal"` on the attack (resp. simulated) trace when `"on_attack_trace"` is `true` (resp. `false`) but computes to two different terms `"term1"` and `"term2"` on the simulated (resp. attack) trace.


Current simulator step: API -> UI

```
{
  "command": "current_step",
  "attacked_process": <process>,
  "attacked_frame": [ <term>,...,<term> ],
  "simulated_process": <process>,
  "simulated_frame" <process>,
  "current_action": <int> // action index in attack_trace.action_sequence. Start from -1.
  "simulated_trace": [ <action>,...,<action> ],
  "full_available_actions": [ <available_actions> ,..., <available_actions> ],
  "io_available_actions": [ <available_actions> ,..., <available_actions> ],
  "status_equiv": <status_static_equivalence>
}
```
This is the core data structure. As we give the possibility to the user to simultaneously display the simulated process and the attacked process, we keep the state of the processes and their frame in the current step. The label `"current_action"` corresponds to the current action in the attack trace. On the other hand, the label `"simulated_trace"` is the trace within the simulated process.

The available actions correspond to all the actions that the user can select for the next step. Note that there are two versions: `"full_available_actions"` represents the actions when the detail level is `"full"`; `"io_available_actions"` represents the actions when the detail level is `"io_only"` or `"standard"`. Thus, in this case, there is no difference between the detail levels `"io_only"` and `"standard"`.

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
  "command": "next_step",
  "detail": "standard" | "io_only" | "full", // Indicates the level of detail
  "selected_action": <action_simulator>
}
```

Apply the previous step: UI -> API

```
{
  "command": "previous_step",
  "detail": "standard" | "io_only" | "full" // Indicates the level of detail
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
  "command": "error_recipe",
  "recipe": <recipe>
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
  "command": "error_channel",
  "recipe": <recipe>,
  "term": <term>
  "channel": <term>
}
```
The error `"error_syntax"` indicates that the string cannot be parsed as a recipe. The error `"error_recipe"` indicates that the recipe given by the internal user does not compute into a message. The error `"error_recipe"` indicates that the recipe contains an axiom that does not fit within the frame.  The error `"error_channel"` indicates the `term` corresponding to the `recipe` is not equal to the `channel`.
