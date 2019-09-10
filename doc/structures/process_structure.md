# Process

Definition of `<process>` :

```
{ "type": null }
```
or
```
{
  "type": "Output",
  "channel": <term>,
  "term": <term>,
  "position": <position>,
  "process": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "Input",
  "channel": <term>,
  "pattern": <pattern>,
  "position": <position>,
  "process": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "IfThenElse",
  "term1": <term>,
  "term2": <term>,
  "position": <position>,
  "process_then": <process>,
  "process_else": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "LetInElse",
  "pattern": <pattern>,
  "term": <term>,
  "position": <position>,
  "process_then": <process>,
  "process_else": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "New",
  "name": <int>,
  "position": <position>,
  "process": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "Par",
  "process_list": [
    <process>,
    ...,
    <process>
  ]
}
```
or
```
{
  "type": "Mult",
  "multiplicity": <int>,
  "position": <position>,
  "process": <process>,
  "highlight": <bool> (optional)
}
```
or
```
{
  "type": "Choice",
  "position": <position>,
  "process1" : <process>,
  "process2" : <process>,
  "highlight": <bool> (optional)
}
```
