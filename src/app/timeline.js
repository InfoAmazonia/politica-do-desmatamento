'use strict';

module.exports = function(app) {

	app.controller('TimelineController', [
		'$scope',
		function($scope) {

			$scope.data = [
				{
					year: '1974',
					content: 'A rodovia Transamazônica (BR-230) é inaugurada em agosto. A obra resulta em uma estrada com 4.073 quilômetros de extensão (até hoje, mais da metade sem asfalto) e dá início à era moderna do desmatamento na Amazônia.',
					media: {
						type: 'image',
						url: '/img/1974_transamazonica.jpg'
					}
				},
				{
					year: '1980',
					content: ''
				},
				{
					year: '1990',
					content: ''
				},
				{
					year: '1991',
					content: ''
				},
				{
					year: '1995',
					content: ''
				},
				{
					year: '2003',
					content: ''
				},
				{
					year: '2004',
					content: ''
				},
				{
					year: '2007',
					content: ''
				},
				{
					year: '2008',
					content: ''
				},
				{
					year: '2009',
					content: ''
				},
				{
					year: '2011',
					content: ''
				},
				{
					year: '2012',
					content: ''
				},
				{
					year: '2013',
					content: ''
				},
				{
					year: '2014',
					content: ''
				},
				{
					year: '2015',
					content: ''
				},
				{
					year: '2020',
					content: ''
				}
			];

			$scope.data[0].active = true;
		}
	]);

}