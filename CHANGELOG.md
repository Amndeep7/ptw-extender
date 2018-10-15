## Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [2.2.2] - 2018-10-14
#### Fixed
- User customized settings no longer completely overwrite defaults (which may include options that the user defined settings haven't seen yet)

### [2.2.1] - 2018-10-14
#### Fixed
- Options are now properly set before an attempt is made to access them

### [2.2.0] - 2018-10-14
#### Added
- Support for AniList
	- Doesn't work for Firefox until the fix for the [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1494328) I reported is included in a release, which as of right now is ESR60.3 and release 63 (the latter of which comes out 2018-10-23)
- Support for Kitsu
#### Changed
- The manner in which PTW Extender generates the comments/notes box is now done more securely
- The context menu option and all sorts of documentation now reflect that PTW Extender works with multiple sites and not just MAL
- Options page
  - Shows up on install/update
  - Includes this changelog and an explanation of permissions
  - Now features lots more options
#### Fixed
- MAL notifications now include the title when it's added to your list successfully

### [2.1.1] - 2018-09-12
#### Added
- Current date/time gets printed alongside the url
#### Fixed
- Made it so opening the advanced view would be via a simulated button click instead of messing with CSS

### [2.1.0] - 2018-09-12
#### Added
- Options/settings page (and correspondingly options)
	- Display notifications
	- Prettified comments box (implemented only for MAL thus far)
	- MAL as a list site option
		- Autosubmit
		- Take some action post autosubmit
- Changelog
#### Fixed
- Don't change status to ptw if it's not listed as watching or if any number of episodes/volumes/chapters are listed as watched

### [2.0.2] - 2018-08-17
#### Changed
- Instead of using the runtime.onInstalled listener to generate the context menu, just remove them all every time the background script is run and re-add them.

### [2.0.1] - 2018-08-06
#### Fixed
- Attempted to fix bug where the context menu wasn't showing up

### [2.0.0] - 2018-08-06
#### Added
- Notifications
#### Changed
- Most nearly everything: separated code into different files and functions, rewrote a lot of code to use promises, etc.

### [1.2.1] - 2018-07-22
#### Fixed
- Build file should only create `lib` directory if it doesn't already exist

### [1.2.0] - 2018-07-22
#### Added
- Support for Chrome
- Started using the [WebExtension `browser` API Polyfill](https://github.com/mozilla/webextension-polyfill)
- Build file to convert from the icon from SVG to variously sized PNGs and move libraries over from the node_modules directory
- Support for manga
#### Changed
- Use IDs in selectors as opposed to tags and other stuff
- Autoreveal the advanced section for MAL extended information screens

### [1.1.0] - 2018-07-04
#### Fixed
- MAL went down and then also changed their urls around, so now PTW Extender is using MAL's new url system

### [1.0.0] - 2017-11-19
#### Added
- Basic functionality, i.e. bring up the MAL page for the show and add the url to the comment section for it while making adding the show to your ptw list
