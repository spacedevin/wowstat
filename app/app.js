const electron = require('electron');
const {remote} = electron;
const mainProcess = remote.require('./main');
const storage = require('electron-json-storage');
const {ipcRenderer} = require('electron');

var strings = mainProcess.setLocale(navigator.language);

angular
	.module('wowstat', [])
	.run(($rootScope) => {
		$rootScope.loaded = true;
	})
	.controller('main', ($scope, $http) => {
		$scope.platform = process.platform;
		$scope.strings = strings;
		$scope.regions = [
			{name: strings.realms.us, value: 'us'},
			{name: strings.realms.eu, value: 'eu'},
			{name: strings.realms.cn, value: 'cn'},
			{name: strings.realms.tw, value: 'tw'},
			{name: strings.realms.kr, value: 'kr'}
		];
		$scope.realms = [];
		$scope.selectPath = () => {
			mainProcess.selectDirectory((res) => {
				if (!res) {
					return;
				}
				$scope.$apply(($scope) => {
					$scope.options.path = res;
				});
			});
		};

		$scope.options = mainProcess.options();
		$scope.realms = mainProcess.realms;

		ipcRenderer.on('server-status', (event, arg) => {
			$scope.$apply(($scope) => {
				$scope.realms = arg;
				if (!$scope.options.realm) {
					$scope.options.realm = $scope.realms[0].value;
				}
			});

			console.log(arg);
		});

		$scope.$watch('options', (oldval, newval) => {
			console.debug('options changed', $scope.options);
			if (oldval.region != newval.region) {
				mainProcess.update();
			}
			if (oldval.autoload != newval.autoload) {
				mainProcess.autoload();
			}
			//mainProcess.options($scope.options);

			storage.set('options', $scope.options, (error) => {
				if (error) throw error;
			});
		}, true);

		storage.get('realms', (error, realms) => {
			if (error) throw error;

			if (!Object.keys(realms).length) {
				$scope.$apply(($scope) => {
					$scope.realms = realms;
					if ($scope.options.realm) {
					}
				});
			}

			$scope.$watch('realms', (oldval, newval) => {
				console.debug('realms changed', $scope.realms);
				storage.set('realms', $scope.realms, (error) => {
					if (error) throw error;
				});
			});

			//loadRealms();
		});

		ipcRenderer.on('notify', (event, arg) => {
			notify(arg.title, arg.body)
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