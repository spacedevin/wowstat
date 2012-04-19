#!/usr/bin/php
<?php

/**
 * a php make utility so i dont have to install make on windows anymore
 * if you pass it certain args it will configure your build first
 * 
 * requires php 5.4
 */

register_shutdown_function(function() {
	echo "\n\n";
});

(new Make)->main();


class Make {
	public function __construct() {
		$this->args = new Args;
		$this->params = (object)[];
		$this->set('CURRENT_PATH',dirname(__FILE__));
		$this->set('SCRIPTS_PATH',$this->get('CURRENT_PATH').'/scripts');
		$this->set('INI_PATH',$this->args->args['ini'] ? $this->args->args['ini'] : $this->get('SCRIPTS_PATH').'/globals.ini');
		$this->loadIni($this->get('INI_PATH'));
		$this->parseFlags();
		$this->check();
	}
	
	public function set($key, $var) {
		$this->params->{strtolower($key)} = $var;
	}
	
	public function get($key) {
		return $this->params->{strtolower($key)};
	}
	
	public function replaceVar($var) {
		foreach ($this->params as $key => $value) {
			$var = str_replace('$['.strtoupper($key).']',$value,$var);
		}
		return $var;
	}

	public function parseFlags() {
		foreach ($this->args->flags as $key => $value) {
			switch ($key) {
				case 'v':
				case 'version':				
					$this->set('APP_VERSION', $value);
					break;
				case 't':
				case 'type':
					$this->set('BUILD_TYPE', 'bundle' ? 'bundle' : 'network');
					break;
				case 'sdk':
					$this->set('TI_SDK_VERSION', $value);
					break;
			}
		}
	}
	
	public function loadIni($ini) {
		if (!file_exists($ini)) {
			die($ini.' does not exist!');
		}
		$config = parse_ini_file($ini,true);
		foreach ($config as $key => $var) {
			$this->config[$key] = $var;
		}

		$this->loadVars($config);
	}
	
	public function loadVars($configGroup) {
		foreach ($configGroup as $configKey => $config) {
			foreach ($config as $key => $value) {
				$this->set($key,$this->replaceVar($value));
			}
		}
	}

	public function check() {
		if (phpversion() < 5.4) {
			die("You don't have PHP 5.4 installed. Please upgrade your PHP and try again.\n");
		}
	}

	public function main() {

		if (!count($this->args->args)) {
			switch (PHP_OS) {
				case 'Darwin';
					$this->args->args = ['osx','osxpackage'];
					break;
				case 'WINNT';
					$this->args->args = ['win32','win32package'];
					break;
				default:
					die('nothing to do for '.PHP_OS);
			}
		}

		foreach ($this->args->args as $arg) {
			if (file_exists($this->get('SCRIPTS_PATH').'/'.$arg.'.php')) {
				if (file_exists($this->get('SCRIPTS_PATH').'/'.$arg.'.ini')) {
					$this->loadIni($this->get('SCRIPTS_PATH').'/'.$arg.'.ini');
					include($this->get('SCRIPTS_PATH').'/configure.php');
				}
				include($this->get('SCRIPTS_PATH').'/'.$arg.'.php');
			}
		}
	}
}


class Args {
	public $flags;
	public $args;

	public function __construct() {
		$this->flags = [];
		$this->args  = [];

		$argv = $GLOBALS['argv'];
		array_shift($argv);

		for ($i = 0; $i < count($argv); $i++) {
			$str = $argv[$i];

			// --foo
			if (strlen($str) > 2 && substr($str, 0, 2) == '--') {
				$str = substr($str, 2);
				$parts = explode('=', $str);
				$this->flags[$parts[0]] = true;

				// Does not have an =, so choose the next arg as its value
				if (count($parts) == 1 && isset($argv[$i + 1]) && preg_match('/^--?.+/', $argv[$i + 1]) == 0) {
					$this->flags[$parts[0]] = $argv[$i + 1];
				} elseif (count($parts) == 2) {
					$this->flags[$parts[0]] = $parts[1];
				}
			} elseif (strlen($str) == 2 && $str[0] == '-') {
				$this->flags[$str[1]] = true;
				if (isset($argv[$i + 1]) && preg_match('/^--?.+/', $argv[$i + 1]) == 0)
					$this->flags[$str[1]] = $argv[$i + 1];
			} elseif (strlen($str) > 1 && $str[0] == '-') {
				for ($j = 1; $j < strlen($str); $j++)
					$this->flags[$str[$j]] = true;
			}
		}

		for ($i = count($argv) - 1; $i >= 0; $i--) {
			if (preg_match('/^--?.+/', $argv[$i]) == 0)
				$this->args[] = $argv[$i];
			else
				break;
		}

		$this->args = array_reverse($this->args);
	}

	public function flag($name) {
		return isset($this->flags[$name]) ? $this->flags[$name] : false;
	}
}