# Popcorn CLI

Popcorn CLI is a very simple tool that can be used to easily browse Popcorn Time's torrent collection.

**Disclaimer:** I made this in less than an hour because I was sick of sifting through JSON for torrents. Don't expect it to be anything special.

# How to use

Simply clone, install, and run.

Steps:
* `git clone https://github.com/clabby/popcorn-cli`
* `cd popcorn-cli && npm install`
* `npm install -g`
* `popcorn-cli`

# How it Works

Popcorn CLI utilizes [Popcorntime's API](https://github.com/popcorn-official/popcorn-api) to find torrents for Movies, TV Shows, and Anime.

The three providers used in Popcorn CLI are:
* Movies: https://movies-v2.api-fetch.website
* TV: https://tv-v2.api-fetch.website
* Anime: https://anime.api-fetch.website

# License
[MIT](https://github.com/clabby/popcorn-cli/blob/master/LICENSE).
