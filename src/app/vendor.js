window._ = require('underscore');
window.L = require('leaflet');

require('animo.js/animo');

require('angular');
require('angular-animate/angular-animate');
require('ui-router');
require('angular-leaflet/dist/angular-leaflet-directive');
require('angular-youtube/src/angular-youtube-embed');

window.moment = require('moment-timezone');
require('moment/locale/pt-br');
moment.locale('pt-br');
moment.locale('pt-br', {
	calendar : {
		sameDay: '[hoje às] LT',
		nextDay: '[amanhã às] LT',
		nextWeek: 'dddd [às] LT',
		lastDay: '[ontem às] LT',
		lastWeek: 'DD/MM [às] LT',
		sameElse: 'DD/MM [às] LT'
	},
});