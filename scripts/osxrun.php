<?php

echo "Running for OSX...\n";

passthru('open '.$this->get('current_path').'/build/osx/'.escapeshellarg($this->get('app_name')).'.app');