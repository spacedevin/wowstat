/**
 * The WoW Stat App code
 * 
 * @author:		Devin Smith
 * @date:		2012-04-12
 * 
 */

var Ti = Titanium;
var App = {
	mainWindow: Ti.UI.getMainWindow(),
	prefs: [],
	serverStatus: null
};
var Defaults = {
	server: null,
	'notify-time-up': 15*60,
	'notify-time-down': 5,
	'check-up': 5*1000*60,
	'check-down': .5*1000*60,
	'notify-up-action': 'notify',
	'notify-down-action': 'notify',
	'startup-load': true,
	'startup-check': false,
	'startup-show-window': true,
	serial: null,
	'wow-path': Ti.platform == 'win32' ? 'C:\\Program Files\\World of Warcraft\\WoW.exe' : '/Applications/World of Warcraft/WoW.app'
};
var TimeRange = [.25,.5,1,1.5,2,3,4,5,6,7,8,9,10,15,20,30,60];
var NotifyRange = [5,15,30,45,60,60*2,60*5,60*15,60*30,60*60];
var TableName = 'prefs';

// clear the db and reload the defaults
App.clearDb = function() {
	
	App.dbConnect();
	App.db.execute('DROP TABLE prefs;');
	App.dbDisconnect();
	
	App.serverStatus = null;

	for (x in Defaults) {
		if (x == 'serial') continue;
		App.prefs[x] = Defaults[x];
	}
	App.prefs['server'] = App.realms[0];
	App.prepareDb();
	App.loadPrefs();
};

// prepare the db for connectivity
App.prepareDb = function() {
	App.dbConnect();

	var res = App.db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+ TableName +'";');
	var dbExists = false;
	while (res.isValidRow()) {
		var dbExists = true;
		res.next();
	}
	
	for (x in Defaults) {
		App.prefs[x] = Defaults[x];
	}
	
	if (dbExists) {
		var dbprefs = App.db.execute('SELECT * FROM '+ TableName +';');
		while (dbprefs.isValidRow()) {
			App.prefs[dbprefs.fieldByName('key')] = App.sterilizePref(dbprefs.fieldByName('value'));
			dbprefs.next();
		}
		
		for (x in Defaults) {
			if (typeof App.prefs[x] === 'undefined') {
				App.db.execute('INSERT INTO ' + TableName + ' (`key`,value) VALUES("'+ x +'","' + Defaults[x] + '");');
			}
		}
	} else {
		App.db.execute('CREATE TABLE IF NOT EXISTS prefs(`key` TEXT PRIMARY KEY, `value` TEXT);');

		for (x in Defaults) {
			App.db.execute('INSERT INTO ' + TableName + ' (`key`,value) VALUES("'+ x +'","' + Defaults[x] + '");');
		}
	}
	
	App.dbDisconnect();
};

// connect to the database
App.dbConnect = function() {
	if (!App.db) {
		App.db = Ti.Database.open('wowstat');
	}
};

// disconnect from the db
App.dbDisconnect = function() {
	App.db.close();
	App.db = false;
};

// start or restart timers
App.timers = function() {
	if (App.timer) {
		clearInterval(App.timer);
	}
	App.timer = setInterval(App.check, App.prefs[App.serverStatus ? 'check-up' : 'check-down']);
};

// get a color by realm status
App.getColor = function(status) {
	var label = status.name,
		color = 'blue';
	if (!status.status) {
		color = 'red';
		label += ' is down!';
	} else {
		label += ' is up with ' + status.population + ' pop';
		switch (status.population) {
			case 'high':
				color = 'orange';
				break;
			case 'medium':
				color = 'yellow';
				break;
			case 'low':
			default:
				color = 'green';
				break;
		}
	}
	return {color: color, label: label};
}

// triggered after a check
App.checkComplete = function(json) {
	var status = json.realms ? json.realms[0] : json,
		color,
		label;
	
	if (App.serverStatus !== null && App.serverStatus != status.status) {
		App.notifyAction(status.status);
	}
	var byStatus = App.getColor(status);
	color = byStatus.color;
	label = byStatus.label; 
	
	$('.wrapper').css('background-image','url(/img/bg-' + color + '.png)');
	App.tray.setIcon('/img/tray-icon-' + color + '-'+ App.platform +'.png');
	Ti.UI.setDockIcon('/img/icon-' + color + '.png');
	App.trayStatus.setLabel(label);
	
	App.serverStatus = status.status;
};

// check to see if the server is up
App.check = function() {
	if (!App.prefs.server) return;
	if (!App.serverStatus && App.realms) {
		for (x in App.realms) {
			if (App.realms[x].slug == App.prefs.server) {
				App.checkComplete(App.realms[x]);
				break;
			}
		}
	}
	App.request('http://us.battle.net/api/wow/realm/status?realm=' + App.prefs['server'],App.checkComplete);
};

