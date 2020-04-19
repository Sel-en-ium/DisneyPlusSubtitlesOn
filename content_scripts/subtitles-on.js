(function () {
    'use strict';

    var PLUGIN_NAME = "DisneyPlus-Subtitles-On-Plugin";

    var subsHaveBeenSet = false;

    browser.storage.sync.get().then(function (data) {
        run(data);

        // Listen for pushState url changes
        var pushStateOriginal = history.pushState;
        function pushStateWrapper (state) {
            run(data);
            return pushStateOriginal.apply(history, arguments);
        }
        exportFunction(
            pushStateWrapper,
            window.history,
            {defineAs: 'pushState', allowCallbacks: true}
        );

        function run (data) {
            trySubtitles(data.subtitle_language);
        }

    }, onError);  
    
    /**
     * Attempts to start the subtitles.
     * @param {string} lang - A regex string to match to subtitle name
     */
    function trySubtitles (lang) {
        // Bail if no lang, or if subs have already been set
        if (!lang || lang === '' || subsHaveBeenSet) {
            return;
        }
        waitUntil(function () { 
            // Only proceed if we are on a video page, and we have not set the subtitles
            return window.location.href.match(/\/video\//i);
        }, function () {
            turnOnSubtitles(lang);
        }, 3100);
    }

    function turnOnSubtitles (lang) { 
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
                subsHaveBeenSet = true;
                // And exit menu
                setTimeout(() => {
                    document.querySelector('.audio-subtitles-back').click();
                }, 1000);
            }, 7000);
        }, 15000);
    }

    function waitUntil (conditionFn, callback, tryForSeconds) {
        tryForSeconds = tryForSeconds || 0;
        if (tryForSeconds <= 0) {
            return;
        }
        if (conditionFn()) {
            return callback();
        }
        setTimeout(function () {
            waitUntil(conditionFn, callback, tryForSeconds - 300);
        }, 500);
    }

    function onError (error) {
        console.error('[' + PLUGIN_NAME + '] Error: ' + error);
    }

}());