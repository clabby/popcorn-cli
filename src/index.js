#!/usr/bin/env node

var inquirer = require('inquirer');
var chalk = require('chalk');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');

function log (value) {
  console.log(chalk.magenta('POPCORN ➜ ') + chalk.cyan(value));
}

function logError (value) {
  console.log(chalk.red(value));
}

var apiUrls = {
  movies: 'https://movies-v2.api-fetch.website',
  tv: 'https://tv-v2.api-fetch.website',
  anime: 'https://anime.api-fetch.website'
};

inquirer.prompt({
  type: 'list',
  name: 'mediaType',
  message: 'What type of media would you like to search?',
  choices: [
    'Movies',
    'TV',
    'Anime'
  ]
}).then(function (answer) {
  var mediaType = answer.mediaType.toLowerCase();

  inquirer.prompt({
    type: 'input',
    name: 'input',
    message: 'Enter a search query for media type \"' + chalk.cyan(answer.mediaType) + '\"',
    validate: function (value) {
      return value.length >= 3 ? true : 'Please enter a valid query (3 chars minimum)';
    }
  }).then(function (searchQuery) {
    var query = searchQuery.input;

    switch (mediaType) {
      case 'movies':
        promptMovies(query);
        break;
      case 'tv':
        promptTV(query);
        break;
      case 'anime':
        promptAnime(query);
        break;
      default:
        logError('How\'d you get here?');
        break;
    }
  });
});

function promptMovies (query) {
  request({
    url: apiUrls.movies + '/movies/1?keywords=' + encodeURIComponent(query)
  }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      return logError('Error executing search query.');
    }

    if (JSON.parse(body).length < 1) {
      return logError('No results; Program exiting.');
    }

    var choicesMap = {};
    var choices = _.map(JSON.parse(body), function (media) {
      var fullTitle = media.title + ' (' + media.year + ')';
      choicesMap[fullTitle] = media;
      return fullTitle;
    });

    inquirer.prompt({
      type: 'list',
      name: 'media',
      message: 'Choose the title of the movie you are looking for.',
      choices: choices
    }).then(function (title) {
      var torrents = choicesMap[title.media].torrents;

      choices = [];
      choicesMap = {};
      _.each(_.keys(torrents), function (torrentCategory) {
        _.each(_.keys(torrents[torrentCategory]), function (torrentKey) {
          var slug = (torrents[torrentCategory][torrentKey].url.startsWith('magnet:') ? chalk.red('MAGNET ') : '') + torrentKey + ' (' + chalk.green(torrentCategory) + ') - ' + torrents[torrentCategory][torrentKey].filesize;
          choicesMap[slug] = torrents[torrentCategory][torrentKey].url;
          choices.push(slug);
        });
      });

      inquirer.prompt({
        type: 'list',
        name: 'torrent',
        message: 'Select your torrent for ' + chalk.cyan(title.media),
        choices: choices
      }).then(function (torrent) {
        log('Torrent URL: ' + chalk.yellow(choicesMap[torrent.torrent]));
      });
    });
  });
}

function promptTV (query) {
  request({
    url: apiUrls.tv + '/shows/1?keywords=' + encodeURIComponent(query)
  }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      return logError('Error executing search query.');
    }

    if (JSON.parse(body).length < 1) {
      return logError('No results; Program exiting.');
    }

    var choicesMap = {};
    var choices = _.map(JSON.parse(body), function (media) {
      var slug = media.title + ' (' + media.year + ')';
      choicesMap[slug] = media;
      return slug;
    });

    var media = {
      type: 'list',
      name: 'media',
      message: 'Choose the title of the tv show you are looking for.',
      choices: choices
    };

    inquirer.prompt(media).then(function (title) {
      var mediaId = choicesMap[title.media]._id;

      request({
        url: apiUrls.tv + '/show/' + mediaId
      }, function (error, response, body) {
        if (error && response.statusCode !== 200) {
          return logError('Error finding tv show with ID \"' + mediaId + '\".');
        }

        choicesMap = {};
        choices = _.map(JSON.parse(body).episodes, function (episode) {
          var slug = episode.title + ' - Season ' + episode.season + ' Episode ' + episode.episode;
          choicesMap[slug] = episode.torrents;
          return slug;
        });

        inquirer.prompt({
          type: 'list',
          name: 'episode',
          message: 'Choose an episode',
          choices: choices
        }).then(function (episode) {
          var torrents = choicesMap[episode.episode];
          choicesMap = {};
          choices = _.map(_.keys(torrents), function (torrentCategory) {
            var torrent = torrents[torrentCategory];
            var slug = (torrent.url.startsWith('magnet:') ? chalk.red('MAGNET ') : '') + torrent.provider + ' - (' + chalk.green(torrentCategory === '0' ? 'DEFAULT' : torrentCategory) + ')';
            choicesMap[slug] = torrent.url;
            return slug;
          });

          inquirer.prompt({
            type: 'list',
            name: 'torrent',
            message: 'Select your torrent for ' + chalk.cyan(title.media),
            choices: choices
          }).then(function (torrent) {
            log('Torrent URL: ' + chalk.yellow(choicesMap[torrent.torrent]));
          });
        });
      });
    });
  });
}

function promptAnime (query) {
  request({
    url: apiUrls.anime + '/animes/1?keywords=' + encodeURIComponent(query)
  }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      return logError('Error executing search query.');
    }

    if (JSON.parse(body).length < 1) {
      return logError('No results; Program exiting.');
    }

    var choicesMap = {};
    var choices = _.map(JSON.parse(body), function (media) {
      var slug = media.title + ' (' + media.year + ')';
      choicesMap[slug] = media;
      return slug;
    });

    var media = {
      type: 'list',
      name: 'media',
      message: 'Choose the title of the anime you are looking for.',
      choices: choices
    };

    inquirer.prompt(media).then(function (title) {
      var mediaId = choicesMap[title.media]._id;

      request({
        url: apiUrls.tv + '/anime/' + mediaId
      }, function (error, response, body) {
        if (error && response.statusCode !== 200) {
          return logError('Error finding anime with ID \"' + mediaId + '\".');
        }

        choicesMap = {};
        choices = _.map(JSON.parse(body).episodes, function (episode) {
          var slug = episode.title + ' - Season ' + episode.season + ' Episode ' + episode.episode;
          choicesMap[slug] = episode.torrents;
          return slug;
        });

        inquirer.prompt({
          type: 'list',
          name: 'episode',
          message: 'Choose an episode',
          choices: choices
        }).then(function (episode) {
          var torrents = choicesMap[episode.episode];
          choicesMap = {};
          choices = _.map(_.keys(torrents), function (torrentCategory) {
            var torrent = torrents[torrentCategory];
            var slug = (torrent.url.startsWith('magnet:') ? chalk.red('MAGNET ') : '') + torrent.provider + ' - (' + chalk.green(torrentCategory === '0' ? 'DEFAULT' : torrentCategory) + ')';
            choicesMap[slug] = torrent.url;
            return slug;
          });

          inquirer.prompt({
            type: 'list',
            name: 'torrent',
            message: 'Select your torrent for ' + chalk.cyan(title.media),
            choices: choices
          }).then(function (torrent) {
            log('Torrent URL: ' + chalk.yellow(choicesMap[torrent.torrent]));
          });
        });
      });
    });
  });
}
