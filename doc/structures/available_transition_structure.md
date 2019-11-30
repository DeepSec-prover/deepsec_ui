# Available transition

Definition of `<available_transition>` :

```
{
  "type": "direct",
  "recipe_channel": <recipe>,
  "recipe_term":  <term> // Only for the attacker or generic simulator to display the recipe (could be recover from the attack trace).
  "term": <term> // Only for the attacker or generic simulator to display the term inputed.
}
```
or
```
{
  "type": "eavesdrop",
  "recipe_channel": <recipe>
}
```
or
```
{ "type": "comm" }
```

An `available_transition` `transitions` that indicates how the inputs or outputs can be applied. The value depends on the semantics:
- `classic`: I/O can be used in internal communication `comm` and/or directly `direct`.
- `private`: I/O can be used directly xor in internal communication.
- `eavesdrop`: I/O can either be used:
  - directly and/or in eavesdrop communication `eavesdrop`
  - xor in internal communication

Note that for `direct` and `eavesdrop`, there is an additional argument `recipe_channel` that correspond to the recipe to generate the channel of the action. For the attack simulator, that recipe is the same recipe as in the corresponding attack trace. For the equivalence simulator, this recipe will be used as a suggestion for the user (though he will be able to type his own recipe if he choose to).

In the case of a `direct` transition, we also provide two fields `recipe_term` and `term` that show the input term and the recipe from which the term was built.

Finally, when the user chose an I/O (resp. input) amongst the available action that has multiple available transition, he should be able to chose which one he wants to apply. Note that in the case of `comm`, if the user select an output (resp. input) with `comm` as transition, he will also have to chose an input (resp. output) that also has `comm` as transition (same thing for `eavesdrop`).
