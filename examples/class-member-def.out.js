module.exports = function(def, assert) {

  function Dog(name) {
    this.name = name;
  }

  Dog.prototype.say = def(function(self) {
    /**
     * @rules (string words) -> string
     */
    return this.name + ' said ' + self.words;
  }, {"rules":[["string",[["words","string"]],[[0]]]],"arguments":["self"]});



  var dog = new Dog('David');

  assert.equal(dog.say('Hello!'), 'David said Hello!');
  assert.equal(dog.say('汪汪!'), 'David said 汪汪!');

};