# asyncDdownloader
Download from async process without popups

## Situation
You have to get a download url from a service like s3
once the response comes back with the url you need to use
window.open to initiate the download. 

## Problem 1 
window.open creates an orphaned window/tab on some browsers

## Problem 2 
Because of the async process to get the url window.open
is called from the main event loop not a direct user action,
thus a popup blocker is initiated

## Problem 3
I need to download many files at once with one click

## Solution
Immediately open a hidden iFrame window with no url
once the async response to fetch the download url returns
we can call window.open on this remoteWindow with our download url
this call magically retains user level privileges, hence no popup blocker.
This works for any number of files at the same time just create a new instance for each.

## Usage

* 1) get a new downloader instance ```var asyncDl = asyncDownloader();```
* 2) in some async callback call download with your href```asyncDl.download(href);```
* 3) no matter what happens call cleanup ```asyncDl.cleanup();``1
