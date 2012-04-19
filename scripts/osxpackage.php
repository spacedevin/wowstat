<?php

echo "Packaging for OSX...\n";

passthru('dmgcanvas '.$this->get('current_path').'/assets/dmg-canvas.dmgCanvas '.$this->get('current_path').'/dist/osx/'.escapeshellarg($this->get('app_name')).'\ '.$this->get('app_version').'.dmg -v '.escapeshellarg($this->get('app_name')));