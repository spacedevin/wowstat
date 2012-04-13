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
	serverStatus: true
};
var MainWindowParams = {
	width: 400,
	height: 590,
	resizable: false,
	maximizable: false
};
var Defaults = {
	server: null,
	'notify-time': 5000,
	'check-up': 5000,
	'check-down': 500,
	'notify-up-action': 'notify',
	'notify-down-action': 'notify',
	'startup-load': true,
	'startup-check': false,
	serial: null,
	'wow-path': Titanium.platform == 'win32' ? 'C:\\Program Files\\World of Warcraft\\WoW.exe' : '/Applications/World of Warcraft/WoW.app'
}
var TimeRange = [.25,.5,1,1.5,2,3,4,5,6,7,8,9,10,15,20,30,60];
var NotifyRange = [5,15,30,45,60,60*2,60*5,60*15,60*30,60*60];
var TableName = 'prefs';


// prepare the db for connectivity
App.prepareDb = function() {
	App.dbConnect();
	//App.db.execute('DROP TABLE prefs;');
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
			App.prefs[dbprefs.fieldByName('key')] = dbprefs.fieldByName('value');
			dbprefs.next();
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
		clearTimeout(App.timer);
	}
	console.log(App.prefs[App.serverStatus ? 'check-up' : 'check-down']);
	App.timer = setTimeout(App.check, App.prefs[App.serverStatus ? 'check-up' : 'check-down']);
};

// check to see if the server is up
App.check = function() {
	if (!App.prefs['server']) return;
	App.request('http://us.battle.net/api/wow/realm/status?realm=' + App.prefs['server'],function(json) {
		var status = json.realms;
		
		if (App.serverStatus != status.status) {
			App.notifyAction(status.status);	
		}
		App.serverStatus = status.status;
	});
};

// notify the user by their prefered action
App.notifyAction = function(status) {
	var realm = App.realm(App.prefs['server']);
	if (status) {
		App.notify(realm.name + ' is up! :)', realm.name + ' is back up! Click here to launch WoW.');
	} else {
		App.notify(realm.name + ' is down! :(', realm.name + ' has gone down. You will be notified again when it is back up.');
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

// get or set prefs
App.preferences = function() {
	if (arguments[0]) {
		// save prefs
		App.dbConnect();
		App.prefs = arguments[0];
		console.log(App.prefs)

		for (x in App.prefs) {
			App.db.execute('UPDATE prefs SET value="'+ App.prefs[x] +'" WHERE `key`="'+ x +'";');
		}

		App.dbDisconnect();
		App.timers();
		
	}
	return App.prefs;	
};

// throw a notification
App.notify = function(title, message) {
	var notice = Ti.Notification.createNotification();
	notice.setTitle(title);
	notice.setMessage(message);
	notice.setTimeout(App.prefs['notify-time']);
	notice.show();
};

// set up the main windows size n stuff
App.initWindow = function() {
	for (x in MainWindowParams) {
		App.mainWindow[x] = MainWindowParams[x]
	};
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

// triggered after a user clicks the tray icon
App.trayClick = function() {
	
};

// prepare the ui for viewing
App.prepareUI = function() {
	Ti.UI.addTray('/img/dock-icon-blue.png',App.trayClick);
	//var menu = Ti.UI.createMenu();
	//mainMenu.appendItem(Ti.UI.createMenuItem("HAI"));
	//menu.addItem("File", function(e) {
	//    alert("Bye!");
	//});
	//Titanium.UI.setMenu(menu);
	
	App.initWindow();

	$('select[name="check-up"], select[name="check-down"]').each(function() {
		for (x in TimeRange) {
			$(this).append($('<option></option>')
				.attr('value',TimeRange[x]*1000)
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
	App.prepareUI();
	App.prepareDb();
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
		},props);
	});
	
	// setup the years this thing has been going on
	var dateStart = new Date(2007,02,02);
	var now = new Date;
	var years = Math.floor((now.getTime()-dateStart.getTime())/(1000*60*60*24*356));
	$('.years').html(years);
};

$(document).ready(function() {	
	App.main();
});