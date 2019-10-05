# Action 

Definition of `<action>` :

```
{
  "type": "output",
  "channel": <recipe>
  "position": <position>
}
```
or
```
{
  "type": "input",
  "channel": <recipe>,
  "term": <recipe>,
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
  "channel": <recipe>,
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
