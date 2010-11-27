// History -- adds objects that can store things and you can retrieve stuff
//            from them, blocking as needed until the objects are available.

function History(emptyCbTimeout) {
  this.emptyCbTimeout = emptyCbTimeout;
  this.futures = {}; // maps time => [{timer: timeout timer,
  //                                   cb: function(list_of_evesns){}}
  //                                 ]
  // if the callback times out, cb will be given an empty list.
  this.history = [];
}

History.prototype.time = function() {
  return this.history.length;
};

History.prototype.add = function(obj) {
  var now = this.time();
  if (now in this.futures) {
    // If people are waiting for us, then give them stuff.
    this.futures[now].forEach(function(cb) {
      clearTimeout(cb.timer);
      cb.cb([obj]);
    });
    delete this.futures[now];
  }
  this.history.push(obj);
};

History.prototype.after = function(time, cb) {
  // Run the callback with all the actions that happened after the given time.
  // Block to wait for them if necessary.

  if (time < this.time()) {
    // Aha! We can already fufill their request.
    cb(this.history.slice(time));
  } else {
    // UH OH we don't have anything yet. Best post it on our pegboard for
    // later then.
    var cbData = {
        cb: cb,
        timer: setTimeout(function(){ cb([]); }, this.emptyCbTimeout)
      };
    if (time in this.futures) {
      this.futures[time].push(cbData);
    } else {
      this.futures[time] = [cbData];
    }
  }
};

exports.History = History;
