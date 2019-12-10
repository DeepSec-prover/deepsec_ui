# Term

Definition of `<term>` :

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
    <term>,
    ...,
    <term>
  ] // optional
}
```
or
```
{
  "type": "Attacker",
  "label": <string>
}
```
