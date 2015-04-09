var ngAnnotate = require("ng-annotate");

var src = '/* abc */ angular.module("MyMod").controller("MyCtrl", function($scope, $timeout) { /* def */ });';

var res = ngAnnotate(src, {
  add: true
});
console.log(res.src);