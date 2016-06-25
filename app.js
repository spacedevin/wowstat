const electron = require('electron');
const {remote} = electron;
const mainProcess = remote.require('./main');
const storage = require('electron-json-storage');


angular
	.module('wowstat', []) //'ngRoute', 'ngResource'
/*
	.config(($routeProvider, $locationProvider) =>{
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
	.run(($rootScope, $http) => {
		$rootScope.regions = [
			{name: 'US, Oceania, Latin America & Brazil', value: 'us'},
			{name: 'Europe & Russia', value: 'eu'},
			{name: 'China', value: 'cn'},
			{name: 'Taiwan', value: 'tw'},
			{name: 'Korea', value: 'kr'}
		];
		$rootScope.realms = [];
		$rootScope.selectPath = () => {
			mainProcess.selectDirectory((res) => {
				if (!res) {
					return;
				}
				$rootScope.$apply(($scope) => {
					$scope.options.path = res;
				});
			});
		};
/*
		storage.clear((error) => {
			if (error) throw error;
		});
		return;
		*/

		$rootScope.options = {
			region: $rootScope.regions[0].value,
			up: 5,
			down: 1,
			path: process.platform == 'darwin' ? '/Applications/World of Warcraft/World of Warcraft.app': 'C:\\Program Files\\World of Warcraft\\WoW.exe',
			actionUp: 'notify',
			actionDown: 'notify'
		};
		$rootScope.realms = [];

		storage.get('options', (error, options) => {
			if (error) throw error;
			console.debug('current options', options, Object.keys(options).length);

			if (!Object.keys(options).length) {
				console.debug('no options');
				storage.set('options', $rootScope.options, (error) => {
					if (error) throw error;
					console.log(options);
				});
			} else {
				console.debug('options exist');
				$rootScope.$apply(($scope) => {
					$scope.options = options;
				});
			}


		});
			$rootScope.$watch('options', (oldval, newval) => {
				console.debug('options changed', $rootScope.options);
				storage.set('options', $rootScope.options, (error) => {
					if (error) throw error;
				});
			});
		var loadRealms = () => {
			$http.get('https://' + $rootScope.options.region + '.api.battle.net/wow/realm/status?locale=en_US&apikey=hw9djbbcu2cjacq36swsdkmq7y6cfnnt').then((res) => {
				$rootScope.realms = res.data.realms;
				if (!$rootScope.options.realm) {
					$rootScope.options.realm = $rootScope.realms[0].value;
				}
			});
		};

		storage.get('realms', (error, realms) => {
			if (error) throw error;

			if (!Object.keys(realms).length) {
				$rootScope.$apply(($scope) => {
					$scope.realms = realms;
					if ($scope.options.realm) {
					}
				});
			}

			$rootScope.$watch('realms', (oldval, newval) => {
				console.debug('realms changed', $rootScope.realms);
				storage.set('realms', $rootScope.realms, (error) => {
					if (error) throw error;
				});
			});

			loadRealms();
		});


		var notify = (title, body) => {
			if (process.platform == 'darwin') {
				new Notification(title, {
					body: body
				});
			} else {
				mainProcess.notify(title, body);
			}
		};
	});