// notify the user by their prefered action
App.notifyAction = function(status) {
	var realm = App.realm(App.prefs['server']);
	if (status) {
		App.notify({
			title: realm.name + ' is up!',
			message: realm.name + ' is back up! Click here to launch WoW.',
			timeout: App.prefs['notify-time-up'],
			color: 'green',
			callback: App.launch
		});
	} else {
		App.notify({
			title: realm.name + ' is down!',
			message: realm.name + ' has gone down. You will be notified again when it is back up.',
			timeout: App.prefs['notify-time-down'],
			color: 'red'
		});
	}
};

// throw a notification
App.notify = function(params) {
	var notice = Ti.Notification.createNotification(window);
	notice.setTitle(params.title);
	notice.setMessage(params.message);
	 // @bug this doesnt seem to work with growl 1.2.2 on osx. always defaults to 5 seconds
	notice.setTimeout(params.timeout || 5);
	if (params.callback) {
		notice.setCallback(params.callback);
	}
	if (params.color) {
		notice.setIcon('/img/icon-' + params.color + '.png');
	}
	notice.show();
};

// get the realms info. only needed when a status changes
App.realm = function(realm) {
	for (x in App.realms) {
		if (App.realms[x].slug == realm) {
			return App.realms[x]; 
		}
	}
	return null;
};

// read the prefs from dom and store them
App.readPrefs = function() {
	var prefs = {};
	$('select, input:radio:checked, input:text').each(function() {
		prefs[$(this).attr('name')] = $(this).val();
	});
	$('input:checkbox').each(function(){
		prefs[$(this).attr('name')] = $(this).attr('checked') ? true : false;
	});
	App.preferences(prefs);
};

// load the prefs to the form
App.loadPrefs = function() {
	for (x in App.prefs) {
		var el = $('[name="'+ x +'"]');
		if (el.length > 1) {
			// radio
			$('input:radio[name="'+ x +'"][value="'+ App.prefs[x] +'"]').attr('checked', true);
		} else if (el.attr('type') == 'checkbox') {
			// checkbox
			el.attr('checked',App.prefs[x]);
		} else {
			// select or regular input
			el.val(App.prefs[x]);
		}
	}
};

// update prefs
App.preferences = function(prefs) {
	if (prefs) {
		// save prefs
		App.dbConnect();
		if (prefs.server != App.prefs.server) {
			var check = true;
		} else {
			var check = false;
		}
		App.prefs = prefs;
		App.sterilizePrefs();
		console.log(App.prefs);

		for (x in App.prefs) {
			App.db.execute('UPDATE prefs SET value="'+ App.prefs[x] +'" WHERE `key`="'+ x +'";');
		}

		App.dbDisconnect();
		if (check) {
			App.check();
		}
		App.timers();
	}
	return App.prefs;	
};

// convert all prefs
App.sterilizePrefs = function() {
	for (x in App.prefs) {
		App.prefs[x] = App.sterilizePref(App.prefs[x]); 
	}
};

// convert data types
App.sterilizePref = function(pref) {
	if (pref == "false") pref = false;
	else if (pref == "true") pref = true;
	else if (pref == "null") pref = null;
	else if (pref == parseInt(pref)) pref = parseInt(pref);
	return pref;
};

// request a remote uri
App.request = function(url, complete) {
	var client = Ti.Network.createHTTPClient();
	client.open("GET", url, false);
	client.send();
	complete($.parseJSON(client.responseText),client.responseText);
};

// change the server
App.changeServer = function(e) {
	var server = e.getTarget().server;

	$('select[name="server"]').val(server.slug);
	App.readPrefs();
}

// get the realms and add them to the realm list
App.getRealms = function() {
	App.request('http://us.battle.net/api/wow/realm/status',function(json) {
		App.realms = json.realms;
		$('select[name="server"] option').remove();
		
		var trayServersMenu = Ti.UI.createMenu();
		App.trayServers.setSubmenu(trayServersMenu);

		for (var x in App.realms) {
			$('select[name="server"]').append($('<option></option>')
				.attr('value',App.realms[x].slug)
				.text(App.realms[x].name));

			var color = App.getColor(App.realms[x]);

			var i = Ti.UI.createMenuItem(App.realms[x].name, App.changeServer);
			console.log(i);
			i.server = App.realms[x];
			i.setIcon('/img/tray-status-icon-'+ color.color +'-'+ App.platform +'.png');
			trayServersMenu.appendItem(i);
		}
		if (!App.prefs.server) {
			App.prefs.server = App.realms[0];
		}
	});
};

// launch wow
App.launch = function() {
	var process = Ti.Process.createProcess([App.prefs['wow-path']]);
	process.launch();
};

// prepare the main window height
App.prepareChrome = function() {
	if (Titanium.platform == 'win32') {
		App.mainWindow.height = App.mainWindow.height + 40;
	} 
};

