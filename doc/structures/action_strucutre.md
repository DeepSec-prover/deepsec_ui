# Action 

Definition of `<action>` :

```
{
  "type": "output",
  "channel_recipe": <recipe>,
  "axiom_index": <int>,
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
  "output_process_position": <position>,
  "axiom_index": <int>
}
```
or
```
{
  "type": "replication",
  "process_position": <position>,
  "nb_process_unfolded": <int>
}
```
