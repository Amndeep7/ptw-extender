![PTW Extender Icon](icons/icon.svg "PTW Extender Icon")

# PTW Extender

| Add-on/Extension Repository/Store |
| --- |
| [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ptw-extender/) |
| [Chrome](https://chrome.google.com/webstore/detail/ptw-extender/cbllkljhggikogmnnfiihcbgenkmjanh)

---

A WebExtension that makes adding titles to one's MyAnimeList or AniList plan-to-watch list easier by automating the process: all you have to do is select the extension from the context menu list when you right-click a link to one of the list sites.  Moreover, it adds the current datetime and the URL of the tab you found the link into the comments section for that title's list entry so that you can refer back to why you added it to the list in the first place.

### MAL
As of the writing of this README, MAL doesn't have an external API so the extension is forced to take you to the edit details page for that title where it changes settings as appropriate (status to ptw if it wasn't already completed, comments with the URL added, etc.).  By default it just leaves you there, but if you select the appropriate options in the options page, it'll automatically submit the changes and even close the tab.  NOTE: You need to already be logged into MAL in order for this extension to work since, as of the writing of this README, there is no way to access and modify a user's data without the add-on storing your MAL credentials (i.e. your username and password in plain-text) due to the aforementioned lack of API.

### AniList
AniList DOES have an external API, so the extension just makes the appropriate requests to (if necessary) add it to your list and change the appropriate settings (ex. having the title be private to just the authenticated user).

## Why?
My problem is that I'd keep finding gifs or pics or watch-this posts or nostalgia threads or ... of anime and manga that'd make me want to add them to my ptw list; however, I'd either put it on there without putting up a source, which would eventually result in me wondering why that show was on there in the first place, or I would just save the source without going to the bother of adding it to the list.  All in all, this resulted in a mildly frustrating experience when trying to keep track of WHICH title I wanted to consume and WHY I wanted to do so.

![The Problem](the_problem.png "The Problem")

Having gotten tired of this, I decided to make an extension that would automate the process sufficiently enough that it'd be easy to go through that process, resulting in sourced anime and manga being added to my plan-to-watch list... where they'll stay and rot forever. 

![The Solution](the_solution.gif "The Solution")

---

### System dev-dependencies
  * Inkscape - Cmdline tool to convert icon.svg into a set of resized PNG files
  * Node/npm - Javascript package manager
  * Unix-like operating system - The build script at least assumes you got bash

### Build process
Run `build` to install dependencies locally, move over libraries, and generate the icons.

Run the respective utility from each browser to generate the actual extension package that gets uploaded though you're gonna wanna go over the resultant package to make sure that files that shouldn't be in there are removed.
