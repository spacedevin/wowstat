const electron = require('electron');
const {app, BrowserWindow, dialog, Menu, Tray} = electron;
const AutoLaunch = require('auto-launch');
const notifier = require('node-notifier');
const path = require('path');
const request = require('request');
const storage = require('electron-json-storage');
const {ipcMain} = require('electron');

let win;
let tray = null;
let options = {};
let interval = null;
let status = false;


var launcher = new AutoLaunch({
	name: 'WoW Stat',
	path: '/Applications/WoW Stat.app',
	isHidden: false
});

launcher.enable();
console.log(launcher.isEnabled());

var createWindow = () => {
	win = new BrowserWindow({
		width: 400,
		height: 320,
		titleBarStyle: 'hidden',
		resizable: false,
		title: 'WoW Stat'
	});

	win.loadURL(`file://${__dirname}/index.html`);

	win.on('closed', () => {
		win = null;
	});

	// dev
	win.webContents.openDevTools();
};

var notify = (s, realm) => {
	var action = options[s ? 'actionUp' : 'actionDown'];
	if (action == 'notify') {
		let data = {
			body: 'The WoW realm ' + realm.name + ' is ' + (s ? 'back online' : 'offline'),
			title: realm.name + ' is ' + (s ? 'up' : 'down')
		};
		if (win) {
			win.webContents.send('notify', data);
		} else {
			exports.notify(data.title, data.message);
		}
	}
};

var checkServer = () => {
	request('https://eu.api.battle.net/wow/realm/status?locale=en_US&apikey=hw9djbbcu2cjacq36swsdkmq7y6cfnnt', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			win.webContents.send('server-status', body);

			if (options.realm) {
				for (var x in body.realms) {

					if (body.realms[x].slug == options.realm) {

						if (status === false || status === true) {
							if (body.realms[x].status != status) {
								if (body.realms[x].status) {
									notify(true, body.realms[x]);
								} else {
									notify(false, body.realms[x]);
								}
							}
						}

						status = body.realms[x].status;

						break;
					}
				}
			}
		}
	});
};

var changeInterval = () => {
	if (interval) {
		clearInterval(interval);
	}
	checkServer();
	interval = setInterval(() => {
		checkServer();
	}, options.intervalDown * 1000 * 60);
};

app.on('ready', () => {
	tray = new Tray('w@2x.png');
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Settings',
			click: () => {
				if (win === null) {
					createWindow();
				} else {
					win.show();
				}
			}
		},
		{
			label: 'Enabled',
			type: 'checkbox',
			checked: true,
			click: (e) => {
				console.log(e.checked);
			}
		}
	]);
	tray.setToolTip('WoW Stat')
	tray.setContextMenu(contextMenu);

	options = {
		region: 'us',
		intervalUp: 5,
		intervalDown: 1,
		path: process.platform == 'darwin' ? '/Applications/World of Warcraft/World of Warcraft.app': 'C:\\Program Files\\World of Warcraft\\WoW.exe',
		actionUp: 'notify',
		actionDown: 'notify'
	};

	changeInterval();
/*
	storage.clear(() => {
	});
*/

	storage.get('options', (error, o) => {
		if (error) throw error;
		console.log('current options', o, Object.keys(o).length);

		if (!Object.keys(o).length) {
			console.log('no options');
			storage.set('options', options, (error) => {
				if (error) throw error;
				console.log(options);
			});
		} else {
			console.log('options exist');
			options = o;
		}
	});


	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});

exports.selectDirectory = (fn) => {
	var res = dialog.showOpenDialog(win, {
		properties: ['openFile', 'openDirectory']
	});
	fn(res ? res[0] : null);
}

exports.setAutoload = (fn) => {
	launcher.enable();
}

exports.notify = (title, message, fn) => {
	notifier.notify({
		title: title,
		message: message,
		icon: path.join(__dirname, 'w@2x.png'),
		sound: true,
		contentImage: void 0,
		wait: false
	}, (err, response) => {
		console.log(arguments);
	});

	notifier.on('click', (notifierObject, options) => {
		fn();
	});
}

exports.hide = () => {
	win.hide();
}

exports.options = (o) => {
	if (o) {
		let changed = false;;
		if (o.realm != options.realm) {
			changed = true;
		}
		options = o;
		if (changed) {
			changeInterval();
		}
	}
	return options;
};
