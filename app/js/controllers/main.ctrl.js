
/**
 * Main Sympozer Angular app controller
 */
angular.module('sympozerApp').controller('mainCtrl', ['$scope', '$rootScope', '$global', '$timeout', 'progressLoader', '$location', 'GLOBAL_CONFIG', function ($scope, $rootScope, $global, $timeout, progressLoader, $location, GLOBAL_CONFIG)
{


    // there are better ways to do this, e.g. using a dedicated service
    // but for the purposes of this demo this will do :P
    $scope.isContextMainEvent = true;
    $scope.setContextMainEventOn = function ()
    {
        $scope.isContextMainEvent = true;
    };
    $scope.setContextMainEventOff = function ()
    {
        $scope.isContextConference = false;
    };


    /**
     * Specify if the right accordeon show only one element at a time of severals
     * @type {boolean}
     */
    $scope.rightbarAccordionsShowOne = false;
    /**
     * Specify wich accordeons have to be open when the page is loaded
     * @type {{open: boolean}[]}
     */
    $scope.rightbarAccordions = [
        {open: true},
        {open: true},
        {open: true},
        {open: true},
        {open: true},
        {open: true},
        {open: true}
    ];

    /**
     * Progress Bar configuration
     */
    $scope.$on('$routeChangeStart', function (e)
    {
        // console.log('start: ', $location.path());
        progressLoader.start();
        progressLoader.set(50);
    });

    $scope.$on('$routeChangeSuccess', function (e)
    {
        // console.log('success: ', $location.path());
        progressLoader.end();
    });

    //Add app configuration to the rootScope
    $rootScope.GLOBAL_CONFIG = GLOBAL_CONFIG;

    //scrollTop function
    $scope.scrollTop = function ()
    {
        $('html, body').animate({scrollTop: 0}, 'slow');
    }
}]);

