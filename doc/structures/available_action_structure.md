# Available action

Definition of `<available_action>` :

```
{
  "type": "input" | "output",
  "channel": <term>,
  "position": <position>,
  "tau_positions": [ <position> ],
  "transitions": [ <available_transition> ]
}
```
or
```
{
  "type": "bang" | "choice",
  "position": <position>,
  "tau_positions": [ <position> ]
}
```
or
```
{
  "type": "tau",
  "position": <position>
}
```

In an available action, the label `"position"` is the position of the process and the label `"tau_positions"` is the list of tau action positions that can be automatically performed in order to apply the available action. Note that for an available action corresponding to the detail level `all`, the list `tau_positions` is always empty since the user must select himself all the tau actions. For inputs and outputs, there is an additional label `transitions` that indicates how the input or output can be applied. 
