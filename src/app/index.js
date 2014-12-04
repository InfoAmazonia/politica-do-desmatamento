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

app.config(require('./config'))

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
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {

			if(toState.name != fromState.name) {

				if(toState.name !== 'home') {
					if(!fromState.name) {
						$('#masthead').show().addClass('fixed');
						$('.play-video').hide();
					} else if(fromState.name == 'home') {
						$('#masthead').animo({animation: 'fadeOutUp', duration: 0.5, keep: true}, function() {
							$('#masthead').addClass('fixed').animo({animation: 'fadeInDown', duration: 0.5, keep: true});
						});
						$('.play-video').animo({animation: 'fadeOut', duration: 0.5, keep: true}, function() {
							$('.play-video').hide();
						});
					}
				} else {
					if(!fromState.name) {
						$('#masthead').show().removeClass('fixed');
					} else {
						$('#masthead').animo({animation: 'fadeOutUp', duration: 0.5, keep: true}, function() {
							$('#masthead').removeClass('fixed').animo({animation: 'fadeInDown', duration: 0.5, keep: true});
						});
						$('.play-video').show().animo({animation: 'fadeIn', duration: 0.5, keep: true});
					}
				}

				if(toState.name == 'analise') {
					$('#timeline-nav').addClass('analise');
				} else {
					$('#timeline-nav').removeClass('analise');
				}

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
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});