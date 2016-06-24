const electron = require('electron')
const remote = electron.remote
const mainProcess = remote.require('./main')

angular
	.module('wowstat', []) //'ngRoute', 'ngResource'
/*
	.config(function($routeProvider, $locationProvider){
		$routeProvider
			.when('/', {
				action: 'home',
				controller: 'Home',
				templateUrl: 'home.html'
			})
			.when('/view/:id', {
				action: 'view',
				controller: 'View',
				templateUrl: 'view.html'
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	})
*/
	.run(function($rootScope, $http) {
		$rootScope.regions = [
			{name: 'US, Oceania, Latin America & Brazil', value: 'us'},
			{name: 'Europe & Russia', value: 'eu'},
			{name: 'China', value: 'cn'},
			{name: 'Taiwan', value: 'tw'},
			{name: 'Korea', value: 'kr'}
		];
		$rootScope.realms = [];
		$rootScope.selectPath = function() {
			mainProcess.selectDirectory(function(res) {
				if (!res) {
					return;
				}
				$rootScope.$apply(function($scope) {
					$scope.options.path = res;
				});
			});
		};

		$rootScope.options = {
			region: $rootScope.regions[0].value,
			up: 5,
			down: 1,
			path: process.platform == 'darwin' ? '/Applications/World of Warcraft/World of Warcraft.app': 'C:\\Program Files\\World of Warcraft\\WoW.exe'
		};

		var loadRealms = function() {
			$http.get('https://' + $rootScope.options.region + '.api.battle.net/wow/realm/status?locale=en_US&apikey=hw9djbbcu2cjacq36swsdkmq7y6cfnnt').then(function(res) {
				$rootScope.realms = res.data.realms;
				$rootScope.options.realm = $rootScope.realms[0].value;
			});
		};

		loadRealms();

		var notify = function(title, body) {
			if (process.platform == 'darwin') {
				new Notification(title, {
					body: body
				});
			} else {
				mainProcess.notify('test','this is test');
			}
		};
	});
