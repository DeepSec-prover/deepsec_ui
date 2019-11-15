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
  "process": <process>, (optional) // When not defined the process is Nil
}
```
or
```
{
  "type": "Input",
  "channel": <term>,
  "pattern": <pattern>,
  "position": <position>,
  "process": <process>, (optional) // When not defined the process is Nil
}
```
or
```
{
  "type": "IfThenElse",
  "term1": <term>,
  "term2": <term>,
  "position": <position>,
  "process_then": <process>, (optional) // When not defined the process is Nil
  "process_else": <process>, (optional) // When not defined the process is Nil
}
```
or
```
{
  "type": "LetInElse",
  "pattern": <pattern>,
  "term": <term>,
  "position": <position>,
  "process_then": <process>, (optional) // When not defined the process is Nil
  "process_else": <process>, (optional) // When not defined the else branch is Nil
}
```
or
```
{
  "type": "New",
  "name": <int>,
  "position": <position>,
  "process": <process>, (optional) // When not defined the process is Nil
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
  "type": "Bang",
  "multiplicity": <int>,
  "position": <position>,
  "process": <process>, (optional) // When not defined the process is Nil
}
```
or
```
{
  "type": "Choice",
  "position": <position>,
  "process1" : <process>, (optional) // When not defined the process is Nil
  "process2" : <process>, (optional) // When not defined the process is Nil
}
```
