TODO
===

Bug - Catch the case where an addFile event is emitted 2 times.
---

The likely cause of this bug is that before the 1st timeout execution cycle
has completed, the 2nd execution cycle is beginning to execute. 

The files found in the 1st execution cycle have not yet been defined 
as the set list of files by the time that the 2nd execution cycle has
found those files again.

Bearing this in mind, we need to find a way to defer the execution of the 2nd
cycle, until the 1st execution cycle has completed. 

Another possible action would be to find a way to make the function execute
ftasre, possibly by using lodash in place of underscore.

Feature - Recursive folder watching
---

If we find folders in a polled directory, then the user may also want to
watch the files inside of that directory, and even folders inside of that.

The user needs a way to specify that they can recursively watch the folders.

The implications of this change is that the execution cycle may increase
beyond the initial time limit of 100ms.


