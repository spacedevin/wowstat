<?php

echo $this->get('BUILD_TYPE');


$cmds = [
	'rm -Rf '.$this->get('current_path').'/build/osx/',
	'mkdir -p '.$this->get('current_path').'/build/osx/',
	'bash -c "'.$this->get('ti_build').' -t '.$this->get('build_type').' -n -d '.$this->get('current_path').'/build/osx/ '.$this->get('project_root').'"',
//	'rm -Rf '.$this->get('current_path').'build/osx/'.$this->get('app_name').'.app/Contents/Resources/English.lproj/MainMenu.nib',
//	'cp -R '.$this->get('current_path').'assets/MainMenu.nib '.$this->get('current_path').'build/osx/'.$this->get('app_name').'.app/Contents/Resources/English.lproj/MainMenu.nib'
];



foreach ($cmds as $cmd) {
	echo $cmd."\n";
	passthru($cmd);
}



