<!-- markdownlint-disable-next-line first-line-heading -->
![PTW Extender Icon](icons/icon.svg "PTW Extender Icon")

# PTW Extender

| Add-on/Extension Repository/Store |
| --- |
| [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ptw-extender/) |
| [Chrome](https://chrome.google.com/webstore/detail/ptw-extender/cbllkljhggikogmnnfiihcbgenkmjanh)

---

A WebExtension that makes adding titles to one's MyAnimeList, AniList, or Kitsu
plan-to-watch (or read!) list easier by automating the process: all you have to
do is select the extension from the context menu list when you right-click a
link to one of the list sites.  Moreover, it adds the current datetime and the
URL of the tab you found the link on into the comments section for that title's
list entry so that you can refer back to why you added it to your list in the
first place.

## Why?

My problem is that I'd keep finding gifs or pics or watch-this posts or
nostalgia threads or random recommendations or ... of anime and manga
that'd make me want to add them to my ptw or ptr lists; however, I'd either put
it on there without putting up a source, which would eventually result in me
wondering why that title was on there in the first place, or I would just save
the source without bothering to add it to the appropriate list.  All in all,
this resulted in a mildly frustrating experience when trying to keep track of
WHICH titles I wanted to enjoy and WHY I wanted to do so.

![The Problem](the_problem.png "The Problem")

Having gotten tired of this, I decided to make an extension that would automate
the process enough that it'd be easy to add sourced anime or manga to my ptw or
ptr list... where they'll stay and rot forever.

![The Solution](the_solution.gif "The Solution")

---

## Building the extension

### System dev-dependencies

* Inkscape - Cmdline tool to convert icon.svg into a set of resized PNG files
* Node/npm - Javascript package manager
* Unix-like operating system - The build script at least assumes you got bash
* web-ext - Mozilla's script for "compiling" extensions

### Build process

Run `build` to install dependencies locally, move over libraries,
generate the icons, and "compile" this readme.

Run `web-ext build` to generate the extension artifact.  It's just a zip file,
but before uploading it anywhere, you can get rid of the `pictures` directory
if you want since that'll just bloat the artifact with stuff that's useless for
the end-user.

---

## Permissions Explanation

A detailed explanation for why PTW Extender asks for these permissions.

### `https://myanimelist.net/*`

As of the time of writing, MAL doesn't have an API, so in order to access,
scrape, and modify the add/edit page, PTW Extender need permissions to view it.

<!-- markdownlint-disable-next-line line-length-->
### `https://anilist.co/*` | `https://kitsu.io/*` | `https://myanimelist.net/ownlist/*`

In order to have the prettified comments box show up,
PTW Extender needs permission to create and display it on those pages.

### activeTab

In order to use the search capabilities, PTW Extender pops up a modal that
confirms if the title it found was the one you wanted.  In order to create that
modal, it needs permissions for the tab you're currently on, i.e. the active tab.

### contextMenus

The way the extension is used is to right-click a link and then select
PTW Extender's context menu button in order to add a title to your PTW list.

### identity

In order to log into a site securely, PTW Extender needs to follow the OAuth flow,
which starts with a window popping up asking for your credentials to the given site,
but in order to make that window pop up, PTW Extender needs to call a function
defined in this API.

### notifications

To inform you of the success or failure of adding a given title to your list.

### storage

Need access to storage in order to save your settings for PTW Extender.
It also stores your access tokens for the list sites so you aren't forced to log
in every time you restart the browser.

### tabs

Need access to grab the url of the current page you're on in order to add it to
the comments block of whatever title you're adding to your PTW list.

### webNavigation

If you're using MAL and have tweaked the appropriate options, you can first and
foremost autosubmit the changes PTW Extender makes to that entry, and then also
tell it to take certain actions post autosubmit.  However, in order to know when
the submission process has completed requires knowing when the page has finished
redirecting to MAL's "you've updated the entry" page, which is where this
permission comes in.
