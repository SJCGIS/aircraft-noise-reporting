/*global define */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/*
 | Copyright 2013 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
//============================================================================================================================//
define([
    "dojo/_base/declare",
    "dojo/string",
    "dojo/Deferred",
    "esri/request"
], function (declare, string, Deferred, esriRequest) {

    //========================================================================================================================//
    var _instance, CommonShare;

    CommonShare = declare("js.CommonShare", null, {
        /**
         * Create the tiny url
         * @param {string} urlStr is url to shrink
         * @param {string} tinyURLServiceURL is Bitly service
         */
        getTinyLink: function (urlStr, tinyURLServiceURL) {
            var encodedUri, shareUrl, deferred;

            deferred = new Deferred();
            // Attempt the shrinking of the URL
            try {
                encodedUri = encodeURIComponent(urlStr);
                shareUrl = string.substitute(tinyURLServiceURL, [encodedUri]);
                // send esri request to generate bitly url
                esriRequest({
                    url: shareUrl
                }, {
                    useProxy: true
                }).then(function (response) {
                    if (response.data && response.data.url) {
                        deferred.resolve(response.data.url);
                    } else {
                        deferred.resolve(urlStr);
                    }
                }, function (error) {
                    deferred.resolve(urlStr);
                });
            } catch (ex) {
                deferred.resolve(urlStr);
            }
            return deferred;
        },


        /**
         * share application detail with selected share option
         * @param {Deferred} waitForUrl is deferred for shrinking url to share
         * @param {object} mapSharingOptions sharing site urls
         * @param {string} site Selected share option
         */
        share: function (waitForUrl, mapSharingOptions, site) {
            waitForUrl.then(function (urlToShare) {
                var encodedUri = encodeURIComponent(urlToShare);
                switch (site) {
                case "facebook":
                    window.open(string.substitute(mapSharingOptions.FacebookShareURL, [encodedUri]));
                    break;
                case "twitter":
                    window.open(string.substitute(mapSharingOptions.TwitterShareURL, [encodedUri]));
                    break;
                case "email":
                    parent.location = string.substitute(mapSharingOptions.ShareByMailLink, [encodedUri]);
                    break;
                }
            });
        }

    });
    // create singleton if it doesn't already exist
    if (!_instance) {
        _instance = new CommonShare();
    }
    return _instance;

});