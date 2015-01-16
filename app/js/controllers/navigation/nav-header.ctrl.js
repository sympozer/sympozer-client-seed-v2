/**
 * HeaderBarCtrl
 * Controller component that handles the header nav bar with tiles
 */
angular.module('sympozerApp').controller('navHeaderCtrl', ['$scope', '$rootScope', '$global', function ($scope, $rootScope, $global)
{
  $scope.isShown = false;

  /**
   * Action that show the header bar
   */
  $rootScope.showHeaderBar = function ($event)
  {
    $event.stopPropagation();
    $scope.isShown = !$scope.isShown;
    if($scope.isShown){
      $("#headerbar").hide();
    }else{
      $("#headerbar").show();

    }

  };


}]);