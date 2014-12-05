'use strict';

require('./ui');

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

.factory('VideoService', [
	function() {

		var init = function(video) {



		}

	}
])

.controller('SiteController', [
	'Data',
	'$interval',
	'$state',
	'$scope',
	'$rootScope',
	function(Data, $interval, $state, $scope, $rootScope) {

		$scope.data = Data.get();

		/*
		 * VIDEO
		 */

		$scope.videoId = 'bkhRoHQEzkA';
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
		$scope.$on('youtube.player.ready', function(event, player) {
			$scope.player = player;
		});

		var setVideo = function(id, cb) {

			var set = function(player) {
				player.loadVideoById(id).playVideo();
				player.unMute();
				player.setVolume(100);

				if(videoLoop) {
					$interval.cancel(videoLoop);
					videoLoop = false;
				}

				videoLoop = $interval(function() {
					var ended = false;
					if(player.getPlayerState() == 1 && player.getCurrentTime() >= (player.getDuration() - 1)) {
						var ended = true;
						if(cb == true) {
							player.seekTo(0);
						} else {
							if(typeof cb !== 'function')
								player.pauseVideo();
							clearInterval(videoLoop);
						}
					}
					if(typeof cb == 'function')
						cb(ended, player);
				}, 500);
			}

			if(!$scope.player) {
				$scope.$on('youtube.player.ready', function(event, player) {
					$scope.player = player;
					set(player);
				});
			} else {
				set($scope.player);
			}

		}

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
			$scope.showInfo = false;
			if(toState.name == 'home') {
				setVideo('bkhRoHQEzkA', true);
			} else if(toParams.year) {
				var item = _.find($scope.data, function(item) { return toParams.year == item.year; });
				var next = $scope.data[$scope.data.indexOf(item)+1] || false;
				if(item.videoSettings.introId) {
					setVideo(item.videoSettings.introId, function(ended, player) {
						if(ended) {
							$scope.showInfo = true;
							setVideo(item.videoSettings.videoId, function(ended, player) {
								if(ended && next)
									$state.go('timeline', {year: next.year});
							});
						} else {
							//console.log(player.getCurrentTime());
						}
					});
				} else {
					$scope.showInfo = true;
					setVideo(item.videoSettings.videoId, function(ended) {
						if(ended && next)
							$state.go('timeline', {year: next.year});
					});					
				}
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

				if(toState.name.indexOf('analise') !== -1) {
					$('#timeline-nav').addClass('analise');
					$('html,body').animate({
						scrollTop: $(window).height() - 130
					}, 1000);
				} else {
					$('#timeline-nav').removeClass('analise');
					if(fromState.name.indexOf('analise') !== -1) {
						$('html,body').animate({
							scrollTop: 0
						}, 500);
					}
				}

			}

			});

		/***/

		$scope.init = function() {

			$state.go('timeline', { year: Data.get()[0].year });

		};

	}
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});