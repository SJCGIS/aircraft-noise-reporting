/*
 | Version 10.2
 | Copyright 2012 Esri
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
//Locate address
function LocateAddress() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    activityQueryString = "";
    isContainerVisible = true;
    dojo.byId("imgSearchLoader").style.display = "block";
    if (dojo.byId("tdSearchAddress").className.trim() == "tdSearchByAddress") {
        var address = [];
        dojo.empty(dojo.byId('tblAddressResults'));
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId("imgSearchLoader").style.display = "none";
            if (dojo.byId("txtAddress").value != "") {
                alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);

            }
            return;
        }
        address[locatorSettings.Locators[0].LocatorParamaters[0]] = dojo.byId('txtAddress').value;
        var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
        locator.outSpatialReference = map.spatialReference;
        locator.addressToLocations(address, [locatorSettings.Locators[0].CandidateFields], function (candidates) {
            // Discard searches made obsolete by new typing from user
            if (thisSearchTime < lastSearchTime) {
                return;
            }
            if (dojo.coords("divAddressContent").h > 0) {
                if (isContainerVisible) {
                    ShowLocatedAddress(candidates);
                    dojo.byId("imgSearchLoader").style.display = "none";
                }
            } else {
                dojo.byId("imgSearchLoader").style.display = "none";
                dojo.empty(dojo.byId('tblAddressResults'));
                CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
                return;
            }

        },

        function (err) {
            HideProgressIndicator();
            dojo.byId("imgSearchLoader").style.display = "none";

        });
    } else {
        if (dojo.byId('txtAddress').value.trim() == '') {
            dojo.byId("imgSearchLoader").style.display = "none";
            CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
            if (dojo.byId("txtAddress").value != "") {
                alert(messages.getElementsByTagName("serviceToLocate")[0].childNodes[0].nodeValue);
            }
            return;
        } else {
            if (typeof locatorSettings.Locators[1].LocatorURL == "undefined") {
                LocateServiceRequest();

            }
            else if (locatorSettings.Locators[1].LocatorURL == "") {
                LocateServiceRequest();

            }
            else if (locatorSettings.Locators[1].LocatorURL == operationalLayers.ServiceRequestLayerURL) {
                LocateServiceRequest();

            }
            else {
                LocateFeature();
            }

        }
    }
}

//Populate candidate address list in address container
function ShowLocatedAddress(candidates) {
    dojo.empty(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    if (dojo.byId("txtAddress").value.trim() == '') {
        dojo.byId('txtAddress').focus();
        dojo.empty(dojo.byId('tblAddressResults'));
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        dojo.byId("imgSearchLoader").style.display = "none";
        return;
    }

    if (candidates.length > 0) {
        var table = dojo.byId("tblAddressResults");
        var tBody = document.createElement("tbody");
        table.appendChild(tBody);
        table.cellSpacing = 0;
        table.cellPadding = 0;
        var candidatesLength = 0;
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                    var bmap = baseMapLayers[bMap].Key;
                }
            }
            if ((!map.getLayer(bmap).fullExtent.contains(candidates[i].location)) || (candidate.score < locatorSettings.Locators[0].AddressMatchScore)) {
                candidatesLength++;
            } else {
                for (j in locatorSettings.Locators[0].LocatorFieldValues) {
                    if (locatorSettings.Locators[0].LocatorFieldValues.hasOwnProperty(j)) {
                        if (candidate.attributes[locatorSettings.Locators[0].LocatorFieldName] == locatorSettings.Locators[0].LocatorFieldValues[j]) {
                            var tr = document.createElement("tr");
                            tBody.appendChild(tr);
                            var td1 = document.createElement("td");
                            td1.innerHTML = candidate.address;
                            td1.align = "left";
                            td1.className = 'bottomborder';
                            td1.style.cursor = "pointer";
                            td1.height = 20;
                            td1.setAttribute("x", candidate.location.x);
                            td1.setAttribute("y", candidate.location.y);
                            td1.setAttribute("address", candidate.address);
                            td1.onclick = function () {
                                map.getLayer(highlightPollLayerId).clear();
                                if (!isMobileDevice) {
                                    map.infoWindow.hide();
                                }
                                mapPoint = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                                dojo.byId('txtAddress').setAttribute("defaultAddress", this.innerHTML);
                                dojo.byId("txtAddress").setAttribute("defaultAddressTitle", this.innerHTML);
                                LocateAddressOnMap(mapPoint);

                            }
                            tr.appendChild(td1);
                            candidatesLength++;
                        }
                    }
                }
            }
        }
        if (candidatesLength == 0 || candidatesLength != candidates.length) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.align = "left";
            td1.className = 'bottomborder';
            td1.height = 20;
            td1.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
            dojo.byId("imgSearchLoader").style.display = "none";
            tr.appendChild(td1);
        }
        SetAddressResultsHeight();
    } else {
        ErrorHandlerForRequests();
    }
}


//Locate searched address on map with pushpin graphic
function LocateAddressOnMap(mapPoint) {
    selectedMapPoint = null;
    map.infoWindow.hide();
    ClearGraphics();
    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (map.getLayer(baseMapLayers[bMap].Key).visible) {
            var bmap = baseMapLayers[bMap].Key;
        }
    }
    if (!map.getLayer(bmap).fullExtent.contains(mapPoint)) {
        map.infoWindow.hide();
        selectedMapPoint = null;
        mapPoint = null;
        map.getLayer(tempGraphicsLayerId).clear();
        HideProgressIndicator();
        HideAddressContainer();
        alert(messages.getElementsByTagName("noDataAvlbl")[0].childNodes[0].nodeValue);
        return;
    }
    if (mapPoint) {
        var ext = GetExtent(mapPoint);
        map.setExtent(ext.getExtent().expand(15));
        var graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {
            "Locator": true
        }, null);
        map.getLayer(tempGraphicsLayerId).add(graphic);

    }
    HideAddressContainer();
}

//Get the extent based on the map-point
function GetExtent(point) {
    var xmin = point.x;
    var ymin = (point.y) - 30;
    var xmax = point.x;
    var ymax = point.y;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Locate feature
function LocateFeature() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    mapPoint = null;
    dojo.empty(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    if (dojo.byId("txtAddress").value.trim() == '') {
        dojo.byId('txtAddress').focus();
        return;
    }
    var qTask = new esri.tasks.QueryTask(locatorSettings.Locators[1].LocatorURL);
    var query = new esri.tasks.Query();
    query.where = dojo.string.substitute(locatorSettings.Locators[1].QueryString, [dojo.byId('txtAddress').value.trim()]);
    query.outFields = ["*"];
    query.returnGeometry = true;
    qTask.execute(query, function (featureset) {
        if (thisSearchTime < lastSearchTime) {
            return;
        }
        dojo.empty(dojo.byId('tblAddressResults'));
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId('txtAddress').focus();
            dojo.byId("imgSearchLoader").style.display = "none";
            dojo.empty(dojo.byId('tblAddressResults'));
            RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        if (featureset.features.length > 0) {
            if (featureset.features.length == 1) {
                dojo.byId("txtAddress").blur();
                selectedRequest = featureset.features[0].geometry;
                map.infoWindow.hide();
                dojo.byId("txtAddress").value = dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[0].attributes);
                dojo.byId('txtAddress').setAttribute("defaultRequestName", dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[0].attributes));
                dojo.byId('txtAddress').setAttribute("defaultRequestTitle", dojo.byId('txtAddress').value);
                //LocateAddressOnMap(selectedRequest);
                LocateOnMap(featureset.features[0].attributes);
            } else {
                var table = dojo.byId("tblAddressResults");
                var tBody = document.createElement("tbody");
                table.appendChild(tBody);
                table.cellSpacing = 0;
                table.cellPadding = 0;
                var featureSet = [];
                for (var i = 0; i < featureset.features.length; i++) {
                    featureSet.push({
                        name: dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[i].attributes),
                        geometry: featureset.features[i].geometry,
                        attributes: featureset.features[i].attributes
                    });
                }

                featureSet.sort(function (a, b) {
                    var nameA = a.name.toLowerCase(),
                        nameB = b.name.toLowerCase()
                    if (nameA < nameB) //sort string ascending
                        return -1
                    else return 1
                });

                for (var i = 0; i < featureSet.length; i++) {
                    var tr = document.createElement("tr");
                    tBody.appendChild(tr);
                    var td1 = document.createElement("td");
                    td1.innerHTML = dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureSet[i].attributes);
                    td1.align = "left";
                    td1.className = 'bottomborder';
                    td1.style.cursor = "pointer";
                    td1.height = 20;
                    td1.setAttribute("x", featureSet[i].geometry.x);
                    td1.setAttribute("y", featureSet[i].geometry.y);
                    td1.setAttribute("name", dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureSet[i].attributes));
                    td1.setAttribute("index", i);
                    td1.onclick = function () {
                        map.infoWindow.hide();
                        dojo.byId("txtAddress").value = this.innerHTML;
                        dojo.byId('txtAddress').setAttribute("defaultRequestName", this.innerHTML);
                        dojo.byId('txtAddress').setAttribute("defaultRequestTitle", this.innerHTML);
                        selectedRequest = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                        LocateOnMap(featureSet[this.getAttribute("index")].attributes);

                    }
                    tr.appendChild(td1);
                }
                SetAddressResultsHeight();
            }

        } else {
            ErrorHandlerForRequests();
        }
    }, function (err) {
        ErrorHandlerForRequests();
    });
}

//Locate service request by ID
function LocateServiceRequest() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    mapPoint = null;
    dojo.empty(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    if (dojo.byId("txtAddress").value.trim() == '') {
        dojo.byId('txtAddress').focus();
        return;
    }
    var qTask = new esri.tasks.QueryTask(operationalLayers.ServiceRequestLayerURL);
    var query = new esri.tasks.Query();
    query.where = dojo.string.substitute(locatorSettings.Locators[1].QueryString, [dojo.byId('txtAddress').value.trim()]);
    query.outFields = ["*"];
    query.returnGeometry = true;
    qTask.execute(query, function (featureset) {
        if (thisSearchTime < lastSearchTime) {
            return;
        }
        dojo.empty(dojo.byId('tblAddressResults'));
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId('txtAddress').focus();
            dojo.byId("imgSearchLoader").style.display = "none";
            dojo.empty(dojo.byId('tblAddressResults'));
            RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        if (featureset.features.length > 0) {
            if (featureset.features.length == 1) {
                dojo.byId("txtAddress").blur();
                selectedRequest = featureset.features[0].geometry;
                map.infoWindow.hide();
                dojo.byId("txtAddress").value = dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[0].attributes);
                dojo.byId('txtAddress').setAttribute("defaultRequestName", dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[0].attributes));
                dojo.byId('txtAddress').setAttribute("defaultRequestTitle", dojo.byId('txtAddress').value);
                LocateServiceRequestOnMap(featureset.features[0].attributes);
            } else {
                var table = dojo.byId("tblAddressResults");
                var tBody = document.createElement("tbody");
                table.appendChild(tBody);
                table.cellSpacing = 0;
                table.cellPadding = 0;
                var featureSet = [];
                for (var i = 0; i < featureset.features.length; i++) {
                    featureSet.push({
                        name: dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureset.features[i].attributes),
                        geometry: featureset.features[i].geometry,
                        attributes: featureset.features[i].attributes
                    });
                }

                featureSet.sort(function (a, b) {
                    var nameA = a.name.toLowerCase(),
                        nameB = b.name.toLowerCase()
                    if (nameA < nameB) //sort string ascending
                        return -1
                    else return 1
                });

                for (var i = 0; i < featureSet.length; i++) {
                    var tr = document.createElement("tr");
                    tBody.appendChild(tr);
                    var td1 = document.createElement("td");
                    td1.innerHTML = dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureSet[i].attributes);
                    td1.align = "left";
                    td1.className = 'bottomborder';
                    td1.style.cursor = "pointer";
                    td1.height = 20;
                    td1.setAttribute("x", featureSet[i].geometry.x);
                    td1.setAttribute("y", featureSet[i].geometry.y);
                    td1.setAttribute("name", dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureSet[i].attributes));
                    td1.setAttribute("index", i);
                    td1.onclick = function () {
                        map.infoWindow.hide();
                        dojo.byId("txtAddress").value = this.innerHTML;
                        dojo.byId('txtAddress').setAttribute("defaultRequestName", this.innerHTML);
                        dojo.byId('txtAddress').setAttribute("defaultRequestTitle", this.innerHTML);
                        selectedRequest = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                        LocateServiceRequestOnMap(featureSet[this.getAttribute("index")].attributes);
                    }
                    tr.appendChild(td1);
                }
                SetAddressResultsHeight();
            }

        } else {
            ErrorHandlerForRequests();
        }
    }, function (err) {
        ErrorHandlerForRequests();
    });
}

function ErrorHandlerForRequests() {
    selectedRequest = null;
    dojo.byId("imgSearchLoader").style.display = "none";
    var table = dojo.byId("tblAddressResults");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;
    var tr = document.createElement("tr");
    tBody.appendChild(tr);
    var td1 = document.createElement("td");
    td1.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;

    td1.align = "left";
    td1.className = 'bottomborder';
    td1.style.cursor = "default";
    td1.height = 20;
    tr.appendChild(td1);
}

function LocateServiceRequestOnMap(attributes) {
    map.getLayer(tempGraphicsLayerId).clear();
    map.getLayer(highlightPollLayerId).clear();
    var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(rippleColor), 4), new dojo.Color([0, 0, 0, 0]));
    AddGraphic(map.getLayer(highlightPollLayerId), symbol, selectedRequest);

    ShowServiceRequestDetails(selectedRequest, attributes);
    if (!isMobileDevice) {
        if (dojo.coords("divAddressContent").h > 0) {
            dojo.replaceClass("divAddressContent", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divAddressContent').style.height = '0px';
        }
    }

    if (isMobileDevice) {
        HideAddressContainer();
    }
}
function LocateOnMap(attributes) {
    map.getLayer(tempGraphicsLayerId).clear();
    map.getLayer(highlightPollLayerId).clear();
    var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(rippleColor), 4), new dojo.Color([0, 0, 0, 0]));
    AddGraphic(map.getLayer(highlightPollLayerId), symbol, selectedRequest);
    var ext = GetExtent(selectedRequest);
    map.setExtent(ext.getExtent().expand(2));

    if (!isMobileDevice) {
        if (dojo.coords("divAddressContent").h > 0) {
            dojo.replaceClass("divAddressContent", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divAddressContent').style.height = '0px';
        }
    }

    if (isMobileDevice) {
        HideAddressContainer();
    }
}
//function to display the current location of the user
function ShowMyLocation() {
    HideBaseMapLayerContainer();
    HideShareAppContainer();
    HideAddressContainer();
    navigator.geolocation.getCurrentPosition(

    function (position) {
        ShowProgressIndicator();
        mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({
            wkid: 4326
        }));
        var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({
            wkid: 4326
        }));
        graphicCollection.addPoint(mapPoint);
        map.infoWindow.hide();
        geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
            for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                    var bmap = baseMapLayers[bMap].Key;
                }
            }
            if (!map.getLayer(bmap).fullExtent.contains(newPointCollection[0].getPoint(0))) {
                mapPoint = null;
                selectedMapPoint = null;
                map.getLayer(tempGraphicsLayerId).clear();
                map.getLayer(highlightPollLayerId).clear();
                map.infoWindow.hide();
                HideProgressIndicator();
                alert(messages.getElementsByTagName("geoLocation")[0].childNodes[0].nodeValue);
                return;
            }
            mapPoint = newPointCollection[0].getPoint(0);
            var ext = GetExtent(mapPoint);
            map.setExtent(ext.getExtent().expand(15));
            var graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {
                "Locator": true
            }, null);
            map.getLayer(tempGraphicsLayerId).add(graphic);

            HideProgressIndicator();
        });
    },

    function (error) {
        HideProgressIndicator();
        switch (error.code) {
            case error.TIMEOUT:
                alert(messages.getElementsByTagName("geolocationTimeout")[0].childNodes[0].nodeValue);
                break;
            case error.POSITION_UNAVAILABLE:
                alert(messages.getElementsByTagName("geolocationPositionUnavailable")[0].childNodes[0].nodeValue);
                break;
            case error.PERMISSION_DENIED:
                alert(messages.getElementsByTagName("geolocationPermissionDenied")[0].childNodes[0].nodeValue);
                break;
            case error.UNKNOWN_ERROR:
                alert(messages.getElementsByTagName("geolocationUnKnownError")[0].childNodes[0].nodeValue);
                break;
        }
    }, {
        timeout: 10000
    });
}

//Query the features while sharing
function ExecuteQueryTask() {
    ShowProgressIndicator();
    var queryTask = new esri.tasks.QueryTask(operationalLayers.ServiceRequestLayerURL);
    var query = new esri.tasks.Query;
    query.outSpatialReference = map.spatialReference;
    query.where = map.getLayer(serviceRequestLayerId).objectIdField + "=" + featureID;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query, function (fset) {
        if (fset.features.length > 0) {
            ShowServiceRequestDetails(fset.features[0].geometry, fset.features[0].attributes, true);
        }
        HideProgressIndicator();
        map.setExtent(startExtent);
    }, function (err) {
        alert(err.Message);
    });
}
