/** @license
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
dojo.require("dojo.window");
dojo.require("dojo.date.locale");
dojo.require("dojox.mobile.View");
dojo.require("esri.map");
dojo.require("esri.tasks.geometry");
dojo.require("esri.tasks.locator");
dojo.require("esri.tasks.query");
dojo.require("esri.layers.FeatureLayer");
dojo.require("js.config");
dojo.require("js.date");
dojo.require("js.InfoWindow");

var map; //variable to store map object
var isiOS = false;
var isBrowser = false; //This variable is set to true when the app is running on desktop browsers
var isMobileDevice = false; //This variable is set to true when the app is running on mobile device
var isAndroidDevice = false; //This variable is set to true when the app is running on Android device
var operationalLayers; //variable to store operational layers
var isTablet = false; //This variable is set to true when the app is running on tablets
var baseMapLayers; //Variable for storing base map layers
var showNullValueAs; //variable to store the default value for replacing null values
var mapSharingOptions; //variable for storing the tiny service URL
var geometryService; //variable to store the Geometry service
var serviceRequestLayerId = "serviceRequestLayerID"; //variable to store service request layer id
var highlightPollLayerId = "highlightPollLayerId"; //Graphics layer object for displaying selected service request
var tempGraphicsLayerId = "tempGraphicsLayerID"; //variable to store temporary graphics request layer id
var enablePhotoUploadiOS; //variable for storing uploading images into iOS devices
var photoUploadText; //object to store Message displayed for HTML text
var serviceRequestSymbol; //variable to store service Request Symbol object
var infoWindowContent; //variable used to store the info window content
var infoWindowHeader; //variable used to store the info window header
var infoPopupHeight; //variable used for storing the info window height
var infoPopupWidth; //variable used for storing the info window width
var showCommentsTab; //variable used for toggling the comments tab
var allowAttachments; //variable used for toggling visibility of attachments control
var mapPoint; //variable to store map point
var formatDateAs; //variable to store date format
var selectedMapPoint; // variable to store selected map point
var serviceRequestCommentsLayerId = "serviceRequestCommentsLayerID"; //variable for comment layer
var infoWindowData; //Variable used for Info window collection
var infoWindowDataTitle; //Variable used to store the header text of the pop up


var locatorMarkupSymbol;
var windowURL = window.location.toString();
var selectedRequest;
var rippleColor;
var locatorRippleSize;
var locatorSettings;
var requestType;
var requestId;
var commentId;
var featureID;
var status;
var startExtent;
var lessthanios6 = false;
var lastSearchString; //variable for store the last search string
var stagedSearch; //variable for store the time limit for search
var lastSearchTime; //variable for store the time of last search
var commentsInfoPopupFieldsCollection;
var requestLayerName;
var serviceRequestFields;
var databaseFields;

//This initialization function is called when the DOM elements are ready
function dojoInit() {
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.io.timeout = 180000; // milliseconds
    esri.addProxyRule({
    	proxyUrl: "/proxy/proxy.ashx",
    	urlPrefix: "http://sjcgis.org/arcgis/rest/services/PublicInput"
    });
    
    var userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("iPhone") >= 0 || userAgent.indexOf("iPad") >= 0) {
        isiOS = true;
        userAgent.replace(/OS ((\d+_?){2,3})\s/, function (match, key) {
            var version = key.split('_');
            if (version[0] < 6) {
                lessthanios6 = true;
                dojo.byId('trFileUpload').style.display = "none";
            }
        });
    }

    if ((userAgent.indexOf("Android") >= 0 && userAgent.indexOf("Mobile") >= 0) || userAgent.indexOf("iPhone") >= 0) {
        isMobileDevice = true;
        if ((userAgent.indexOf("Android") >= 0)) {
            isAndroidDevice = true;
        }
        dojo.byId('dynamicStyleSheet').href = "styles/mobile.css";
        dojo.byId('divSplashContent').style.fontSize = "15px";

    } else if ((userAgent.indexOf("iPad") >= 0) || (userAgent.indexOf("Android") >= 0)) {
        isTablet = true;
        dojo.byId('dynamicStyleSheet').href = "styles/tablet.css";
        dojo.byId('divSplashContent').style.fontSize = "14px";
    } else {
        isBrowser = true;
        dojo.byId('dynamicStyleSheet').href = "styles/browser.css";
        dojo.byId('divSplashContent').style.fontSize = "12px";

    }
    if (lessthanios6) {
        if (userAgent.indexOf("iPhone") || userAgent.indexOf("iPad")) {
            var pickupref = document.createElement('script');
            pickupref.setAttribute("type", "text/javascript");
            pickupref.setAttribute("src", "js/picup.js");
            document.getElementsByTagName("head")[0].appendChild(pickupref);
        }

    }
    if (dojo.isIE) {
        dojo.byId('fileUploadControl').style.marginLeft = "-175px";
    }



    dojo.connect(dojo.byId("txtAddress"), 'onkeyup', function (evt) {
        if (evt) {
            if (evt.keyCode == dojo.keys.ENTER) {
                if (dojo.byId("txtAddress").value != '') {
                    dojo.byId("imgSearchLoader").style.display = "block";
                    LocateAddress();
                    return;
                }
            }
            //validations for auto complete search
            if (!((evt.keyCode > 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) {
                evt = (evt) ? evt : event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) evt.stopPropagation();
                return;
            }
            if (dojo.coords("divAddressContent").h > 0) {
                if (dojo.byId("txtAddress").value.trim() != '') {
                    if (lastSearchString != dojo.byId("txtAddress").value.trim()) {
                        lastSearchString = dojo.byId("txtAddress").value.trim();
                        dojo.empty(dojo.byId('tblAddressResults'));

                        // Clear any staged search
                        clearTimeout(stagedSearch);
                        if (dojo.byId("txtAddress").value.trim().length > 0) {
                            // Stage a new search, which will launch if no new searches show up
                            // before the timeout
                            stagedSearch = setTimeout(function () {
                                dojo.byId("imgSearchLoader").style.display = "block";
                                LocateAddress();
                                lastSearchString = dojo.byId("txtAddress").value.trim();
                            }, 500);
                        }
                    }
                } else {
                    lastSearchString = dojo.byId("txtAddress").value.trim();
                    dojo.byId("imgSearchLoader").style.display = "none";
                    dojo.empty(dojo.byId('tblAddressResults'));
                    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
                }
            }
        }
    });

    dojo.connect(dojo.byId("txtAddress"), 'onpaste', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    dojo.connect(dojo.byId("txtAddress"), 'oncut', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });
    if (!Modernizr.geolocation) {
        dojo.byId("tdGeolocation").style.display = "none";
    }
    var responseObject = new js.config();
    dojo.byId("tdSearchAddress").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
    dojo.byId("tdSearchRequest").innerHTML = responseObject.LocatorSettings.Locators[1].DisplayText;

    dojo.byId("txtAddress").setAttribute("defaultAddress", responseObject.LocatorSettings.Locators[0].DefaultValue);
    dojo.byId('txtAddress').value = responseObject.LocatorSettings.Locators[0].DefaultValue;

    lastSearchString = dojo.byId("txtAddress").value.trim();

    dojo.byId("txtAddress").setAttribute("defaultAddressTitle", responseObject.LocatorSettings.Locators[0].DefaultValue);
    dojo.byId("txtAddress").setAttribute("defaultRequestName", responseObject.LocatorSettings.Locators[0].LocatorDefaultRequest);
    dojo.byId("txtAddress").setAttribute("defaultRequestTitle", responseObject.LocatorSettings.Locators[0].LocatorDefaultRequest);

    dojo.connect(dojo.byId('txtAddress'), "ondblclick", ClearDefaultText);
    dojo.connect(dojo.byId('txtAddress'), "onblur", ReplaceDefaultText);
    dojo.connect(dojo.byId('txtAddress'), "onfocus", function () {
        this.style.color = "#FFF";
    });
    dojo.connect(dojo.byId('txtDescription'), "onfocus", function () {
        dojo.byId("divRequestTypes").style.display = "none";
        dojo.byId("divCreateRequestContentscrollbar_handle").style.position = (dojo.byId("divRequestTypes").style.display == "block") ? "static" : "relative";
    });

    dojo.connect(dojo.byId('txtMail'), "onfocus", function () {
        dojo.byId("divRequestTypes").style.display = "none";
    });

    dojo.connect(dojo.byId('fileUploadControl'), "onfocus", function () {
        dojo.byId("divRequestTypes").style.display = "none";
    });


    mapSharingOptions = responseObject.MapSharingOptions;
    baseMapLayers = responseObject.BaseMapLayers;
    var infoWindow = new js.InfoWindow({
        domNode: dojo.create("div", null, dojo.byId("map"))
    });
    if (isMobileDevice) {
        dojo.byId('divCreateRequest').style.display = "none";
        dojo.byId('divInfoContainer').style.display = "none";
        dojo.replaceClass("divAddressContent", "hideContainer", "hideContainerHeight");
        dojo.byId('divAddressContainer').style.display = "none";
        dojo.replaceClass("divCreateRequest", "opacityShowAnimation", "opacityHideAnimation");
        dojo.removeClass(dojo.byId('divInfoContainer'), "opacityHideAnimation");
        dojo.removeClass(dojo.byId('divAddressContainer'), "hideContainerHeight");
        dojo.byId('divSplashScreenContent').style.width = "95%";
        dojo.byId('divSplashScreenContent').style.height = "95%";
        dojo.byId("divLogo").style.display = "none";
        dojo.byId('imgDirections').style.display = "none";
        dojo.byId("lblAppName").style.display = "none";
        dojo.byId("lblAppName").style.width = "80%";
        dojo.byId("tdSearchAddress").className = "tdSearchByAddress";
    } else {
        var imgBasemap = document.createElement('img');
        imgBasemap.src = "images/imgbasemap.png";
        imgBasemap.className = "imgOptions";
        imgBasemap.title = "Switch Basemap";
        imgBasemap.id = "imgBaseMap";
        imgBasemap.style.cursor = "pointer";
        imgBasemap.onclick = function () {
            ShowBaseMaps();
        };

        dojo.byId("tdBaseMap").appendChild(imgBasemap);
        dojo.byId("tdBaseMap").className = "tdHeader";
        dojo.byId("divSplashScreenContent").style.width = "400px";
        dojo.byId("divSplashScreenContent").style.height = "400px";
        dojo.byId("divAddressContainer").style.display = "block";
        dojo.byId('imgDirections').src = "images/details.png";
        dojo.byId('imgDirections').title = "Details";
        dojo.byId('imgDirections').style.display = "none";
        dojo.byId("divLogo").style.display = "block";
    }
    dojo.byId('imgApp').src = responseObject.ApplicationIcon;
    dojo.byId('divSplashContent').innerHTML = responseObject.SplashScreenMessage;
    dojo.byId('lblAppName').innerHTML = responseObject.ApplicationName;
    document.title = responseObject.ApplicationName;

    dojo.xhrGet({
        url: "ErrorMessages.xml",
        handleAs: "xml",
        preventCache: true,
        load: function (xmlResponse) {
            messages = xmlResponse;
        }
    });

    ShowProgressIndicator();


    operationalLayers = responseObject.OperationalLayers;
    serviceRequestCommentsLayerUrl = responseObject.ServiceRequestCommentsLayerURL;
    formatDateAs = responseObject.FormatDateAs;
    serviceRequestmobileLayer = responseObject.ServiceRequestmobileLayerURL;
    showNullValueAs = responseObject.ShowNullValueAs;
    photoUploadText = responseObject.PhotoUploadText;
    enablePhotoUploadiOS = responseObject.EnablePhotoUploadiOS;
    infoPopupHeight = responseObject.InfoPopupHeight;
    infoPopupWidth = responseObject.InfoPopupWidth;
    infoWindowData = responseObject.InfoWindowData;

    if (responseObject.InfoWindowCreateTitle != null) {
        if (responseObject.InfoWindowCreateTitle != "") {
            dojo.byId("createPopUpTitle").innerText = responseObject.InfoWindowCreateTitle;
        }
    }

    if (responseObject.InfoWindowCreateType != null) {
        if (responseObject.InfoWindowCreateType != "") {
            dojo.byId("createPopUpType").innerText = responseObject.InfoWindowCreateType;
        }
    }

    if (responseObject.InfoWindowCreateLoudness != null) {
	if (responseObject.InfoWindowCreateLoudness != "") {
	    dojo.byId("createPopUpLoudness").innerText = responseObject.InfoWindowCreateLoudness;
	}
    }

    if (responseObject.InfoWindowCreateDate != null) {
	if (responseObject.InfoWindowCreateDate != "") {
	    dojo.byId("createPopUpDate").innerText = responseObject.InfoWindowCreateDate;
	}
    }

    if (responseObject.InfoWindowCreateName != null) {
        if (responseObject.InfoWindowCreateName != "") {
            dojo.byId("createPopUpName").innerText = responseObject.InfoWindowCreateName;
        }
    }

    if (responseObject.InfoWindowCreateComments != null) {
        if (responseObject.InfoWindowCreateComments != "") {
            dojo.byId("createPopUpComments").innerText = responseObject.InfoWindowCreateComments;
        }
    }

    if (responseObject.InfoWindowCreatePhone != null) {
        if (responseObject.InfoWindowCreatePhone != "") {
            dojo.byId("createPopUpPhone").innerText = responseObject.InfoWindowCreatePhone;
        }
    }

    if (responseObject.InfoWindowCreateEmail != null) {
        if (responseObject.InfoWindowCreateEmail != "") {
            dojo.byId("createPopUpEmail").innerText = responseObject.InfoWindowCreateEmail;
        }
    }

    if (responseObject.InfoWindowCreateAttach != null) {
        if (responseObject.InfoWindowCreateAttach != "") {
            dojo.byId("createPopUpAttach").innerText = responseObject.InfoWindowCreateAttach;
        }
    }
    infoWindowContent = responseObject.InfoWindowContent;
    infoWindowHeader = responseObject.InfoWindowHeader;



    showCommentsTab = responseObject.ShowCommentsTab;
    allowAttachments = responseObject.AllowAttachments;
    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);
    rippleColor = responseObject.RippleColor;
    locatorRippleSize = responseObject.LocatorRippleSize;
    locatorSettings = responseObject.LocatorSettings;
    requestLayerName = responseObject.RequestLayerName;
    requestId = operationalLayers.RequestId;
    commentId = operationalLayers.CommentId;
    status = responseObject.Status;
    commentsInfoPopupFieldsCollection = responseObject.CommentsInfoPopupFieldsCollection;
    serviceRequestFields = responseObject.ServiceRequestFields;
    databaseFields = responseObject.DatabaseFields;
    map = new esri.Map("map", {
        slider: true,
        infoWindow: infoWindow,
	maxScale: 600
    });
    dojo.connect(map, "onClick", function (evt) {
        map.infoWindow.hide();
        selectedMapPoint = null;
        ShowProgressIndicator();
        setTimeout(function () {
            dojo.byId("divRequestTypes").style.display = "none";
            dojo.byId("divInfoDetails").style.display = "none";
            AddServiceRequest(evt.mapPoint);
            HideProgressIndicator();
        }, 500);
    });
    dojo.connect(map, "onLoad", function () {
        var zoomExtent;
        var extent = GetQuerystring('extent');
        if (extent != "") {
            zoomExtent = extent.split(',');
        } else {
            zoomExtent = responseObject.DefaultExtent.split(",");
        }
        initializeMap();
        startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), map.spatialReference);
        map.setExtent(startExtent);

    });

    CreateBaseMapComponent();
    if (!allowAttachments) {
        dojo.byId('trFileUpload').style.display = "none";
    }

    dojo.byId('spanAddAttachmentText').innerHTML = photoUploadText;

    dojo.connect(dojo.byId('imgHelp'), "onclick", function () {
        window.open(responseObject.HelpURL);
    });

    dojo.connect(map, "onExtentChange", function () {
        SetMapTipPosition();
        if (dojo.coords("divAppContainer").h > 0) {
            ShareLink();
        }
    });
    if (dojo.isIE < 9) {
    } dojo.byId('txtSelectedRequest').style.lineHeight = "23px";
}


//Create graphics and feature layer
function initializeMap() {
    if (dojo.query('.logo-med', dojo.byId('map')).length > 0) {
        dojo.query('.logo-med', dojo.byId('map'))[0].id = "esriLogo";
    } else if (dojo.query('.logo-sm', dojo.byId('map')).length > 0) {
        dojo.query('.logo-sm', dojo.byId('map'))[0].id = "esriLogo";
    }

    dojo.addClass("esriLogo", "esriLogo");
    dojo.byId('divSplashScreenContainer').style.display = "block";
    dojo.addClass(dojo.byId('divSplashScreenContent'), "divSplashScreenDialogContent");
    SetSplashScreenHeight();
    if (isMobileDevice) {
        SetAddressResultsHeight();
        SetCommentHeight();
        SetViewDetailsHeight();
        SetCmtControlsHeight();
    }

    dojo.byId("esriLogo").style.bottom = "10px";
    CreateRatingWidget(dojo.byId('commentRating'));
    var glayer = new esri.layers.GraphicsLayer();
    glayer.id = tempGraphicsLayerId;
    map.addLayer(glayer);


    var gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = highlightPollLayerId;
    map.addLayer(gLayer);
    var serviceRequestLayer = new esri.layers.FeatureLayer(isBrowser ? operationalLayers.ServiceRequestLayerURL : operationalLayers.ServiceRequestMobileLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        id: serviceRequestLayerId,
        displayOnPan: false
    });
    map.addLayer(serviceRequestLayer);
    var handle = dojo.connect(serviceRequestLayer, "onUpdateEnd", function (features) {
        serviceRequestSymbol = serviceRequestLayer.renderer.infos[0].symbol;
        var symbolSize = isBrowser ? 25 : 44;
        locatorMarkupSymbol = (locatorSettings.DefaultLocatorSymbol == "") ? serviceRequestLayer.renderer.infos[0].symbol : new esri.symbol.PictureMarkerSymbol(locatorSettings.DefaultLocatorSymbol, Number(symbolSize), Number(symbolSize));
        CreateRequestTypesList(serviceRequestLayer.fields);
        HideProgressIndicator();
        var url = esri.urlToObject(window.location.toString());
        if (url.query && url.query != null) {
            if (url.query.extent.split("$featureID=").length > 0) {
                featureID = url.query.extent.split("$featureID=")[1];
            }
        }
        if (featureID != "" && featureID != null && featureID != undefined) {
            ExecuteQueryTask();
        }
        dojo.disconnect(handle);
    });


    dojo.connect(serviceRequestLayer, "onClick", function (evt) {
        map.infoWindow.hide();
        map.getLayer(tempGraphicsLayerId).clear();
        map.getLayer(highlightPollLayerId).clear();
        // cancel event propagation
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
        ShowProgressIndicator();
        setTimeout(function () {
            ShowServiceRequestDetails(evt.graphic.geometry, evt.graphic.attributes);
            HideProgressIndicator();
        }, 700);

    });

    // Add comment layer
    var serviceRequestCommentsLayer = new esri.layers.FeatureLayer(operationalLayers.ServiceRequestCommentsLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: ["*"],
        id: serviceRequestCommentsLayerId,
        displayOnPan: false
    });
    map.addLayer(serviceRequestCommentsLayer);

    window.onresize = function () {
        if (!isMobileDevice) {
            ResizeHandler();
        }
        else {
            orientationChange = true;
            if (map) {
                var timeout = (isMobileDevice && isiOS) ? 100 : 700;
                map.infoWindow.hide();
                setTimeout(function () {
                    if (isMobileDevice) {
                        map.reposition();
                        map.resize();
                        SetAddressResultsHeight();
                        SetCommentHeight();
                        SetSplashScreenHeight();
                        dojo.byId("divRequestTypes").style.width = (dojo.coords("divDropdown").w - 2) + "px";
                        SetViewDetailsHeight();
                        SetCmtControlsHeight();
                        setTimeout(function () {
                            if (selectedMapPoint) {
                                map.setExtent(GetMobileMapExtent(selectedMapPoint));
                            }
                            orientationChange = false;
                            return;
                        }, 1000);

                    }
                }, timeout);
            }
        }
    };
}


dojo.addOnLoad(dojoInit);
