var Ti = Titanium;
var App = {
	mainWindow: Ti.UI.getMainWindow(),
	prefs: null,
	serverStatus: true
};
var MainWindowParams = {
	width: 400,
	height: 500,
	resizable: false,
	maximizable: false
};

// prepare the db for connectivity
App.prepareDb = function() {
	App.db = Ti.Database.open('wowstat');
	//App.db.execute('DROP TABLE prefs;');
	App.db.execute('CREATE TABLE IF NOT EXISTS prefs(`key` TEXT PRIMARY KEY, `value` TEXT);');
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
	if (!App.prefs[server]) return;
	App.request('http://us.battle.net/api/wow/realm/status?realm=' + App.prefs[server],function(json) {
		var status = json.realms;
		
		if (App.serverStatus != status.status) {
			App.notifyAction(status.status);	
		}
		App.serverStatus = status.status;
	});
}

// notify the user by their prefered action
App.notifyAction = function(status) {
	var realm = App.realm(App.prefs[server]);
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
	
}

// get or set prefs
App.prefs = function() {
	if (arguments[0]) {
		// save prefs
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
		$('#server option').remove();
		for (x in App.realms) {
			$('#server').append($('<option></option>')
				.attr('value',App.realms[x].slug)
				.text(App.realms[x].name)); 
		}
	});
};

$(document).ready(function() {
	App.initWindow();
	App.prepareDb();
	App.getRealms();
	//App.notify('title','message');
	
	$('select, input').change(App.readPrefs);
});