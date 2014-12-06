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
		var time = -1;

		return {
			getTime: function() {
				return time;
			},
			setTime: function(val) {
				time = val;
				return time;
			}
		}
	}
])

.directive('videoContent', [
	'VideoService',
	function(Video) {

		return {
			restrict: 'EA',
			scope: {
				videoIn: '=',
				videoOut: '='
			},
			link: function(scope, element, attrs) {

				scope.showContent = false;

				scope.$watch(function() {
					return Video.getTime();
				}, function(time) {
					if(time >= scope.videoIn && time <= scope.videoOut) {
						element.addClass('active');
					} else {
						element.removeClass('active');
					}
					console.log(time);
				});

			}
		}

	}
])

.controller('SiteController', [
	'Data',
	'VideoService',
	'$interval',
	'$state',
	'$scope',
	'$rootScope',
	function(Data, Video, $interval, $state, $scope, $rootScope) {

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

		$scope.currentTime = -1;

		var setVideo = function(id, cb, initLoop) {

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
					$scope.currentTime = player.getCurrentTime();
					Video.setTime($scope.currentTime);
					if(player.getPlayerState() == 1 && $scope.currentTime >= (player.getDuration() - 1)) {
						var ended = true;
						if(cb == true) {
							player.seekTo(0);
						} else {
							if(initLoop) {
								player.seekTo(initLoop).playVideo();
							} else {
								clearInterval(videoLoop);
							}
							if(typeof cb !== 'function')
								player.pauseVideo();
						}
					}
					if(typeof cb == 'function')
						cb(ended, player);
				}, 500);
			}

			if(!$scope.player) {
				$scope.$on('youtube.player.ready', function(event, player) {
					$(window).resize();
					$scope.player = player;
					set(player);
				});
			} else {
				set($scope.player);
			}

		}

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
			if(toParams.year) {
				var item = _.find($scope.data, function(item) { return toParams.year == item.slug; });
				$scope.showNext = false;
				$scope.next = $scope.data[$scope.data.indexOf(item)+1] || false;
				$scope.nextUrl = '/timeline/' + $scope.next.slug + '/';
				$scope.nextTitle = $scope.next.title;
				if(item.slug == 2005) {
					$scope.nextUrl = '/analise/';
					$scope.nextTitle = 'Análise';
				} else if(toState.name.indexOf('analise') !== -1 && item.slug !== '2012-2014') {
					$scope.nextUrl = '/analise/' + $scope.next.slug + '/';
				}
				setVideo(item.videoSettings.videoId, function(ended, player) {
					if($scope.currentTime >= item.videoSettings.introTime && $scope.next) {
						$scope.showNext = true;
					}
				}, item.videoSettings.introTime);
			} else {
				setVideo('bkhRoHQEzkA', true);
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

			$state.go('timeline', { year: Data.get()[0].slug });

		};

	}
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});