/**
 * @TODO : define tests
 */
describe('Test papersCommunityListCtrl - ', function() {

    //papersApp app has to be loaded first
    beforeEach(module('sympozerApp', 'papersApp'));

    var ctrl, scope;

    //Loading of the  papersCommunityListCtrl
    beforeEach(inject(function($controller, $rootScope) {
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        // Create the controller
        ctrl = $controller('papersCommunityListCtrl', {
            $scope: scope
        });
    }));

    //Verify that scope values are well formed
    it('should load scope values', function() {
    });

});


