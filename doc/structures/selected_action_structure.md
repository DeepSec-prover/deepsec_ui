# Selected action

Definition of `<selected_action>` :

```
{
  "type": "output",
  "channel": <string>, // Optional (only for equivalence simulator)
  "position": <position>
}
```
or
```
{
  "type": "input",
  "channel": <string>, // Optional (only for equivalence simulator)
  "term": <string>, // Optional (only for equivalence simulator)
  "position": <position>
}
```
or
```
{
  "type": "comm",
  "input_position": <position>,
  "output_position": <position>
}
```
or
```
{
  "type": "eavesdrop",
  "channel": <string>,
  "input_position": <position>,
  "output_position": <position>
}
```
or
```
{
  "type": "bang",
  "position": <position>,
  "nb_process_unfolded": <int>
}
```
or
```
{
  "type": "tau",
  "position": <position>
}
```
or
```
{
  "type": "choice",
  "position": <position>,
  "choose_left": <bool>
}
```
