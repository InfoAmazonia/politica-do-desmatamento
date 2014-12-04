'use strict';

module.exports = [
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	'$httpProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
		$locationProvider.hashPrefix('!');

		$stateProvider
			.state('home', {
				url: '/'
			})
			.state('timeline', {
				url: '/timeline/:year/',
				controller: 'TimelineController',
				templateUrl: '/views/pages/timeline.html'
			})
			.state('analise', {
				url: '/analise/',
				templateUrl: '/views/pages/analise.html'
			})
			.state('analise.metodologia', {
				url: 'metodologia/',
				templateUrl: '/views/pages/metodologia.html'
			})
			.state('analise.timeline', {
				url: ':year/',
				controller: 'TimelineController',
				templateUrl: '/views/pages/timeline.html'
			});

		/*
		 * Trailing slash rule
		 */
		$urlRouterProvider.rule(function($injector, $location) {
			var path = $location.path(),
				search = $location.search(),
				params;

			// check to see if the path already ends in '/'
			if (path[path.length - 1] === '/') {
				return;
			}

			// If there was no search string / query params, return with a `/`
			if (Object.keys(search).length === 0) {
				return path + '/';
			}

			// Otherwise build the search string and return a `/?` prefix
			params = [];
			angular.forEach(search, function(v, k){
				params.push(k + '=' + v);
			});
			
			return path + '/?' + params.join('&');
		});

	}
];