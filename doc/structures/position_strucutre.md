# Position

Definition of `<position>` :

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

-----

Definition of `<position_args>` :

```
{
  "replication_index": <int>,
  "assignation": <int>
}
```

When `assignation` is `0`, it means that it was not assigned yet.
