

// Situation: You have to get a download url from a service like s3
// once the response comes back with the url you need to use
// window.open to initiate the download.
//
// Problem 1: window.open creates an orphaned window/tab on some browsers
//
// Problem 2: Because of the async process to get the url window.open
// is called from the main event loop not a direct user action,
// thus a popup blocker is initiated
//
// Problem 3: I need to download many files at once with one click
//
// Solution: immediately open a hidden iFrame window with no url
// once the async response to fetch the download url returns
// we can call window.open on this remoteWindow with our download url
// this call magically retains user level privileges, hence no popup blocker.
// This works for any number of files at the same time just create a new instance for each.

/**
 * @returns {{download: function(href), cleanup: function}}
 *
 * 1) get new dl instance, asyncDl = asyncDownloader()
 * 2) in some async callback asyncDl.download(href)
 * 3) no matter what happens call asyncDl.cleanup()
 */
module.exports = function() {

	var id = guid(),
		iFrame, remoteWindow;

	// when is it safe to call cleanup or how long will we wait for downloads to
	// initiate after the url is set. aka expected max network and service latency
	// no good way to do error handling on this so we set it fairly high;
	var cleanupDelay = 10000;

	function pollToSetRemoteWindowHasLoaded() {
		if (remoteWindow) {
			console.log("LOADED");
			remoteWindow.hasLoaded = true;
		} else {
			console.log("RETRY LOAD");
			setTimeout(pollToSetRemoteWindowHasLoaded, 1000);
		}
	}

	iFrame = document.createElement('iframe');
	iFrame.setAttribute('name', "hidden_" + id);
	iFrame.setAttribute('width', 0);
	iFrame.setAttribute('height', 0);

	// once loaded will poll for remoteWindow object
	// once remoteWindow object exists will set a global hasLoaded flag on remote window
	iFrame.load = function() {setTimeout(pollToSetRemoteWindowHasLoaded, 1000)};
	document.body.appendChild(iFrame);

	// open a blank window on our hidden iFrame while we wait for the async request to get the url
	// this will not trigger the onLoad callback
	remoteWindow = window.open("", "hidden_" + id);

	return {
		download: href => {
			console.log(remoteWindow, href);
			remoteWindow.location.href = href;
		},
		cleanup: function cleanup() {
			setTimeout(function() {
				console.log("cleanup");
				document.body.removeChild(iFrame);
				remoteWindow.onload = iFrame = null;
				remoteWindow = null;
			}, cleanupDelay);
		}
	}
};

var count = 1;
function guid() {
	return (count++) + "-" + Math.floor(Math.random()*10000000000);
}
