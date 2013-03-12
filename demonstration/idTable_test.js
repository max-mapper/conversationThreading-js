var mail = require('../jwz.js');

var thread = mail.messageThread();

var root = thread.thread([
  mail.message("subject", "a", ""),
  mail.message("subject", "b", "a"),
  mail.message("subject", "d", ["a", "b", "c"]),
  mail.message("subject", "e", ["z", "y", "d"])
]);

console.log(thread.idTable);

var root2 = thread.thread([
  mail.message("subject2", "a", ""),
  mail.message("subject2", "b", "a"),
  mail.message("subject2", "d", ["a", "b", "c"]),
  mail.message("subject2", "e", ["z", "y", "d"])
]);

console.log(thread.idTable);

