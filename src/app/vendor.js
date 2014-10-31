window._ = require('underscore');
window.L = require('leaflet');

require('angular');
require('ui-router');
require('angular-leaflet/dist/angular-leaflet-directive');

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