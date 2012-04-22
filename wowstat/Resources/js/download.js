/**
 * Download worker
 * 
 * @author:		The community
 * @date:		2012-04-16
 * 
 */

var httpClient;

this.onmessage = function($event) {

	switch ($event.message.event) {
		case 'start':
			url = $event.message.url;
		
			httpClient = Titanium.Network.createHTTPClient();
			httpClient.xxxWorker = this;
		
			//Check for d/l finished event
			httpClient.onreadystatechange = function(e) {
				if (e.readyState == 4) {
					this.xxxWorker.postMessage(-2);
				}
			};
		
			httpClient.onerror = function(e) {
				this.xxxWorker.postMessage(-1);
			};
		 
			if (httpClient.open('GET', url)) {
				this.postMessage(0);
				var file = Titanium.Filesystem.createTempFile();
				var filePath =  $event.message.dir+$event.message.filename;
				file.copy(filePath);
		
				httpClient.xxxFile = filePath;
		
		
				// Handle the received data (Titanium.Filesystem.File can also be used as a handler)
				httpClient.receive(function(data) {
					var file = Titanium.Filesystem.getFile(this.xxxFile);
					var fileStream = file.open(Titanium.Filesystem.MODE_APPEND);
					fileStream.write(data);
					fileStream.close();
					this.xxxWorker.postMessage(data.length);
				});
			} else {
				this.postMessage(-1);
			}
			
			break;

		case 'abort':
			httpClient.abort();
			break;
		
	}

};