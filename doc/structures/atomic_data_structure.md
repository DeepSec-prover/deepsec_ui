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
