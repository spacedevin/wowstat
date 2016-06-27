const electron = require('electron');
const {app, BrowserWindow, dialog, Menu, Tray} = electron;
const AutoLaunch = require('auto-launch');
const notifier = require('node-notifier');
const path = require('path');
const request = require('request');
const storage = require('electron-json-storage');
const {ipcMain} = require('electron');
const child_process = require('child_process');

let win;
let tray = null;
let options = {};
let interval = null;
let status = null;

var launcher = new AutoLaunch({
	name: 'WoW Stat',
	path: app.getAppPath(),
	isHidden: false
});

var createWindow = () => {
	win = new BrowserWindow({
		width: 398,
		height: 305,
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
	console.log('notifying');
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
		return;
	}

	if (action == 'launch' && options.path) {
		child_process.exec('open "' + options.path + '"', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
		});
	}
};

var checkServer = () => {
	request('http://localhost:3000/status?region=' + options.region, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body).hits.hits;
			var rs = [];
			for (var x in body) {
				rs.push(body[x]._source);
			}
			win.webContents.send('server-status', rs);
			exports.realms = rs;

			if (options.realm) {
				for (var x in rs) {

					if (rs[x].slug == options.realm) {

						if (status === false || status === true) {
							if (rs[x].status != status) {
								if (rs[x].status) {
									notify(true, rs[x]);
								} else {
									notify(false, rs[x]);
								}
							}
						}

						status = rs[x].status;

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
		actionDown: 'notify',
		autoload: false
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

exports.autoload = (on) => {
	if (options.autoload) {
		launcher.enable();
	} else {
		launcher.disable();
	}
};

exports.update = () => {
	changeInterval();
};

exports.options = (o) => {
	if (o) {
		options = o;
	}
	return options;
};

exports.realms = [];