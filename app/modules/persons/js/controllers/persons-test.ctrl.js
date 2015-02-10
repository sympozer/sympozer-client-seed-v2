angular.module('personsApp').controller('personsTestCtrl', [ '$scope', '$rootScope', '$routeParams', 'personsFact', function ($scope, $rootScope, $routeParams, personsFact )
{

    alert("dans perosn ctrl");
    var t = personsFact.test().$promise;



    t.then(function(greeting) {
        alert('Success: ' + greeting.name);
    }, function(reason) {
        alert('Failed: ' + reason);
    });



}]);