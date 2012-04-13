var Ti = Titanium;
var App = {
	mainWindow: Ti.UI.getMainWindow(),
	prefs: [],
	serverStatus: true
};
var MainWindowParams = {
	width: 1100,
	height: 300,
	resizable: false,
	maximizable: false
};
var Defaults = {
	server: null,
	'check-up': 5000,
	'check-down': 500,
	'notify-action': 'notify',
	'startup-load': true,
	'startup-check': true,
	serial: null
}
var TimeRange = [.25,.5,1,1.5,2,3,4,5,6,7,8,9,10,15,20,30];
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
	App.db.close();
	App.db = false;
	App.loadPrefs();
}

// connect to the database
App.dbConnect = function() {
	App.db = Ti.Database.open('wowstat');
}

// start or restart timers
App.timers = function() {
	if (App.timer) {
		clearTimeout(App.timer);
	}
	App.timer = setTimeout(App.check,App.prefs[App.serverStatus ? 'check-up' : 'check-down']);
}

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
}

// notify the user by their prefered action
App.notifyAction = function(status) {
	var realm = App.realm(App.prefs['server']);
	if (status) {
		App.notify(realm.name + 'is up!', realm.name + ' is back up! Click here to launch WoW.');
	} else {
		App.notify(realm.name + 'is down!', realm.name + ' has gone down. You will be notified again when it is back up.');
	}
}

// get the realms info. only needed when a status changes
App.realm = function(realm) {
	for (x in App.realms) {
		if (App.realms[x].slug == realm) {
			return App.realms[x]; 
		}
	}
	return null;
}

// read the prefs from dom and store them
App.readPrefs = function() {
	var prefs = {};
	$('select, input:radio:checked').each(function() {
		prefs[$(this).attr('name')] = $(this).val();
	});
	$('input:checkbox').each(function(){
		prefs[$(this).attr('name')] = $(this).attr('checked') ? true : false;
	});
	App.preferences(prefs);
}

// load the prefs to the form
App.loadPrefs = function() {
		console.log(App.prefs);
	$('select, input:radio:checked, input:checkbox').each(function() {
		$(this).val(App.prefs[$(this).attr('name')]);
	});
	$('input:checkbox').each(function(){
		return;
		console.log($(this).attr('name'), App.prefs[$(this).attr('name')]);
		$(this).checked(App.prefs[$(this).attr('name')]);
	});
}


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
		App.timers();
		
	} else if (!App.prefs) {

	}
	
}

// throw a notification
App.notify = function(title, message) {
	var notice = Ti.Notification.createNotification();
	notice.setTitle(title);
	notice.setMessage(message);
	notice.setTimeout(1000);
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

App.prepareUI = function() {
	$('select[name="check-up"], select[name="check-down"]').each(function() {
		for (x in TimeRange) {
			$(this).append($('<option></option>')
				.attr('value',TimeRange[x]*1000)
				.text(TimeRange[x] + ' seconds')); 
		}
	});
	
}

$(document).ready(function() {
	App.initWindow();
	App.prepareUI();
	App.prepareDb();
	App.getRealms();
	//App.notify('title','message');
	
	$('select, input').change(App.readPrefs);
});