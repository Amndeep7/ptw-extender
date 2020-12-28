# Permissions Explanation

A detailed explanation for why PTW Extender asks for these permissions.

## `https://myanimelist.net/*`

As of the time of writing, MAL doesn't have an API, so in order to access,
scrape, and modify the add/edit page, PTW Extender need permissions to view it.

## `https://anilist.co/*` | `https://kitsu.io/*` | `https://myanimelist.net/ownlist/*`

In order to have the prettified comments box show up,
PTW Extender needs permission to create and display it on those pages.

## activeTab

In order to use the search capabilities, PTW Extender pops up a modal that
confirms if the title it found was the one you wanted. In order to create that
modal, it needs permissions for the tab you're currently on, i.e. the active tab.

## contextMenus

The way the extension is used is to right-click a link and then select
PTW Extender's context menu button in order to add a title to your PTW list.

## identity

In order to log into a site securely, PTW Extender needs to follow the OAuth flow,
which starts with a window popping up asking for your credentials to the given site,
but in order to make that window pop up, PTW Extender needs to call a function
defined in this API.

## notifications

To inform you of the success or failure of adding a given title to your list.

## storage

Need access to storage in order to save your settings for PTW Extender.
It also stores your access tokens for the list sites so you aren't forced to log
in every time you restart the browser.

## tabs

Need access to grab the url of the current page you're on in order to add it to
the comments block of whatever title you're adding to your PTW list.

## webNavigation

If you're using MAL and have tweaked the appropriate options, you can first and
foremost autosubmit the changes PTW Extender makes to that entry, and then also
tell it to take certain actions post autosubmit. However, in order to know when
the submission process has completed requires knowing when the page has finished
redirecting to MAL's "you've updated the entry" page, which is where this
permission comes in.
