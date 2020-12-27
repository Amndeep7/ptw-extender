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
