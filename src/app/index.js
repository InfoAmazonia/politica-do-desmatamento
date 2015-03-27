'use strict';

L.mapbox.accessToken = 'pk.eyJ1IjoibWlndWVscGVpeGUiLCJhIjoiVlc0WWlrQSJ9.pIPkSx25w7ossO6rZH9Tcw';

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

function isMobileSafari() {
	return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)
}

app.config(require('./config'))

.run([
	'$rootScope',
	'$location',
	'$window',
	function($rootScope, $location, $window) {
		/*
		 * Analytics
		 */
		$rootScope.$on('$stateChangeSuccess', function(ev, toState, toParams, fromState, fromParams) {
			if($window._gaq && fromState.name) {
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
			readyForNext: function(val) {
				if(typeof val !== 'undefined')
					readyForNext = val;
				return readyForNext;
			}
		}
	}
])

.controller('MapController', [
	'$scope',
	function($scope) {

		$scope.getBaseLayer = function() {
			return 'https://{s}.tiles.mapbox.com/v3/infoamazonia.forest-height,infoamazonia.osm-brasil/{z}/{x}/{y}.png';
		};

		$scope.getAmazLegalLayer = function() {
			return {
				user: 'infoamazonia',
				sql: 'SELECT * from amazlegal_br',
				cartocss: '#layer {line-color: #0f0; line-width: 1; line-opacity: .8;}'
			};
		};

		$scope.getUCLayer = function(startYear, endYear) {
			return {
				user: 'infoamazonia',
				sql: 'SELECT unidades_de_conservacao.* from unidades_de_conservacao, amazlegal_br WHERE (unidades_de_conservacao.ano_cria6 >= ' + startYear + ' AND unidades_de_conservacao.ano_cria6 <= ' + endYear + ') AND amazlegal_br.cartodb_id = 1 AND ST_Intersects(unidades_de_conservacao.the_geom, amazlegal_br.the_geom)',
				cartocss: '#layer{polygon-opacity:.7;line-color:#FFF;line-width:.5;line-opacity:1} #layer[categori3="Reserva Particular do Patrimônio Natural"]{polygon-fill:#A6CEE3} #layer[categori3="Parque"]{polygon-fill:#1F78B4} #layer[categori3="Área de Proteção Ambiental"]{polygon-fill:#B2DF8A} #layer[categori3="Floresta"]{polygon-fill:#33A02C} #layer[categori3="Reserva Extrativista"]{polygon-fill:#FB9A99} #layer[categori3="Estação Ecológica"]{polygon-fill:#E31A1C} #layer[categori3="Reserva Biológica"]{polygon-fill:#FDBF6F} #layer[categori3="Área de Relevante Interesse Ecológico"]{polygon-fill:#FF7F00} #layer[categori3="Monumento Natural"]{polygon-fill:#CAB2D6} #layer[categori3="Reserva de Desenvolvimento Sustentável"]{polygon-fill:#6A3D9A} #layer{polygon-fill:#DDD}',
				interactivity: 'categori3,nome_org12,nome_uc1,ano_cria6',
				template: '<p><strong>Categoria:</strong><br/>{{categori3}}</p><p><strong>Nome:</strong><br/>{{nome_uc1}}</p><p><strong>Ano de criação:</strong><br/>{{ano_cria6}}</p>',
				legend: '<div class="cartodb-legend category"><ul><li><div class="bullet" style="background: #A6CEE3"></div>Reserva Particular do Patrimônio Natural</li><li><div class="bullet" style="background: #1F78B4"></div>Parque</li><li><div class="bullet" style="background: #B2DF8A"></div>Área de Proteção Ambiental</li><li><div class="bullet" style="background: #33A02C"></div>Floresta</li><li><div class="bullet" style="background: #FB9A99"></div>Reserva Extrativista</li><li><div class="bullet" style="background: #E31A1C"></div>Estação Ecológica</li><li><div class="bullet" style="background: #FDBF6F"></div>Reserva Biológica</li><li><div class="bullet" style="background: #FF7F00"></div>Área de Relevante Interesse Ecológico</li><li><div class="bullet" style="background: #CAB2D6"></div>Monumento Natural</li><li><div class="bullet" style="background: #6A3D9A"></div>Reserva de Desenvolvimento Sustentável</li><li><div class="bullet" style="background: #DDDDDD"></div>Others</li></ul></div>'
			};	
		};

		$scope.getTILayer = function(startYear, endYear) {
			return {
				user: 'infoamazonia',
				sql: "SELECT wdpa_brazil.* from wdpa_brazil, amazlegal_br WHERE wdpa_brazil.status_yr >= " + startYear + " AND wdpa_brazil.status_yr <= " + endYear + " AND amazlegal_br.cartodb_id = 1 AND ST_Intersects(wdpa_brazil.the_geom, amazlegal_br.the_geom) AND wdpa_brazil.desig = 'Terra Indígena' AND wdpa_brazil.status = 'Designated'",
				cartocss: '#layer{polygon-fill:#0f0;polygon-opacity:.7;line-color:#fff;line-width:.5;line-opacity:1;}',
				interactivity: 'name,status_yr',
				template: '<p><strong>Categoria:</strong><br/>Território Indígena</p><p><strong>Nome:</strong><br/>{{name}}</p><p><strong>Ano de criação:</strong><br/>{{status_yr}}</p>',
				legend: '<div class="cartodb-legend category"><ul><li><div class="bullet" style="background: #0f0"></div>Território Indígena</li></ul></div>'
			};
		};

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

		$scope.iOS = isMobileSafari();

		/*
		 * VIDEO
		 */

		$scope.videoId = 'bkhRoHQEzkA';
		$scope.videoVars = {
			controls: isMobileSafari() ? 1 : 0,
			autoplay: isMobileSafari() ? 0 : 1,
			disablekb: 1,
			fs: 0,
			showinfo: 0,
			rel: 0,
			modestbranding: 1,
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
			return Video.readyForNext();
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

		$scope.mute = false;

		$scope.playVideo = function() {
			if($scope.player && !isMobileSafari()) {
				$scope.player.playVideo();
			}
		};

		$scope.pauseVideo = function() {
			if($scope.player) {
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

			$scope.paused = true;

			$scope.showInfo = false;

			$scope.initLoop = initLoop || 0;

			var set = function(player) {
				if(isMobileSafari()) {

					// playerReadyInterval = window.setInterval(function(){
					// 	player.playVideo();
					// }, 1000);

					// disablePlayerReadyInterval = window.setInterval(function(){
					// 	if (player.getCurrentTime() < 1.0) {
					// 		return;
					// 	}
					// 	// Video started...
					// 	window.clearInterval(playerReadyInterval);
					// 	window.clearInterval(disablePlayerReadyInterval);
					// }, 1000);

				}

				Video.setTime(0);
				Video.readyForNext(false);
				player.cueVideoById(id);
				player.unMute();

				if(!isMobileSafari()) {
					player.playVideo();
				}

				// setTimeout(function() {
				// 	player.pauseVideo();
				// 	setTimeout(function() {
				// 		player.playVideo();
				// 	}, 500);
				// }, 500);

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
								player.seekTo(0);
							} else {
								if($scope.initLoop) {
									player.seekTo($scope.initLoop);
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

		$scope.paused = true;

		$scope.$on('youtube.player.playing', function(event, player) {
			$scope.paused = false;
		});

		$scope.$on('youtube.player.buffering', function(event, player) {
			$scope.paused = false;
		});

		$scope.$on('youtube.player.paused', function(event, player) {
			$scope.paused = true;
		});

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
					var heightOffset = 130;
					if($(window).width() <= 770) {
						heightOffset = 47;
					} else {
						$('#timeline-nav').addClass('analise');
					}
					$('html,body').animate({
						scrollTop: $(window).height() - heightOffset
					}, 1000);
				} else {
					$('#timeline-nav').removeClass('analise');
					if(fromState.name.indexOf('analise') !== -1) {
						$('html,body').animate({
							scrollTop: 0
						}, 500);
					}
				}

				if(
					(fromState.name == 'equipe' && toState.name != 'metodologia') || 
					(fromState.name == 'metodologia' && toState.name != 'equipe')
				) {
					$('#timeline-nav').show().animo({animation: 'fadeInUp', duration: 0.5, keep: true});
				}

				if(
					(toState.name == 'equipe' && fromState.name != 'metodologia') || 
					(toState.name == 'metodologia' && fromState.name != 'equipe')
				) {
					$('#timeline-nav').animo({animation: 'fadeOutDown', duration: 0.5, keep: true}, function() {
						$('#timeline-nav').hide();
					});
				}

			}

			});

		/***/

		$scope.init = function() {

			$scope.initialized = true;
			$state.go('timeline', { year: Data.get()[0].slug });
			if(!isMobileSafari()) {
				$scope.playVideo();
			} else {
				$('.video-container iframe .ytp-large-play-button').click();
			}

		};

	}
]);

$(document).ready(function() {
	angular.bootstrap(document, ['monitor']);
});