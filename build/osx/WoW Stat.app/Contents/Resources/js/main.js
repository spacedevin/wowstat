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
/*
var MainWindowParams = {
	width: 400,
	height: 590,
	resizable: false,
	maximizable: false
};
*/
var Defaults = {
	server: null,
	'notify-time': 5*1000*60,
	'check-up': 5*1000*60,
	'check-down': .5*1000*60,
	'notify-up-action': 'notify',
	'notify-down-action': 'notify',
	'startup-load': true,
	'startup-check': false,
	'startup-show-window': true,
	serial: null,
	'wow-path': Titanium.platform == 'win32' ? 'C:\\Program Files\\World of Warcraft\\WoW.exe' : '/Applications/World of Warcraft/WoW.app'
}
var TimeRange = [.25,.5,1,1.5,2,3,4,5,6,7,8,9,10,15,20,30,60];
var NotifyRange = [5,15,30,45,60,60*2,60*5,60*15,60*30,60*60];
var TableName = 'prefs';

// clear the db and reload the defaults
App.clearDb = function() {
	App.dbConnect();
	App.db.execute('DROP TABLE prefs;');
	App.prepareDb();
}

// prepare the db for connectivity
App.prepareDb = function() {
	App.dbConnect();

	var res = App.db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+ TableName +'";');
	var dbExists = false;
	while (res.isValidRow()) {
		var dbExists = true;
		res.next();
	}
	
	App.prefs = Defaults;
	
	if (dbExists) {
		var dbprefs = App.db.execute('SELECT * FROM '+ TableName +';');
		while (dbprefs.isValidRow()) {
			App.prefs[dbprefs.fieldByName('key')] = App.sterilizePref(dbprefs.fieldByName('value'));
			dbprefs.next();
		}
		
		for (x in Defaults) {
			if (!App.prefs[x]) {
				//App.db.execute('INSERT INTO ' + TableName + ' (`key`,value) VALUES("'+ x +'","' + Defaults[x] + '");');
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
}

// start or restart timers
App.timers = function() {
	if (App.timer) {
		clearInterval(App.timer);
	}
	App.timer = setInterval(App.check, App.prefs[App.serverStatus ? 'check-up' : 'check-down']);
};

// check to see if the server is up
App.check = function() {
	if (!App.prefs['server']) return;
	App.request('http://us.battle.net/api/wow/realm/status?realm=' + App.prefs['server'],function(json) {
		var status = json.realms[0];
		var color = 'blue';
		
		if (App.serverStatus !== null && App.serverStatus != status.status) {
			App.notifyAction(status.status);
		}

		if (!status.status) {
			color = 'red'; 
		} else {
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
		
		$('.wrapper').css('background-image','url(/img/bg-' + color + '.png)');
		App.tray.setIcon('/img/tray-icon-' + color + '.png');
		Ti.UI.setDockIcon('/img/icon-' + color + '.png');
		
		App.serverStatus = status.status;
	});
};

// notify the user by their prefered action
App.notifyAction = function(status) {
	var realm = App.realm(App.prefs['server']);
	if (status) {
		App.notify(realm.name + ' is up!', realm.name + ' is back up! Click here to launch WoW.',App.launch);
	} else {
		App.notify(realm.name + ' is down!', realm.name + ' has gone down. You will be notified again when it is back up.');
	}
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
	console.log(App.prefs);
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
App.preferences = function() {
	if (arguments[0]) {
		// save prefs
		App.dbConnect();
		if (arguments[0]['server'] != App.prefs['server']) {
			var check = true;
		} else {
			var check = false;
		}
		App.prefs = arguments[0];
		App.sterilizePrefs();
		console.log(App.prefs);

		for (x in App.prefs) {
			App.db.execute('UPDATE prefs SET value="'+ App.prefs[x] +'" WHERE `key`="'+ x +'";');
		}

		App.dbDisconnect();
		App.check();
		App.timers();
	}
	return App.prefs;	
};

// throw a notification
App.notify = function(title, message, callback) {
	var notice = Ti.Notification.createNotification();
	notice.setTitle(title);
	notice.setMessage(message);
	notice.setTimeout(App.prefs['notify-time']);
	if (callback) {
		//notice.setCallback(callback);
	}
	notice.show();
};

// request a remote uri
App.request = function(url, complete) {
	var client = Ti.Network.createHTTPClient();
	client.open("GET", url, false);
	client.send();
	complete($.parseJSON(client.responseText),client.responseText);
};

// get the realms and add them to the realm list
App.getRealms = function() {
	App.request('http://us.battle.net/api/wow/realm/status',function(json) {
		App.realms = json.realms;
		$('select[name="server"] option').remove();
		for (x in App.realms) {
			$('select[name="server"]').append($('<option></option>')
				.attr('value',App.realms[x].slug)
				.text(App.realms[x].name)); 
		}
	});
};

// launch wow
App.launch = function() {
	var process = Ti.Process.createProcess([App.prefs['wow-path']]);
	process.launch();
};

// prepare the tray menu
App.prepareTray = function() {
	App.tray = Ti.UI.addTray('/img/tray-icon-blue.png');
	App.tray.setHint('WoW Stat');
	var trayMenu = Ti.UI.createMenu();
	App.tray.setMenu(trayMenu);
	
	trayMenu.appendItem(Ti.UI.createMenuItem("Recheck Server", function(){
		App.check();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Launch WoW", function(){
		App.launch();
	}));
	trayMenu.addSeparatorItem();
	trayMenu.appendItem(Ti.UI.createMenuItem("Hide WoW Stat", function(){
		App.mainWindow.hide();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Show WoW Stat", function(){
		App.mainWindow.show();
	}));
	trayMenu.appendItem(Ti.UI.createMenuItem("Quit WoW Stat", function(){
		Ti.App.exit();
	}));
}

// prepare the ui for viewing
App.prepareUI = function() {
	//App.initWindow();
	if (App.prefs['startup-show-window']) {
		App.mainWindow.show();
	}

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

App.main = function() {
	// init our main app function
	App.prepareDb();
	App.prepareUI();
	App.getRealms();
	App.loadPrefs();
	App.check();
	App.timers();

	// add event handlers to dom
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

$(document).ready(function() {	
	App.main();
});