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

require('./directives');

app.config(require('./config'))

.run([
	'$rootScope',
	'$location',
	'$window',
	function($rootScope, $location, $window) {
		/*
		 * Analytics
		 */
		$rootScope.$on('$stateChangeSuccess', function() {
			if($window._gaq) {
				$window._gaq.push(['_trackPageview', $location.path()]);
			}
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

.factory('VideoService', [
	function() {

		var time = -1;
		var readyForNext = false;

		return {
			getTime: function() {
				return time;
			},
			setTime: function(val) {
				time = val;
				return time;
			},
			ready: function(val) {
				if(typeof val !== 'undefined')
					readyForNext = val;
				return readyForNext;
			}
		}
	}
])

.controller('SiteController', [
	'Data',
	'VideoService',
	'$interval',
	'$location',
	'$state',
	'$scope',
	'$rootScope',
	function(Data, Video, $interval, $location, $state, $scope, $rootScope) {

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
			showinfo: 0,
			wmode: 'transparent'
		};

		/*
		 * Set video loop from timeline data
		 */
		var videoLoop = false;
		$scope.$on('youtube.player.ready', function(event, player) {
			if(player.id == 'video')
				$scope.player = player;
		});

		$scope.currentTime = -1;

		$scope.$watch(function() {
			return Video.ready();
		}, function(ready) {
			$scope.readyForNext = ready;
		});

		$scope.introTime = function() {
			if($scope.currentContent) {
				return $scope.currentContent.contents[0].in;
			} else {
				return 0;
			}
		};

		$scope.jumpIntro = function() {
			if($scope.player && $scope.currentContent) {
				if($scope.player.getCurrentTime() < $scope.currentContent.contents[0].in -.5) {
					$scope.player.seekTo($scope.currentContent.contents[0].in -.5);
				}
			}
		};

		$scope.mute = true;

		$scope.playVideo = function() {
			if($scope.player) {
				$scope.paused = false;
				$scope.player.playVideo();
			}
		};

		$scope.pauseVideo = function() {
			if($scope.player) {
				$scope.paused = true;
				$scope.player.pauseVideo();
			}
		};

		$scope.clickOffset = function(ev) {
			var width = $(ev.target).width();
			var x = ev.pageX - $(ev.target).offset().left;
			console.log((x/width)*100);
			return (x/width)*100;
		};

		$scope.setVideoTimeByPercentage = function(percentage) {
			if($scope.player) {
				var time = $scope.player.getDuration() * (percentage/100);
				$scope.setVideoTime(time);
			}
		};

		$scope.setVideoTime = function(time) {
			console.log('trying: ' + time);
			if($scope.player) {
				$scope.player.seekTo(time);
			}
		};

		$scope.videoPercentage = function() {
			if($scope.currentTime && $scope.player) {
				return ($scope.currentTime / $scope.player.getDuration()) * 100;
			} else {
				return 0;
			}
		};

		$scope.videoTimeBarStyle = function() {
			var percentage = $scope.videoPercentage();
			if(percentage >= 100)
				percentage = 100;

			return {
				width: percentage + '%'
			};
		};

		$scope.videoTimeBarTextStyle = function() {
			if($scope.player && $scope.currentContent) {
				var percentage = ($scope.currentContent.contents[0].in / $scope.player.getDuration()) * 100;
				return {
					display: 'block',
					left: percentage + '%'
				};
			} else {
				return {
					display: 'none'
				};
			}
		};

		$scope.skipBack = function() {

			if($scope.player) {
				if($scope.mute) {
					if($scope.currentContent.contents[0].in + 3 >= $scope.player.getCurrentTime()) {
						$scope.player.seekTo($scope.currentContent.contents[0].in);
					} else if($scope.prev) {
						$location.url($scope.prevUrl);
					}
				} else {
					if($scope.player.getCurrentTime() >= 3) {
						$scope.player.seekTo(0);
					} else if($scope.prev) {
						$location.url($scope.prevUrl);
					}
				}
			}

		};

		$scope.skipForward = function() {
			if($scope.player && $scope.next) {
				$location.url($scope.nextUrl);
			}
		};

		$scope.toggleMute = function() {
			if(!$scope.mute) {
				$scope.mute = true;
				if($scope.player) {
					$scope.player.setVolume(0);
					$scope.jumpIntro();
				}
			} else {
				$scope.mute = false;
				if($scope.player) {
					$scope.player.setVolume(100);
				}
			}
		}

		var setVideo = function(id, cb, initLoop) {

			$scope.paused = false;

			$scope.showInfo = false;

			$scope.initLoop = initLoop || 0;

			var set = function(player) {
				Video.setTime(0);
				Video.ready(false);
				player.loadVideoById(id).playVideo();
				player.unMute();

				$(window).resize();

				if($scope.mute) {
					if($scope.currentContent)
						player.seekTo($scope.currentContent.contents[0].in -.5);
					player.setVolume(0);
				} else {
					player.setVolume(100);
				}

				if(videoLoop) {
					$interval.cancel(videoLoop);
					videoLoop = false;
				}

				$scope.loopAmount = 0;

				videoLoop = $interval(function() {
					var ended = false;
					$scope.currentTime = player.getCurrentTime() + ($scope.loopAmount * (player.getDuration() - $scope.initLoop));
					Video.setTime($scope.currentTime);
					if(player.getPlayerState() == 1) {
						$scope.showInfo = true;
						if(player.getCurrentTime() >= (player.getDuration() - 1.5)) {
							$scope.loopAmount++;
							var ended = true;
							if(cb == true) {
								player.seekTo(0).playVideo();
							} else {
								if($scope.initLoop) {
									player.seekTo($scope.initLoop).playVideo();
								} else {
									clearInterval(videoLoop);
								}
								if(typeof cb !== 'function')
									player.pauseVideo();
							}
						}
					}
					if(typeof cb == 'function')
						cb(ended, player);
				}, 500);
			}

			if(!$scope.player) {
				$scope.$on('youtube.player.ready', function(event, player) {
					if(player.id == 'video') {
						$scope.player = player;
						set(player);
					}
				});
			} else {
				set($scope.player);
			}

		}

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
			$scope.currentContent = false;

			if(toState.name !== 'home'){
				$scope.initialized = true;
				$scope.isHome = false;
			}

			if(toState.name == 'home') {
				setVideo('bkhRoHQEzkA', true);
				$scope.isHome = true;
			} else if(toParams.year) {
				var item = _.find($scope.data, function(item) { return toParams.year == item.slug; });
				$scope.currentContent = item;
				$scope.prev = $scope.data[$scope.data.indexOf(item)-1] || false;
				$scope.prevUrl = $state.href('timeline', {year: $scope.prev.slug });
				$scope.showNext = false;
				$scope.next = $scope.data[$scope.data.indexOf(item)+1] || false;
				$scope.nextUrl = $state.href('timeline', {year: $scope.next.slug });
				$scope.nextTitle = $scope.next.title;
				if(item.slug == 2005) {
					$scope.nextUrl = $state.href('analise');
					$scope.nextTitle = 'Análise';
				} else if(toState.name.indexOf('analise') !== -1 && item.slug !== '2012-2015') {
					$scope.nextUrl = $state.href('analise', {year: $scope.next.slug });
				} else if(item.slug == 2020) {
					$scope.nextUrl = $state.href('equipe');
					$scope.nextTitle = 'Equipe';
				}
				setVideo(item.videoSettings.videoId, function(ended, player) {
					if($scope.currentTime >= item.videoSettings.introTime && $scope.next) {
						$scope.showNext = true;
					}
				}, item.videoSettings.introTime);
			} else {
				setVideo('bkhRoHQEzkA', function(ended, player) {
					player.stopVideo();
				});
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

				if(toState.name == 'equipe') {
					$('#timeline-nav').animo({animation: 'fadeOutDown', duration: 0.5, keep: true}, function() {
						$('#timeline-nav').hide();
					});
				}

				if(fromState.name == 'equipe') {
					$('#timeline-nav').show().animo({animation: 'fadeInUp', duration: 0.5, keep: true});
				}

			}

			});

		/***/

		$scope.init = function() {

			$scope.initialized = true;
			$state.go('timeline', { year: Data.get()[0].slug });

		};

	}
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});