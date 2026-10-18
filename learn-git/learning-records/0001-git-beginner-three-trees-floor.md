# Prior knowledge and starting point established (Git: beginner)

The learner can already `clone`, `add`, `commit`, and `push`, but has no reliable
mental model of Git's internals — "can't reliably predict what any command will do"
was their own description. They explicitly opted into learning the **index**, which
is the right first target: the three-trees model it depends on is the foundation
for branching, stashing, and every identity/undo decision later.

Implications: start at the three states (working tree / index / git directory),
not at raw plumbing. Do **not** re-teach the clone/add/commit/push motions — assume
them and build on top. Lesson 0001 is authored accordingly and is *not yet* evidence
of understanding; this record sets the floor, not a ceiling.
