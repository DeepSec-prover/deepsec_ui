# Process structure

## Atomic types

Main table:

Define all atomic data which will be used in the process.

```
"atomic_data" : [
  <variable> | <name> | <symbol>
]
```

-----

Definition of `<variable>` :

```
{
  "type": "Variable",
  "label" : <string>,
  "index": <int>
}
```

-----

Definition of `<name>` :

```
{
  "type": "Name",
  "label": <string>,
  "index": <int>,
  "is_public": <bool>
}
```

-----

Definition of `<symbol>` :

```
{
  "type": "Symbol",
  "label": <string>,
  "arity": <int>,
  "category": "Tuple" | "Constructor" | "Destructor",
  "is_public: <bool>
}
```

## Term

Definition of `<term>` :

```
{
  "type": "Atomic";
  "id": <int>
}
```
or
```
{
  "type": "Function",
  "symbol": <int>,
  "args": [
    <term>,
    ...,
    <term>
  ]
}
```

## Pattern

Definition of `<pattern>` :

```
{
  "type": "Atomic";
  "id": <int>
}
```
or
```
{
  "type": "Function",
  "symbol": <int>,
  "args": [
    <pattern>,
    ...,
    <pattern>
  ]
}
```
or
```
{
  "type": "Equality",
  "term": <term>
}
```

A pattern `pat` with `pat.type = "Equality"` should be displayed
as `=t` where `t` is the display of `pat.term`

## Position

Definition of `<position_args>`

```
{
  "replication_index": <int>,
  "assignation": <int>
}
```

When `assignation` is `0`, it means that it was not assigned yet.

-----

Definition of `<position>`

```
{
  "index": <int>,
  "args" : [
    <position_args>,
    ...,
    <position_args>
  ]
}
```



## Process

Definition of `<process>`

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
  "process": <process>
}
```
or
```
{
  "type": "Input",
  "channel": <term>,
  "pattern": <pattern>,
  "position": <position>,
  "process": <process>
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
  "process_else": <process>
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
  "process_else": <process>
}
```
or
```
{
  "type": "New",
  "name": <int>,
  "position": <position>,
  "process": <process>
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
  "process": <process>
}
```
or
```
{
  "type": "Choice",
  "position": <position>,
  "process1" : <process>,
  "process2" : <process>
}
```