// prepare the tray menu
App.prepareTray = function() {
	App.tray = Ti.UI.addTray('/img/tray-icon-blue-'+ App.platform +'.png');
	App.tray.setHint('WoW Stat');
	var trayMenu = Ti.UI.createMenu();
	App.tray.setMenu(trayMenu);
	
	trayMenu.appendItem(Ti.UI.createMenuItem("WoW Stat",function() {
		App.mainWindow.show();
		App.mainWindow.unminimize();
	}));
	trayMenu.addSeparatorItem();

	App.trayStatus = Ti.UI.createMenuItem("Server Status Unavailable");
	trayMenu.appendItem(App.trayStatus);
	
	
	App.trayServers = Ti.UI.createMenuItem("Change Servers");
	trayMenu.appendItem(App.trayServers);
	

	
	
	trayMenu.appendItem(Ti.UI.createMenuItem("Recheck Server", function(){
		App.check();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Launch WoW", function(){
		App.launch();
	}));
	trayMenu.addSeparatorItem();
	trayMenu.appendItem(Ti.UI.createMenuItem("Hide", function(){
		App.mainWindow.hide();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Show", function(){
		App.mainWindow.show();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Quit", function(){
		Ti.App.exit();
	}));
};

// show or hide the window
App.prepareWindow = function() {
	if (App.prefs['startup-show-window']) {
		App.mainWindow.show();
	}
};

// prepare the ui for viewing
App.prepareUI = function() {
	App.prepareChrome();
	App.prepareWindow();
	App.prepareTray();

	var menu = Ti.UI.createMenu();
	var file = Ti.UI.createMenuItem("File");
	var view = Ti.UI.createMenuItem("View");
	
	menu.appendItem(file);
	menu.appendItem(view);
	file.addItem("Clear Preferences", function(e) {
	    App.clearDb()
		App.loadPrefs();
	});
	file.addItem("Check", function(e) {
	    App.clearDb()
		App.loadPrefs();
	});
	view.addItem("Source", function(e) {
	    
	});
	Ti.UI.setMenu(menu);

	$('select[name="check-up"], select[name="check-down"]').each(function() {
		for (x in TimeRange) {
			$(this).append($('<option></option>')
				.attr('value',TimeRange[x]*1000*60)
				.text(TimeRange[x] + ' minutes')); 
		}
	});
};

// open the registration window
App.openRegisterWindow = function() {
	window.open('http://wow-stat.net/register.php');
};

// set autoload
App.autoload = function(load) {
	// Windows startup shortcut 
	if (Ti.platform == 'win32') {
	 
		// Used by the windows commands to get the startup folder location
		var startupRegKeyWin = ["C:\\Windows\\System32\\cmd.exe", "/C", "REG", "QUERY", "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders", "/v", "Startup", "|findstr", "/i", "REG_SZ"];
	 
		// Set out app exe path and the shortcut path         
		var appPathExe = Titanium.Filesystem.getApplicationDirectory()+'\\'+Titanium.App.getName()+'.exe';
		var regString = null;
		 
		// Set the process
		var process = Titanium.Process.createProcess(startupRegKeyWin);
	 
		process.setOnReadLine(function(data) {
			// Get the string from the registry that contains out startup folder path
			regString = data.toString().split('REG_SZ');
			// Split the string on REG_SZ, this will leave our startup folder path - trim the string to remove any unecessary white space 
			// .trim() is a Mootools method, if your using jQuery, use $.trim(regString[1]) instead
			var startupFolderPath = regString[1].trim();
			// An extra check to make sure this is the reg key with the Startup folder
			if (startupFolderPath.test('Startup')) {
				// Create the shortcut in the startup folder now that we have the path
				var appPathShortcut = startupFolderPath+'\\'+Titanium.App.getName()+'.lnk';
				var file = Titanium.Filesystem.getFile(appPathExe);
				file.createShortcut(appPathShortcut);
			}
		});

		// Fire the process to find the reg key
		process.launch();
	}
};

// add event handlers to dom
App.addEvents = function() {
	$('select, input').change(App.readPrefs);
	$('#browse').click(function() {
		var props = {multiple:false,directories:false,files:true,types:['exe','app','bin','bat','sh']};
		Ti.UI.openFileChooserDialog(function(f) {
			$('input[name="wow-path"]').val(f[0]);
			App.readPrefs();
		},props);
	});
	
	$('input[name="wow-path"]').get(0).addEventListener("drop", function(e) {
		App.readPrefs();
	}, false);
	$('input[name="wow-path"]').get(0).addEventListener("dragover", function(e) {
		$('input[name="wow-path"]').val('');
	}, false);

	$('.devin').click(function() {
		Ti.Platform.openURL('http://devin.la');
	});
};

// triggered when the app is finished loading
App.complete = function() {
	$('#loading-overlay').hide();
};

// safe platform name
App.setPlatform = function() {
	switch (Ti.platform) {
		case 'win32':
		case 'win64':
		case 'win':
			App.platform = 'win';
			break;
		case 'osx':
		default:
			App.platform = 'osx';
			break;
	}
};

// initilize db, prefs, and ui
App.main = function() {
	App.setPlatform();
	App.prepareDb();
	App.prepareUI();
	App.getRealms();
	App.loadPrefs();
	App.check();
	App.timers();
	App.addEvents();
	App.complete();
};

$(document).ready(function() {	
	App.main();
});