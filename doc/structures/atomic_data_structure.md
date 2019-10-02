# Atomic Data

It defines all atomic data which will be used in one or many specific process.

Definition of `<atomic_data>` :

```
[
  <variable> | <name> | <symbol>
]
```

-----

Definition of `<variable>` :

```
{
  "type": "Variable",
  "label" : <string>,
  "index": <int>,
  "free" : <bool>
}
```

-----

Definition of `<name>` :

```
{
  "type": "Name",
  "label": <string>,
  "index": <int>
}
```

-----

Definition of `<rewrite_rules>` :

```
{
  "lhs": [<term>,...,<term>]
  "rhs": <term>
}
```

-----

Definition of `<category>` :

```
{
  "type": "Tuple"
}
```
or
```
{
  "type": "Constructor"
}
```
or
```
{
  "type": "Destructor",
  "rewrite_rules": [
    <rewrite_rules>,
    ...,
    <rewrite_rules>
  ]
}
```
or
```
{
  "type": "Projection",
  "tuple": <int>,
  "projection_nb": <int>,
  "rewrite_rules": [
    <rewrite_rules>,
    ...,
    <rewrite_rules>
  ]
}
```

-----

Definition of `<symbol>` :

```
{
  "type": "Symbol",
  "label": <string>,
  "index": <int>,
  "arity": <int>,
  "category": <category>,
  "is_public: <bool>,
  "representation": "UserName" | "UserDefined" | "Attacker"
}
```
