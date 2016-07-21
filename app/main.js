const electron = require('electron');
const {app, BrowserWindow, dialog, Menu, MenuItem, Tray} = electron;
const AutoLaunch = require('auto-launch');
const notifier = require('node-notifier');
const path = require('path');
const request = require('request');
const storage = require('electron-json-storage');
const {ipcMain} = require('electron');
const child_process = require('child_process');
const {nativeImage} = require('electron');
const open = require('open');
const {setLocale} = require('./strings');
var strings = setLocale('en_US');


let win;
let tray = null;
let options = {};
let interval = null;
let status = null;
let isNew = false;

var launcher = new AutoLaunch({
	name: 'WoW Stat',
	path: process.platform === 'darwin' ? app.getAppPath() : process.execPath,
	isHidden: false
});

var createWindow = () => {
	win = new BrowserWindow({
		width: process.platform === 'darwin' ? 398 : 425,
		height: process.platform === 'darwin' ? 285 : 324,
		titleBarStyle: 'hidden',
		resizable: false,
		title: 'WoW Stat',
		show: false
	});

	win.loadURL(`file://${__dirname}/index.html`);

	win.on('closed', () => {
		win = null;
	});

	// dev
	if (process.env.ELECTRON_DEV) {
		win.webContents.openDevTools();
	}
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

var setStatus = (s) => {
	var icon = '';
	if (s.status == false) {
		icon = '-red';
	} else {
		if (s.queue == true) {
			icon = '-yellow';
		} else {
			icon = '-green';
		}
	}
	console.log('setting icon to '+icon);
	tray.setImage(nativeImage.createFromPath(path.join(__dirname) + '/w' + icon + '@2x.png'));
};

var checkServer = () => {
	request('http://cache.wowst.at/status?region=' + options.region, function (error, response, body) {
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

						if (rs[x].status != status) {
							setStatus(rs[x]);

							if (status === false || status === true) {
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

var createMenu = () => {
	return contextMenu = Menu.buildFromTemplate([
		{
			label: strings.settings,
			click: () => {
				if (win === null) {
					createWindow();
				} else {
					win.show();
				}
			}
		},
		{
			label: strings.enabled,
			type: 'checkbox',
			checked: true,
			click: (e) => {
				console.log(e.checked);
			}
		},
		{
			label: strings.launch,
			click: (e) => {
				open(options.path);
			}
		},
		{
			type: 'separator'
		},
		{
			label: strings.help,
			click: (e) => {
				open('http://wowst.at');
			}
		},
		{
			label: strings.quit,
			click: (e) => {
				app.quit();
			}
		}
	]);
};

app.on('ready', () => {

	if (process.platform === 'darwin') {

		const template = [
			{
				role: 'window',
				submenu: [
					{
						role: 'minimize'
					},
					{
						role: 'close'
					},
				]
			},
			{
				role: 'help',
				submenu: [
					{
						label: 'Learn More',
						click() {
							open('http://wowst.at');
						}
					},
				]
			},
		];

		// darwin specific
		template.unshift({
			label: 'WoW Stat',
			submenu: [
				{
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					role: 'hide'
				},
				{
					role: 'hideothers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit'
				},
			]
		});
		// Window menu.
		template[1].submenu = [
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Zoom',
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				role: 'front'
			}
		];
		const menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);
	};


	var image = nativeImage.createFromPath(path.join(__dirname) + '/w@2x.png');
	tray = new Tray(image);
	tray.setToolTip('WoW Stat')
	tray.setContextMenu(createMenu());

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

	storage.get('options', (error, o) => {
		if (error) throw error;
		console.log('current options', o, Object.keys(o).length);

		if (!Object.keys(o).length) {
			console.log('no options');
			isNew = true;
			storage.set('options', options, (error) => {
				if (error) throw error;
				console.log(options);
			});
		} else {
			console.log('options exist');
			options = o;
		}

		setTimeout(() => {
			if (isNew) {
				if (app.show) {
					app.show();
				}
				win.show();
			} else {
				if (app.hide) {
					app.hide();
				}
				win.hide();
			}
		},10);
	});

	createWindow();

	if (process.platform === 'darwin' && app.dock) {
		app.dock.hide();
	}
/*
	setTimeout(() => {
		storage.clear(() => {
		});
	},5000);
*/
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

exports.strings = strings;
exports.setLocale = (loc) => {
	strings = setLocale(loc);
	tray.setContextMenu(createMenu());
	return exports.strings = strings;
};

exports.isNew = isNew;