## Permissions Explanation
A detailed explanation for why PTW Extender asks for these permissions.

### https://myanimelist.net/*
As of the time of writing, MAL doesn't have an API, so in order to access, scrape, and modify the add/edit page, PTW Extender need permissions to view it.

### contextMenus
The way the extension is used is to right-click a link and then select PTW Extender's context menu button in order to add a title to your PTW list.

### identity
In order to log into a site securely, PTW Extender needs to follow the OAuth flow, which starts with a window popping up asking for your credentials to AniList, but in order to make that window pop up, PTW Extender needs to call a function defined here.

### notifications
This is less relevant for the default settings for MAL since you have to manually click submit and can see if the update went through or not, but if you tweak the options or use an AniList or Kitsu link, then you don't get that visual confirmation, so notifications come in to fill that gap.  If you don't like them, they can be turned off in the options.

### storage
Need access to storage in order to save your settings for PTW Extender.  It also stores your accessToken for AniList and Kitsu so you aren't forced to log in every time you restart the browser.

### tabs
Need access to grab the url of the current page you're on in order to add it to the comments block of whatever title you're adding to your PTW list.  Moreover, it's necessary in order to open the add/edit pages for titles in MAL (see above).

### webNavigation
If you're using MAL and have tweaked the appropriate options, you can first and foremost autosubmit the changes PTW Extender makes to that entry, and then also tell it to take certain actions post autosubmit.  However, in order to know when the submission process has completed requires knowing when the page has finished redirecting to MAL's "you've updated the entry" page, which is where this permission comes in.
