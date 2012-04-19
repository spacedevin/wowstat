<?php

echo "Packaging for Win32...\n";

$cmds = [
	'rmdir /S /Q "'.$this->get('current_path').'\build\win32"',
	'mkdir "'.$this->get('current_path').'\build\win32"',
	'"'.$this->get('python_path').'" "'.$this->get('ti_build').'" -t '.$this->get('build_type').' -v -o win32 -a "'.$this->get('ti_dir').'" -d "'.$this->get('current_path').'\build\win32" "'.$this->get('project_root').'"',
];
foreach ($cmds as $cmd) {
	echo $cmd."\n";
	passthru($cmd);
}