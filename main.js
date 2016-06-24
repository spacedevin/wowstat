const electron = require('electron');
const {app, BrowserWindow, dialog, Menu, Tray} = electron;
const AutoLaunch = require('auto-launch');

let win;
let tray = null;


var launcher = new AutoLaunch({
	name: 'WoW Stat',
	path: '/Applications/WoW Stat.app',
	isHidden: false
});

launcher.enable();
console.log(launcher.isEnabled());

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 400,
		height: 490,
		titleBarStyle: 'hidden',
		resizable: false,
		title: 'WoW Stat'
	});

	// and load the index.html of the app.
	win.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

app.on('ready', () => {
	tray = new Tray('w@2x.png');
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Settings'},
		{label: 'Enabled', type: 'radio', checked: true}
	]);
	tray.setToolTip('WoW Stat')
	tray.setContextMenu(contextMenu)

	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

exports.selectDirectory = function (fn) {
	var res = dialog.showOpenDialog(win, {
		properties: ['openFile', 'openDirectory']
	});
	fn(res);
	//console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));
}

exports.setAutoload = function (fn) {
	launcher.enable();
}