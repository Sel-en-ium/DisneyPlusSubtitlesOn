(function () {
    'use strict;'

    document.addEventListener("DOMContentLoaded", restoreOptions);
    document.querySelector("form").addEventListener("submit", saveOptions);

    function saveOptions(e) {
        e.preventDefault();
        browser.storage.sync.set({
            subtitle_language: document.querySelector("#subtitle-language").value
        });
    }
    
    function restoreOptions() {
        browser.storage.sync.get().then(setCurrentChoice, onError);

        function setCurrentChoice (result) {
            document.querySelector("#subtitle-language").value = result.subtitle_language || '';
        }

        function onError (error) {
            console.error(`Error: ${error}`);
        }

    }

}());