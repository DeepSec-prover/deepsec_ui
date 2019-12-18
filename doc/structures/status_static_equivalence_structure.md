# Static equivalence

Witness of non static equivalence : `<status_static_equivalence>`:

```
{
  "status": "equivalent"
}
```
or
```
{
  "status": "non_equivalent_message",
  "recipe": <recipe>,
  "term": <term>,
  "process_id": <int>
}
```
or
```
{
  "status": "non_equivalent_equality",
  "recipe1": <recipe>,
  "recipe2": <recipe>,
  "term_equal": <term>,
  "term1": <term>,
  "term2": <term>,
  "process_id": <int>
}
```
The status of static equivalence indicates whether the corresponding traces are statically equivalent or not. When they are not equivalent, we have two types of witness.
- Either a recipe can compute a message on one trace but not the other: Correspond to the status `non_equivalent_message`. The faulty recipe is the one on label `recipe`. On the frame of process with id = `process_id`, the `recipe` computes the message `term`. On the other process, the same recipe cannot compute a message.
- or there are two recipes `recipe1` and `recipe2` that computes to the same term `term_equal` on one trance but not on the other. On the frame of process with id = `process_id`, the recipes `recipe1` and `recipe2` both computes the same message `term_equal`. On the other frame, the recipes `recipe1` and `recipe2` respectively computes the terms `term1` and `term2`. Note that `term1` and `term2` are necessarily different.
