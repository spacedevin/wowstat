<?php

/**
 * Configure the tiapp.xml with the our build params
 *
 */


if ($this->args->flags['debug']) {
	print_r($this->params);
}

$file = $this->get('project_root'). '/tiapp.xml';
$xml = file($file);
$replace = [
	'sdk-version' => 'TI_SDK_VERSION',
	'version' => 'APP_VERSION',
	'icon' => 'APP_ICON'
];

foreach ($xml as $num => $line) {
	foreach ($replace as $key => $item) {
		if (preg_match('/\<'.$key.'\>(.*)?\<\/'.$key.'\>/',$line)) {
			$xml[$num] = preg_replace('/\<'.$key.'\>(.*)?\<\/'.$key.'\>/','<'.$key.'>'.$this->get($item).'</'.$key.'>',$line);
		}
	}
}

file_put_contents($file, $xml);



$file = $this->get('current_path').'/assets/windows-nsis-setup.nsi';
$cfg = file($file);

$find = [
	'/(define VERSION ")(.*?)(")/i',
	'/(define DOT_MAJOR ")(.*?)(")/i',
	'/(define DOT_MINOR ")(.*?)(")/i',
	'/(define DOT_MINOR_MINOR ")(.*?)(")/i',
	'/GHETTO/',
];

$v = explode('.',$this->get('app_version'));
$replace = [
	'\\1GHETTO'.$this->get('app_version').'\\3',
	'\\1GHETTO'.$v[0].'\\3',
	'\\1GHETTO'.$v[1].'\\3',
	'\\1GHETTO'.$v[2].'\\3',
	''
];

foreach ($cfg as $num => $line) {
	$cfg[$num] = preg_replace($find,$replace,$line);
}


file_put_contents($file, $cfg);