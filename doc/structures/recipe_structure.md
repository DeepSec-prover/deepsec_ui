# Recipe

Definition of `<recipe>` :

```
{
  "type": "Axiom";
  "id": <int>   // display as ax_{id}
}
```
or
```
{
  "type": "Function",
  "symbol": <int>,
  "args": [
    <recipe>,
    ...,
    <recipe>
  ]
}
```
or
```
{
  "type": "Attacker",
  "label": <string>
}
```
