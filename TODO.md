# TODO

- [x] (Bug) Catch the case where an addFile event is emitted 2 times.
- [ ] (Feature) Recursive folder watching
- [ ] (Feature) Promise-based interface as an alternative to callbacks.

## Notes

### (Feature) Recursive folder watching

If we find folders in a polled directory, then the user may also want to
watch the files inside of that directory, and even folders inside of that.

The user needs a way to specify that they can recursively watch the folders.

The implications of this change is that the execution cycle may increase
beyond the initial interval of 100ms. We would need to figure out how to handle 
this. 

### (Feature) Promise-based interface as an alternative to callbacks.

Back when I wrote the library Node.js callbacks were the defacto approach to 
writing code, but since then we have had Promises / Async/Await added to 
Node.js, and that is the more common approach to writing code in Node.js these 
days.

It would be nice to add a way to support being able to use Promises with poller
whilst maintaining backwards-compatible support for callbacks.
