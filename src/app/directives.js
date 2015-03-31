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
						Video.readyForNext(true);
					}
				});

			}
		}

	}
])

.directive('copyCode', [
	function() {
		return {
			resitrct: 'E',
			replace: true,
			scope: {
				'code': '@'
			},
			template: '<textarea class="code">{{code}}</textarea>',
			link: function(scope, element, attrs) {
				$(element)
					.focus(function () { $(this).select(); } )
					.mouseup(function (e) {e.preventDefault(); });
			}
		}
	}
])

.directive('ytAudio', [
	'$interval',
	function($interval) {
		return {
			restrict: 'A',
			scope: {
				id: '@videoId',
				title: '@',
				content: '@',
				left: '@ytAudioLeft',
				block: '@'
			},
			transclude: true,
			templateUrl: '/views/includes/audio.html',
			link: function(scope, element, attrs) {
				var audioContainer = $(element).find('.yt-audio-container');

				var sizing = function() {
					var position = $(element).find('.yt-audio').position();
					audioContainer.css({
						top: position.top
					});

					if(scope.left) {
						audioContainer.css({
							left: 0
						});
					} else {
						audioContainer.css({
							right: 0
						});
					}
				}

				if(!scope.block) {
					sizing();
					$(window).resize(sizing);
					$(window).load(sizing);
				}

				if(scope.block)
					$(element).find('.yt-audio').addClass('yt-audio-block');

				if(scope.left) 
					$(element).find('.yt-audio').addClass('yt-audio-left');

				scope.$on('youtube.player.ready', function(ev, player) {
					if(player.id == 'audio-' + scope.id) {
						player.setVolume(100);
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

.factory('CartoDBService', [
	function() {

		var count = 0;

		return {
			count: function(add) {
				if(add == true) {
					count++;
				}
				return count;
			},
			getTiles: function(config, cb) {
				cartodb.Tiles.getTiles({
					user_name: config.user,
					sublayers: [
						{
							sql: config.sql,
							cartocss: config.cartocss,
							interactivity: config.interactivity
						}
					],
				}, function(tiles, err) {
					cb(tiles, err);
				});
			},
			getBounds: function(config, cb) {
				var sql = new cartodb.SQL({ user: config.user });
				sql.getBounds(config.sql).done(function(bounds) {
					cb(bounds);
				});
			},
			getTilejson: function(tiles, template) {
				// TODO TILEJSON
				return {
					"scheme": "xyz",
					"tilejson": "2.0.0",
					"grids": [
						tiles.grids[0][0].replace('{s}', 'a'),
						tiles.grids[0][0].replace('{s}', 'b'),
						tiles.grids[0][0].replace('{s}', 'c')
					],
					"tiles": [
						tiles.tiles[0].replace('{s}', 'a'),
						tiles.tiles[0].replace('{s}', 'b'),
						tiles.tiles[0].replace('{s}', 'c')
					],
					"template": template
				};
			}
		}

	}
])

.directive('cartodb', [
	'$q',
	'CartoDBService',
	function($q, cdb) {
		return {
			restrict: 'E',
			template: '<div id="map-test" class="interactive-map"></div>',
			scope: {

				mapId: '@',

				user: '=',
				sql: '=',
				interactivity: '=',
				cartocss: '=',
				baseLayer: '=',
				template: '=',

				layers: '=',
				boundsIndex: '='
			},
			link: function(scope, element, attrs) {

				cdb.count(true);

				var map = L.map('map-test', {center: [0,0], zoom: 2, scrollWheelZoom: false});

				L.tileLayer(scope.baseLayer).addTo(map);

				var legendControl = L.mapbox.legendControl();

				map.addControl(legendControl);

				if(scope.layers) {

					_.each(scope.layers, function(layer) {

						if(layer.legend) {
							legendControl.addLegend(layer.legend);
						}

						cdb.getTiles(layer, function(tiles) {

							var tilejson = cdb.getTilejson(tiles, layer.template);

							var tileLayer = L.mapbox.tileLayer(tilejson);
							var gridLayer = L.mapbox.gridLayer(tilejson);

							map.addLayer(tileLayer);
							map.addLayer(gridLayer);

							map.addControl(L.mapbox.gridControl(gridLayer));

						});

					});

					if(scope.boundsIndex) {

						cdb.getBounds({
							user: scope.layers[scope.boundsIndex].user,
							sql: scope.layers[scope.boundsIndex].sql
						}, function(bounds) {
							map.fitBounds(bounds);
						});

					}

				} else {
					cdb.getTiles({
						user: scope.user,
						sql: scope.sql,
						cartocss: scope.cartocss,
						interactivity: scope.interactivity
					}, function(tiles) {

						var tilejson = cdb.getTilejson(tiles, scope.template);

						var tileLayer = L.mapbox.tileLayer(tilejson);
						var gridLayer = L.mapbox.gridLayer(tilejson);

						map.addLayer(tileLayer);
						map.addLayer(gridLayer);

						map.addControl(L.mapbox.gridControl(gridLayer));

					});

					cdb.getBounds({
						user: scope.user,
						sql: scope.sql
					}, function(bounds) {
						map.fitBounds(bounds);
					});
				}

			}
		}
	}
])

.directive('eixosSummary', [
	function() {

		return {
			restrict: 'E',
			templateUrl: '/views/includes/eixos-summary.html',
			link: function(scope, element, attrs) {

				if($(window).width() > 770) {

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

				} else {

					$(element).find('header li').each(function() {
						var eixo = $(this).attr('class');
						var $content = $(this).parents('.eixos-summary').find('.eixos-content li.' + eixo + ' .eixo-content');

						$content.insertAfter($(this).find('h3'));
					});

				}

			}
		}

	}
])

.directive('nextPage', [
	function() {
		return {
			restrict: 'E',
			scope: {
				ref: '@',
				title: '@'
			},
			templateUrl: '/views/includes/next-page.html'
		}
	}
]);
