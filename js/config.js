/*global dojo */
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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Service Request" template
    //
    // Use this file to perform the following:
    //
    // 1.  Specify application Name                   - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    // 5.  Specify URLs for base maps                 - [ Tag(s) to look for: BaseMapLayers ]
    // 5a. Specify URLs for any reference overlays    - [ Tag(s) to look for: ReferenceOverlays ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]

    // 7.  Tags for using map services:
    // 7a. Specify URLs for operational layers        - [ Tag(s) to look for: serviceRequestLayerURL, serviceRequestmobileLayerURL, serviceRequestCommentsLayerURL,RequestId,CommentId ]
    //
    // 7b. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader, InfoWindowContent ]
    // 7c. Customize info-Popup settings              - [ Tag(s) to look for: infoWindowData, ShowCommentsTab, AllowAttachments ]
    // 7d. Customize info-Popup size                  - [ Tag(s) to look for: InfoPopupHeight, InfoPopupWidth ]
    // 7e. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs, FormatDateAs ]
    // 8. Customize address search settings           - [ Tag(s) to look for: LocatorURL, LocatorNameFields, , LocatorDefaultAddress,LocatorDefaultPark, LocatorMarkupSymbolPath, AddressMatchScore,LocatorRippleSize ]
    //LocatorFields
    // 9. Set URL for geometry service                - [ Tag(s) to look for: GeometryService ]
    // 10.Set for uploading images into iOS devices   - [ Tag(s) to look for: enablePhotoUploadiOS,photoUploadText ]
    // 11.Specify URLs for map sharing               - [ Tag(s) to look for: MapSharingOptions,TinyURLServiceURL, TinyURLResponseAttribute, FacebookShareURL, TwitterShareURL, ShareByMailLink ]



    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set application title
    ApplicationName: "San Juan County Jet Aircraft Noise Reporting",

    // Set application icon path
    ApplicationIcon: "images/logo.png",

    // Set splash window content - Message that appears when the application starts
    SplashScreenMessage: "<br/><b>Report Whidbey Island Naval Air Station Jet Aircraft Noise Incidents in San Juan County WA:</b><br/><br/><img class='imgThumbnail' src='images/locate.png'><strong>Search</strong> for an address <em>-or-</em> <br/> <img class='imgThumbnail' src='images/gps.png'><strong>Locate</strong> your position on the map. <br/><br/>Then click your location directly on the map to add an aircraft incident. Then, provide additional detail and click or tap Submit to submit your incident.</br></br>Incidents received from citizens will be collected by the County of San Juan over a period of about six months and submitted to <a href='http://cnic.navy.mil/regions/cnrnw/installations/nas_whidbey_island.html'>Naval Air Station Whidbey Island</a>. Noise complaints can also be sent directly to Naval Air Station Whidbey Island by phone at (360) 257-6665, or via e-mail: comments.NASWI@navy.mil.",


    // Set URL of help page/portal
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    // Please note: All base maps need to use the same spatial reference. By default, on application start the first basemap will be loaded

    BaseMapLayers: [{
        Key: "generalBasemap",
        ThumbnailSource: "images/parcelmap.png",
        Name: "Streets",
        MapURL: "http://www.sjcgis.org/arcgis/rest/services/Basemaps/General_Basemap/MapServer"

    }, {
        Key: "aerialBasemap",
        ThumbnailSource: "images/imageryhybrid.png",
        Name: "Imagery",
        MapURL: "http://www.sjcgis.org/arcgis/rest/services/Basemaps/Aerial_Basemap/MapServer"
    }],
    //This section allows you to add a feature or map service layer, it must be an layer, not a service
    //use the following format {URL: ""},{URL: ""},...
    ReferenceOverlays: [
    ],

    // Initial map extent. Use comma (,) to separate values and don t delete the last comma
    DefaultExtent: "975352,414105,1238801,755006",


    // ------------------------------------------------------------------------------------------------------------------------
    // OPERATIONAL DATA SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Configure operational layers:

    OperationalLayers: {
        //URL used for doing query task on the ServiceRequest layer
        ServiceRequestLayerURL: "http://sjcgis.org/arcgis/rest/services/PublicInput/Aircraft_Noise/FeatureServer/0",
        //Set the primary key attribute for servicerequest
        RequestId: "${REPORTID}",

        ServiceRequestMobileLayerURL: "http://sjcgis.org/arcgis/rest/services/PublicInput/Aircraft_Noise/FeatureServer/0",

        //URL used for doing query task on the comments layer
        ServiceRequestCommentsLayerURL: "http://sjcgis.org/arcgis/rest/services/PublicInput/Aircraft_Noise/FeatureServer/1",
        //Set the primary key attribute for the comments
        CommentId: "${REPORTID}"

    },

    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-WINDOW SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Info-window is a small, two line popup that gets displayed on selecting a feature
    // Set Info-window title. Configure this with text/fields
    InfoWindowHeader: "Noise Incident Report",

    // Choose content/fields for the info window
    InfoWindowContent: "${Loudness}",

    //Define Service request layer name
    RequestLayerName: "Loudness",

    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-POPUP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    //The labels displayed next to the input boxes when creating a new point, leaving them blank will use the defaults
    InfoWindowCreateTitle: "Noise Report Details",
    InfoWindowCreateType: "Aircraft Type",
    InfoWindowCreateLoudness: "Loudness",
    InfoWindowCreateDate: "Date",
    InfoWindowCreateTime: "Time",
    InfoWindowCreateComments: "",
    InfoWindowCreateName: "",
    InfoWindowCreatePhone: "",
    InfoWindowCreateEmail: "",
    InfoWindowCreateAttach: "",

    // Info-popup is a popup dialog that gets displayed on selecting a feature
    // Set the content to be displayed on the info-Popup. Define labels, field values, field types and field formats
    InfoWindowData: [{
	DisplayText: "Incident Report ID:",
	AttributeValue: "${REPORTID}",
	DataType: "string"
    }, {
        DisplayText: "Loudness:",
        AttributeValue: "${Loudness}",
        DataType: "string"
    }, {
	DisplayText: "Aircraft Type:",
	AttributeValue: "${AIRCRAFTTYPE}",
	DataType: "string"
    },{
        DisplayText: "Comment:",
        AttributeValue: "${COMMENTS}",
        DataType: "string"
    }, {
        DisplayText: "Date:",
        AttributeValue: "${Incident_Date}",
        DataType: "string"
    }, {
	DisplayText: "Time:",
	AttributeValue: "${Incident_Time}",
	DataType: "string"
    }],

    // Set this to true to show "Comments" tab in the info-Popup
    ShowCommentsTab: false,

    // Set this to true to show the Attach portion of the info-popup
    AllowAttachments: false,

    // Set size of the info-Popup - select maximum height and width in pixels (not applicable for tabbed info-Popup)
    //minimum height should be 270 for the info-popup in pixels
    InfoPopupHeight: 360,

    //minimum width should be 330 for the info-popup in pixels
    InfoPopupWidth: 350,

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    // Set date format
    FormatDateAs: "MMM dd, yyyy",

    //Set the locator ripple size
    LocatorRippleSize: 30,

    //set ripple color for selected feature
    RippleColor: [60, 72, 36],

    //Set the attribute for displaying status of serviceRequest
    Status: "${STATUS}",



    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set locator settings such as locator symbol, size, zoom level, display fields, match score

    LocatorSettings: {
        DefaultLocatorSymbol: "images/redpushpin.png",
        MarkupSymbolSize: {
            width: 35,
            height: 35
        },
        Locators: [{
            DisplayText: "Address",
            DefaultValue: "350 Court St",
            LocatorParamaters: ["SingleLine"],
            LocatorURL: "http://sjcgis.org/arcgis/rest/services/Tools/Polaris_Geolocator/GeocodeServer",
            CandidateFields: "Loc_name, Score, Match_addr",
            DisplayField: "${Match_addr}",
            ZoomLevel: 7,
            AddressMatchScore: 80,
            LocatorDefaultRequest: "1201",
            LocatorFieldName: 'Loc_name',
            LocatorFieldValues: ["Address"]
        }, {
            DisplayText: "Report ID",
            DefaultValue: "111555",
            QueryString: "REPORTID LIKE '${0}%'",
            DisplayField: "${REPORTID}"
        }]
    },

    // Define the database field names
    // Note: DateFieldName refers to a date database field.
    // All other attributes refer to text database fields.
    DatabaseFields: {
        RequestIdFieldName: "REPORTID",
        CommentsFieldName: "COMMENTS",
        DateFieldName: "SUBMITDT",
        RankFieldName: "RANK"
    },

    //Define service request input fields for submitting a new request
    ServiceRequestFields: {
        RequestIdFieldName: "REPORTID",
        RequestTypeFieldName: "AIRCRAFTTYPE",
	RequestLoudnessFieldName: "Loudness",
        CommentsFieldName: "COMMENTS",
	IncidentDateFieldName: "Incident_Date",
	IncidentTimeFieldName: "Incident_Time",
        NameFieldName: "NAME",
        PhoneFieldName: "PHONE",
        EmailFieldName: "EMAIL",
        StatusFieldName: "STATUS"
    },

    // Set info-pop fields for adding and displaying comment
    CommentsInfoPopupFieldsCollection: {
        Rank: "${RANK}",
        SubmitDate: "${SUBMITDT}",
        Comments: "${COMMENTS}"
    },
    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set geometry service URL
    GeometryService: "http://sjcgis.org/arcgis/rest/services/Utilities/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------

    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions: {
        TinyURLServiceURL: "https://api-ssl.bitly.com/v3/shorten?access_token=658b4d4ea4dd8f725c859352bdb593a2a4d5c9f6&longUrl=${0}&format=json",
        TinyURLResponseAttribute: "data.url",
        FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Aircraft%20Noise%20Reporting",
        TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=Aircraft%20Noise%20Reporting ${0}",
        ShareByMailLink: "mailto:%20?subject=Check%20out%20this%20map!&body=${0}"
    },

    // set this flag to true to enable uploading images into iOS devices (uses 3rd party application to upload pictures)
    EnablePhotoUploadiOS: false,
    //Message displayed for 3rd party software. This is a HTML text
    PhotoUploadText: "Add attachment <hr/> <br/>This application uses \"Picup\" to add photos. You can download it from <a href='http://picupapp.com/' target='_blank'>PickupApp.com</a>"

});

