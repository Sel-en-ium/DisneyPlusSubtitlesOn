(function () {
    'use strict';

    var PLUGIN_NAME = "DisneyPlus-Subtitles-On-Plugin";

    browser.storage.sync.get().then(function (data) {
        run(data);

        // // Listen for pushState url changes
        // history.pushState = ( f => function pushState(){
        //     run(data);
        //     return f.apply(this, arguments);
        // })(history.pushState);

        function run (data) {
            turnOnSubtitles(data.subtitle_language);
        }

    }, onError);  
    
    /**
     * Attempts to start the subtitles.
     * @param {string} lang - A regex string to match to subtitle name
     */
    function turnOnSubtitles (lang) {
        // Bail if we are not on a video page or lang is empty
        if (!window.location.href.match(/\/video\//i) || !lang || lang === '') {
            return;
        }

        // Wait until the player element is available, and we have the subtitles controls open
        waitUntil(function () { 
            // Try to get the video controls to appear
            var mediaPlayer = document.querySelector('.btm-media-player'); 
            if (mediaPlayer) {
                mediaPlayer.click();
                // Try to open the audio/subtitle controls
                var subMenuButton = document.querySelector('.audio-subtitles-control > button');
                if (subMenuButton) {
                    subMenuButton.click();
                    return true;
                }
            }
            return false;
        }, function () {
            // After another moment start looking for the matching subtitles
            waitUntil(function () {
                return document.querySelector('#subtitleTrackPicker label');
            }, function () {
                var allSubtitles = document.querySelectorAll('#subtitleTrackPicker label');
                var matchedSubtitles = [];
                for (var i = 0; i < allSubtitles.length; i++) {
                    if (allSubtitles[i].innerText.match(new RegExp(lang, "i"))) {
                        matchedSubtitles.push(allSubtitles[i]);
                    }
                }
                // No matches
                if (matchedSubtitles.length === 0) {
                    var subtitleOptions = '';
                    for (var i = 0; i < allSubtitles.length; i++) {
                        subtitleOptions += allSubtitles[i].innerText + '\n';
                    }
                    onError('Could not find any languages matching "' + lang + '".\nAvailable options:\n' + subtitleOptions);
                    return;
                }
                // Else, select first match
                matchedSubtitles[0].click();
                // And exit menu
                document.querySelector('.audio-subtitles-back').click();
            });
        });
    }

    function waitUntil (conditionFn, callback) {
        if (conditionFn()) {
            return callback();
        }
        setTimeout(function () {
            waitUntil(conditionFn, callback);
        }, 300);
    }

    function onError (error) {
        console.error('[' + PLUGIN_NAME + '] Error: ' + error);
    }

}());