# Pattern

Definition of `<pattern>` :

```
{
  "type": "Atomic",
  "id": <int>,
  "bang": [ <int>,...,<int> ] // optional
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
  ] // optional
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
