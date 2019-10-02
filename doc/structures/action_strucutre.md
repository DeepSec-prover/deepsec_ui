# Action 

Definition of `<action>` :

```
{
  "type": "output",
  "channel_recipe": <recipe>
  "process_position": <position>
}
```
or
```
{
  "type": "input",
  "channel_recipe": <recipe>,
  "term_recipe": <recipe>,
  "process_position": <position>
}
```
or
```
{
  "type": "comm",
  "input_process_position": <position>,
  "output_process_position": <position>
}
```
or
```
{
  "type": "eavesdrop",
  "channel_recipe": <recipe>,
  "input_process_position": <position>,
  "output_process_position": <position>
}
```
or
```
{
  "type": "bang",
  "process_position": <position>,
  "nb_process_unfolded": <int>
}
```
or
```
{
  "type": "tau",
  "process_position": <position>
}
```
or
```
{
  "type": "choice",
  "process_position": <position>,
  "choose_left": <bool>
}
```
