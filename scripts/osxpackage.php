<?php

echo "Packaging for OSX...\n";

passthru('dmgcanvas '.$this->get('current_path').'/assets/dmg-canvas.dmgCanvas '.$this->get('current_path').'/dist/osx/'.$this->get('app_name').'\ '.$this->get('app_version').'.dmg -v WoW\ Stat');