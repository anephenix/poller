# TODO

- [x] (Bug) Catch the case where an addFile event is emitted 2 times.
- [x] (Feature) Recursive folder watching
- [ ] (Feature) Promise-based interface as an alternative to callbacks.

## Notes

### (Feature) Promise-based interface as an alternative to callbacks.

Back when I wrote the library Node.js callbacks were the defacto approach to 
writing code, but since then we have had Promises / Async/Await added to 
Node.js, and that is the more common approach to writing code in Node.js these 
days.

It would be nice to add a way to support being able to use Promises with poller
whilst maintaining backwards-compatible support for callbacks.
