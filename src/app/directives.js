'use strict';

angular.module('monitor')

.directive('videoContent', [
	'VideoService',
	function(Video) {

		return {
			restrict: 'EA',
			scope: {
				videoIn: '=',
				videoOut: '=',
				lastContent: '='
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
					if(time >= scope.videoOut && scope.lastContent) {
						Video.ready(true);
					}
				});

			}
		}

	}
])

.directive('ytAudio', [
	'$interval',
	function($interval) {
		return {
			restrict: 'E',
			scope: {
				id: '@videoId',
				title: '@',
				content: '@'
			},
			templateUrl: '/views/includes/audio.html',
			link: function(scope, element, attrs) {

				scope.$on('youtube.player.ready', function(ev, player) {
					if(player.id == 'audio-' + scope.id) {
						player.setVolume(0);
						scope.play = function() {
							player.playVideo();
							scope.playing = true;
						}
						scope.pause = function() {
							player.pauseVideo();
							scope.playing = false;
						}
						$(element).find('iframe').hide();
					}
				});

				scope.$on('youtube.player.ended', function(ev, player) {
					if(player.id == 'audio-' + scope.id) {
						scope.playing = false;
					}
				});

			}
		}
	}
])

.directive('gpti', [
	function() {

		return {
			restrict: 'A',
			transclude: true,
			templateUrl: '/views/includes/gpti.html',
			link: link
		};

		function link(scope, element, attrs, _c, transclude) {

			$('#gpti').hide();

			$(element).on('mouseover', function() {
				$('#gpti').show();
				$(element).addClass('hover');
			});

			$(element).on('mouseleave', function() {
				$(element).removeClass('hover');
				setTimeout(function() {
					if(!$(element).hasClass('hover'))
						$('#gpti').hide();
				}, 500);
			});

			element.on('$destroy', function() {
				$('#gpti').remove();
			});

		}
	}
])

.directive('eixosSummary', [
	function() {

		return {
			restrict: 'E',
			templateUrl: '/views/includes/eixos-summary.html',
			link: function(scope, element, attrs) {

				$(element).find('header li').on('mouseenter', function() {

					var eixo = $(this).attr('class');

					// reset
					$(element).find('.eixo-content').removeClass('expand');
					$(element).find('header li h3').removeClass('active');

					$(this).addClass('hover');
					$(this).find('h3').addClass('active');

					$(element).find('.eixos-summary').addClass('hovering');
					var $content = $(this).parents('.eixos-summary').find('.eixos-content li.' + eixo + ' .eixo-content');

					$content.addClass('expand');

				});

				$(element).find('.eixo-content').on('mouseover', function() {
					$(this).addClass('hover');
				});

				$(element).find('.eixo-content').on('mouseleave', function() {
					$(this).removeClass('hover');
				});

				$(element).find('header li, .eixo-content').on('mouseleave', function() {
					$('header li').removeClass('hover');
					setTimeout(function() {
						if(!$(element).find('.expand').is('.hover') && !$('header li').is('.hover')) {
							$(element).find('.eixos-summary').removeClass('hovering');
							$(element).find('.eixo-content').removeClass('expand');
							$(element).find('header li h3').removeClass('active');
						}
					}, 1000);
				});

			}
		}

	}
]);
