(function() {
  var Person;

  Person = (function() {
    function Person(options) {
      this.name = options.name, this.age = options.age, this.height = options.height;
    }

    return Person;

  })();

}).call(this);
