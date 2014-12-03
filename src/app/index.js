'use strict';

var timelineData = require('./data');

/*
 * App
 */

var app = angular.module('monitor', [
	'ngAnimate',
	'ui.router',
	'youtube-embed'
]);

require('./timeline')(app);

app.config([
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
				url: '/',
				controller: 'HomeController'
			})
			.state('timeline', {
				url: '/timeline/:year/',
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
])

.factory('Data', [
	function() {

		var data = timelineData;

		return {
			get: function() {
				return data;
			}
		};

	}
])

.controller('SiteController', [
	'Data',
	'$state',
	'$scope',
	'$rootScope',
	function(Data, $state, $scope, $rootScope) {

		$scope.data = Data.get();

		/*
		 * VIDEO
		 */

		$scope.videoId = '2qOpPo-onf0';
		$scope.videoVars = {
			controls: 0,
			autoplay: 0,
			disablekb: 1,
			fs: 0,
			showinfo: 0
		};



		/*
		 * Set video loop from timeline data
		 */
		var videoLoop = false;

		var setLoop = function(start, end) {

			var set = function(player) {
				player.seekTo(start).playVideo();

				if(videoLoop)
					clearInterval(videoLoop);

				videoLoop = setInterval(function() {
					if(player.getCurrentTime() > end) {
						player.seekTo(start);
					}
				}, 500);
			}

			if(!$scope.player) {
				$scope.$on('youtube.player.ready', function(event, player) {
					player.mute();
					$scope.player = player;
					set(player);
				});
			} else {
				set($scope.player);
			}

		}

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
			// Initial video display
			if(toState.name == 'home') {
				setLoop(57, 70);
			} else if(toState.name == 'timeline') {
				var item = _.find($scope.data, function(item) { return toParams.year == item.year; });
				setLoop(item.videoSettings.start, item.videoSettings.end);
			}
		});

		/*
		 * Index items animations
		 */
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {

			if(toState.name !== 'home') {
				if(fromState.name == 'home') {
					$('#masthead').animo({animation: 'fadeOutUp', duration: 0.5, keep: true});
					$('.play-video').animo({animation: 'fadeOut', duration: 0.5, keep: true}, function() {
						$('.play-video').hide();
					});
				}
			} else {
				$('#masthead').animo({animation: 'fadeInDown', duration: 0.5, keep: true});
				$('.play-video').show().animo({animation: 'fadeIn', duration: 0.5, keep: true});
			}

		});

		/***/

		$scope.init = function() {

			$state.go('timeline', { year: Data.get()[0].year });

			// $('#masthead').animo({animation: 'fadeOutUp', duration: 0.5, keep: true}, function() {
			// 	$('#masthead').animo({animation: 'fadeInDown', duration: 0.5, keep: true});
			// });

		};

	}
])

.controller('HomeController', [
	'Data',
	'$state',
	'$rootScope',
	'$scope',
	function(Data, $state, $rootScope, $scope) {


	}
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});