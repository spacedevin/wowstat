var lang, locale;

var strings = {
	enus: {
		region: 'Region',
		realm: 'Realm',
		'realm-up': 'When realm comes up',
		'realm-down': 'When realm goes down',
		'action-nothing': 'Do nothing',
		'action-notify': 'Notify me',
		'action-launch': 'Launch WoW',
		path: 'Path to WoW',
		browse: 'Browse',
		startup: 'Launch WoW Stat when your computer starts',
		settings: 'Settings',
		enabled: 'Enabled',
		quit: 'Quit',
		help: 'Help',
		launch: 'Launch WoW',
		realms: {
			us: 'US, Oceania, Latin America & Brazil',
			eu: 'Europe & Russia',
			cn: 'China',
			tw: 'Taiwan',
			kr: 'Korea'
		}
	},
	zhcn: {
		region: '地区',
		realm: '领域',
		'realm-up': '当境界上来',
		'realm-down': '当境界下降',
		'action-nothing': '无动作',
		'action-notify': '通知',
		'action-launch': '发射',
		path: '路径',
		browse: '浏览',
		startup: '启动您的计算机启动时',
		settings: '设置',
		enabled: '启用',
		quit: '放弃',
		help: '帮帮我',
		launch: '启动WoW',
		realms: {
			us: '美国，大洋洲，拉丁美洲和巴西',
			eu: '欧洲及俄罗斯',
			cn: '中国',
			tw: '台湾',
			kr: '韩国'
		}
	},
	fr: {
		region: 'Région',
		realm: 'Royaume',
		'realm-up': 'Lorsqu\'un serveur devient accessible ',
		'realm-down': 'Lorsqu\'un serveur devient inaccessible ',
		'action-nothing': 'Ne rien faire',
		'action-notify': 'M\'avertir',
		'action-launch': 'Lancer WoW',
		path: 'Chemin de WoW',
		browse: 'Parcourir',
		startup: 'Lancer WoW Stat au démarrage de l\'ordinateur',
		settings: 'Paramètres',
		enabled: 'Activé',
		quit: 'Quitter',
		help: 'Aide',
		launch: 'Lancer WoW',
		realms: {
			us: 'États-Unis, Océanie, Amérique latine et Brésil',
			eu: 'Europe et Russie',
			cn: 'Chine',
			tw: 'Taïwan',
			kr: 'Corée'
		}
	}
}

exports.setLocale = (loc) => {
	locale = loc;
	lang = (locale.substr(0,2) + locale.substr(-2)).toLowerCase();
	console.log('Locale: ' + loc + ' | Lang: ' + lang);
	return strings[lang] || strings['enus'];
};

exports.setLocale('en_US');
