<?php

/**
 * Configure the tiapp.xml with the our build params
 *
 */


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

if ($this->args->flags['debug']) {
	print_r($this->params);
}

file_put_contents($file, $xml);
