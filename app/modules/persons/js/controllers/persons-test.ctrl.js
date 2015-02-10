angular.module('personsApp').controller('personsTestCtrl', [ '$scope', '$rootScope', '$routeParams', 'personsFact', function ($scope, $rootScope, $routeParams, personsFact )
{

    var me = iri('http://champin.net/#pa');
    var ns = namespace('http://ex.co/vocab#');
    alert("test");
    var bc = getCore(me);

    bc.getState().then(function(g) {
        return nt(g, console.log);
    }).then(function() {
        return bc.edit(function(g) {
            return g.addTriple(me, ns('type'), ns('Person'))
                .then(function() {
                    bc.edit(function(g2) {
                        return g2.addTriple(me, ns('label'), "Pierre-Antoine Champin");
                    });
                });
        });
    }).then(function(g) {
        alert('----\n');
        return nt(g, console.log);
    }).then(function() {
        alert('---- \n');
        return bc.getState();
    }).then(function(g) {
        return nt(g, console.log);
    }).done();



}]);