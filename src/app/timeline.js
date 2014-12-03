'use strict';

module.exports = function(app) {

	app.controller('TimelineController', [
		'Data',
		'$stateParams',
		'$scope',
		function(Data, $stateParams, $scope) {

			$scope.data = Data.get();

			$scope.item = _.find($scope.data, function(item) { return $stateParams.year == item.year; });

		}
	]);

}