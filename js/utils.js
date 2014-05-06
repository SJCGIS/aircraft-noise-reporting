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
var orientationChange = false; //variable for setting the flag on orientation
var tinyResponse; //variable for storing the response getting from tiny URL api
var tinyUrl; //variable for storing the tiny URL
var isContainerVisible = true; //variable for setting the flag on address container

function AddReferenceOverlays() {
    if (referenceOverlays != null)
    {
        for (var i = 0; i < referenceOverlays.length; i++) {
            map.addLayer(new esri.layers.FeatureLayer(referenceOverlays[i].URL, {
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT
            }));
        }
    }
}
//function to remove scroll bar
function RemoveScrollBar(container) {
    if (dojo.byId(container.id + 'scrollbar_track')) {
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
}

//Reset service request values
function ResetRequestFields() {
    dojo.byId('fileUploadControl').outerHTML = dojo.byId('fileUploadControl').outerHTML;
    dojo.byId("txtSelectedRequest").value = "";
    dojo.byId('txtDescription').value = "";
    dojo.byId('txtType').value = "";
    dojo.byId('incident_date').value = "";
    dojo.byId('incident_time').value = "";
    dojo.byId('txtName').value = "";
    dojo.byId('txtPhone').value = "";
    dojo.byId('txtMail').value = "";
    dojo.byId('txtFileName').value = "";
    dojo.byId('formFileUplaod').reset();
    dojo.byId('spanServiceErrorMessage').innerHTML = "";
    dojo.byId('divRequestTypes').style.display = "none";

}

//Show add service request info window
function AddServiceRequest(mapPoint) {
    map.getLayer(highlightPollLayerId).clear();
    map.infoWindow.hide();
    selectedMapPoint = mapPoint;
    ResetRequestFields();
    RemoveScrollBar(dojo.byId("divInfoDetails"));
    dojo.byId("divInfoDetails").style.position = "";
    dojo.byId("spanServiceErrorMessage").innerHTML = "";
    map.getLayer(tempGraphicsLayerId).clear();
    map.infoWindow.hide();
    if (isMobileDevice) {
        dojo.byId("submitDiv").style.bottom = "5px";
    }
    if (!isMobileDevice) {
        dojo.byId("divCreateRequestContainer").style.display = "none";
        dojo.byId("divInfoContent").style.display = "none";
        dojo.byId("divCreateRequestContainer").style.width = infoPopupWidth + "px";
        dojo.byId("divCreateRequestContainer").style.height = infoPopupHeight + "px";
    }
    if (serviceRequestSymbol) {
        var graphic = new esri.Graphic(mapPoint, serviceRequestSymbol, null, null);
        map.getLayer(tempGraphicsLayerId).add(graphic);
        (isMobileDevice) ? map.infoWindow.resize(225, 60) : map.infoWindow.resize(infoPopupWidth, infoPopupHeight);

        if (!isMobileDevice) {
            map.setExtent(GetBrowserMapExtent(selectedMapPoint));
        } else {
            map.setExtent(GetMobileMapExtent(selectedMapPoint));
        }
        setTimeout(function () {
            var screenPoint = map.toScreen(selectedMapPoint);
            screenPoint.y = map.height - screenPoint.y;
            map.infoWindow.show(screenPoint);
            if (isMobileDevice) {
                map.infoWindow.setTitle("Submit Details");
                dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                    ResetRequestFields();
                    if (isMobileDevice) {
                        ShowCreateRequestContainer();
                        map.infoWindow.hide();
                    }
                    SetCreateRequestHeight();
                });
                map.infoWindow.setContent("");
            } else {
                dojo.byId("divCreateRequestContainer").style.display = "block";
                dojo.byId("divCreateRequestContent").style.display = "block";
                SetCreateRequestHeight();
            }
        }, 500)
    }
}

//Show create request container
function ShowCreateRequestContainer() {
    dojo.byId("divInfoDetails").style.display = "none";
    dojo.byId("divCreateRequest").style.display = "block";
    dojo.replaceClass("divCreateRequest", "opacityShowAnimation", "opacityHideAnimation");
    dojo.byId("divCreateRequestContent").style.display = "block";
    dojo.replaceClass("divCreateRequestContainer", "showContainer", "hideContainer");
}

//Show toggle request types
function ToggleRequestTypesList() {
    dojo.byId("divRequestTypes").style.width = (dojo.coords("divDropdown").w - 2) + "px";
    CreateScrollbar(dojo.byId("divCreateRequestContent"), dojo.byId("divCreateRequestScrollContent"));
    dojo.byId("divRequestTypes").style.display = (dojo.byId("divRequestTypes").style.display == "block") ? "none" : "block";
    dojo.byId("divCreateRequestContentscrollbar_handle").style.position = (dojo.byId("divRequestTypes").style.display == "block") ? "static" : "relative";
    CreateScrollbar(dojo.byId("divScrollBarContainer"), dojo.byId("divScrollBarContent"));
}

//Clear graphics on map
function ClearGraphics() {
    if (map.getLayer(tempGraphicsLayerId)) {
        map.getLayer(tempGraphicsLayerId).clear();
    }
}

//Show comments view
function ShowCommentsView() {
    if (showCommentsTab) {
        dojo.byId("imgComments").style.display = "none";
        dojo.byId('imgDirections').src = "images/Details.png";
        dojo.byId('imgDirections').title = "Details";
        dojo.byId('imgDirections').setAttribute("disp", "Details");
        dojo.byId("imgDirections").style.display = "block";
        ResetCommentValues();
        dojo.byId('divInfoComments').style.display = "block";
        dojo.byId('divInfoDetails').style.display = "none";
        SetCommentHeight();
    }
}

//Show service request details info window
function ShowServiceRequestDetails(mapPoint, attributes) {
    map.infoWindow.hide();
    featureID = attributes[map.getLayer(serviceRequestLayerId).objectIdField]
    dojo.byId("divInfoDetails").style.position = "relative";
    if (showCommentsTab) {
        dojo.byId("imgComments").style.display = "block";
    } else {
        dojo.byId("imgComments").style.display = "none";
        dojo.byId("imgComments").style.width = 0 + "px";
    }
    if (!isMobileDevice) {
        dojo.byId('divCreateRequestContainer').style.display = "none";
        dojo.byId('divInfoContent').style.display = "none";
        dojo.byId('divInfoContent').style.width = infoPopupWidth + "px";
        dojo.byId('divInfoContent').style.height = infoPopupHeight + "px";
    }
    for (var i in attributes) {
        if (attributes.hasOwnProperty(i)) {
            if (!attributes[i]) {
                attributes[i] = "";
            }
        }
    }

    selectedRequestStatus = dojo.string.substitute(status, attributes);
    map.getLayer(tempGraphicsLayerId).clear();

    setTimeout(function () {
        (isMobileDevice) ? map.infoWindow.resize(225, 60) : map.infoWindow.resize(infoPopupWidth, infoPopupHeight);
        if (!isMobileDevice) {
            map.setExtent(GetBrowserMapExtent(mapPoint));
        } else {
            map.setExtent(GetMobileMapExtent(mapPoint));
        }

        selectedMapPoint = mapPoint;
        var screenPoint = map.toScreen(selectedMapPoint);
        screenPoint.y = map.height - screenPoint.y;

        map.infoWindow.show(screenPoint);
        if (isMobileDevice) {
            var header;
            if (dojo.string.substitute(infoWindowHeader, attributes)) {
                header = dojo.string.substitute(infoWindowHeader, attributes).trimString(Math.round(225 / 14));
            } else {
                header = dojo.string.substitute(infoWindowHeader, attributes);
            }
            map.infoWindow.setTitle(header);
            dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                if (isMobileDevice) {
                    selectedMapPoint = null;
                    map.infoWindow.hide();
                    ShowServiceRequestContainer();
                }
                dojo.byId('divInfoContent').style.display = "block";
                ServiceRequestDetails(attributes);
            });
            var cont;
            if (dojo.string.substitute(infoWindowContent, attributes).trimString) {
                cont = dojo.string.substitute(infoWindowContent, attributes).trimString(Math.round(225 / 12));
            } else {
                cont = dojo.string.substitute(infoWindowContent, attributes);
            }
            map.infoWindow.setContent(cont);
        } else {
            ServiceRequestDetails(attributes);
        }
    }, 1000);
}

//Create service request details view
function ServiceRequestDetails(attributes) {
    ShowInfoDirectionsView();
    if (!isMobileDevice) {
        dojo.byId('divInfoContent').style.display = "block";
        dojo.byId("divInfoDetails").style.display = "block";
    }
    dojo.empty(dojo.byId('tblInfoDetails'));
    dojo.empty(dojo.byId('divCommentsContent'));
    if (isBrowser) {
        value = dojo.string.substitute(infoWindowHeader, attributes).trim();
        value = value.trimString(Math.round(infoPopupWidth / 6));

        if (value.length > Math.round(infoPopupWidth / 6)) {
            dojo.byId('tdInfoHeader').title = dojo.string.substitute(infoWindowHeader, attributes);
        }
    } else {
        value = dojo.string.substitute(infoWindowHeader, attributes).trim();
        value = value.trimString(Math.round(infoPopupWidth / 10));
    }
    dojo.byId('tdInfoHeader').innerHTML = value;
    var tblInfoDetails = dojo.byId('tblInfoDetails');
    var tbody = document.createElement("tbody");
    tblInfoDetails.appendChild(tbody);
    var date = new js.date();
    for (var index in infoWindowData) {
        if (infoWindowData.hasOwnProperty(index)) {
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            switch (infoWindowData[index].DataType) {
                case "string":
                    CreateTableRow(tr, infoWindowData[index].DisplayText, dojo.string.substitute(infoWindowData[index].AttributeValue, attributes));
                    break;
                case "date":
                    // Extract the desired date field from the list of attributes. If the date is not available, the date field is an empty string
                    var dateField = dojo.string.substitute(infoWindowData[index].AttributeValue, attributes);
                    var dateString = showNullValueAs;
                    if (dateField.length > 0) 
                    {
                        var utcMilliseconds = Number(dateField);
                        dateString = dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
                            datePattern: formatDateAs,
                            selector: "date"
                        });
                    }
                    CreateTableRow(tr, infoWindowData[index].DisplayText, dateString);
                    break;
            }
        }
    }
    FetchRequestComments(dojo.string.substitute(requestId, attributes));
    FetchAttachmentDetails(attributes[map.getLayer(serviceRequestLayerId).objectIdField], tbody);
    SetViewDetailsHeight();
}

//Create table row
function CreateTableRow(tr, displayName, value) {
    var td = document.createElement("td");
    td.innerHTML = displayName;
    td.style.height = "18px";
    td.style.width = "120px";
    td.vAlign = "middle";
    td.style.paddingTop = "5px";
    var td1 = document.createElement("td");
    td1.style.width = "180px";
    td1.style.paddingTop = "5px";
    if (displayName == "Comment:") {
        td.vAlign = "top";
        if (value == "") {
            value = messages.getElementsByTagName("noComment")[0].childNodes[0].nodeValue;
        } else {
            var wordCount = value.split(/\n/).length;
            if (wordCount > 1) {
                var value1 = value.split(/\n/)[0].length == 0 ? "<br>" : value.split(/\n/)[0].trim();
                for (var c = 1; c < wordCount; c++) {
                    var comment;
                    if (value1 != "<br>") {
                        comment = value.split(/\n/)[c].trim().replace("", "<br>");
                    } else {
                        comment = value.split(/\n/)[c].trim();
                    }
                    value1 += value.split(/\n/)[c].length == 0 ? "<br>" : comment;
                }
            } else {
                value1 = value;
            }
            td1.innerHTML += value1;
            if (CheckMailFormat(value) || dojo.string.substitute(value).match("http:" || "https:")) {
                td1.className = "tdBreakWord";
            } else {
                td1.className = "tdBreak";
            }
            var x = value.split(" ");
            for (var i in x) {
                if (x.hasOwnProperty(i)) {
                    w = x[i].getWidth(15) - 50;
                    var boxWidth = (isMobileDevice) ? (dojo.window.getBox().w - 10) : (infoPopupWidth - 40);
                    if (boxWidth < w) {
                        td1.className = "tdBreakWord";
                        continue;
                    }
                }
            }
        }

    }

    td1.innerHTML = value;
    tr.appendChild(td);
    tr.appendChild(td1);
}

//Fetch comments for a service request
function FetchRequestComments(requestID) {
    dojo.byId('btnAddComments').disabled = false;
    var reqId;
    var query = new esri.tasks.Query();
    commentId.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
        reqId = key;
    });
    query.where = reqId + "= '" + requestID + "'";
    query.outFields = ["*"];
    selectedRequestID = requestID;
    //execute query
    map.getLayer(serviceRequestCommentsLayerId).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (features) {
        var commentsTable = document.createElement("table");
        commentsTable.style.width = "95%";
        var commentsTBody = document.createElement("tbody");
        commentsTable.appendChild(commentsTBody);
        dojo.byId("divCommentsContent").appendChild(commentsTable);
        if (features.length > 0) {
            features.sort(SortResultFeatures); //Sort comments based on submitted date
            for (var i = features.length - 1; i >= 0; i--) {
                var trComments = document.createElement("tr");
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                commentsCell.appendChild(CreateCommentRecord(features[i].attributes, i));
                trComments.appendChild(commentsCell);
                commentsTBody.appendChild(trComments);
                CreateRatingWidget(dojo.byId('commentRating' + i));
                SetRating(dojo.byId('commentRating' + i), dojo.string.substitute(commentsInfoPopupFieldsCollection.Rank, features[i].attributes));
            }
            SetCommentHeight();
        } else {
            var trComments = document.createElement("tr");
            var commentsCell = document.createElement("td");
            commentsCell.appendChild(document.createTextNode("No comments available"));
            trComments.setAttribute("noComments", "true");
            trComments.appendChild(commentsCell);
            commentsTBody.appendChild(trComments);
        }
    }, function (err) { });
}

//Fetch attachment details
function FetchAttachmentDetails(objectID, tbody) {
    RemoveScrollBar(dojo.byId("divCreateRequestContent"));
    map.getLayer(serviceRequestLayerId).queryAttachmentInfos(objectID, function (files) {
        var tr = document.createElement("tr");
        tbody.appendChild(tr);
        tr.vAlign = "top";
        var tdTitle = document.createElement("td");
        tdTitle.innerHTML = "Attachment: ";
        tdTitle.style.paddingTop = "5px";
        tr.appendChild(tdTitle);
        var tdAttachments = document.createElement("td");
        tdAttachments.style.paddingTop = "5px";
        tr.appendChild(tdAttachments);
        if (files.length == 0) {
            tdAttachments.innerHTML = "No attachment";
        } else {
            if (files[0].contentType.indexOf("image") >= 0) {
                var filePreview = dojo.create("img");
                filePreview.style.height = "130px";
                filePreview.style.width = "130px";
                filePreview.style.cursor = "pointer";
                filePreview.src = files[0].url;
                filePreview.onclick = function () {
                    window.open(files[0].url);
                }
                tdAttachments.appendChild(filePreview);
            } else {
                var filespan = document.createElement("span");
                filespan.innerHTML = files[0].name;
                filespan.className = 'spanFileDetails';
                tdAttachments.appendChild(filespan);
                filespan.onclick = function () {
                    window.open(files[0].url);
                }
            }
        }
        CreateScrollbar(dojo.byId("divInfoDetails"), dojo.byId("divInfoDetailsScroll"));
    });
}


//Convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//Create Rating widget
function CreateRatingWidget(rating) {
    var numberStars = Number(rating.getAttribute("numstars"));
    var isReadOnly = String(rating.getAttribute("readonly")).bool();
    for (var i = 0; i < numberStars; i++) {
        var li = document.createElement("li");
        li.value = (i + 1);
        li.className = isReadOnly ? "ratingStar" : "ratingStarBig";
        rating.appendChild(li);
        if (i < rating.value) {
            dojo.addClass(li, isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
        if (isBrowser) {
            li.onmouseover = function () {
                if (!isReadOnly) {
                    var ratingValue = Number(this.value);
                    var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                    for (var i = 0; i < ratingValue; i++) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
            li.onmouseout = function () {
                if (!isReadOnly) {
                    var ratings = Number(rating.value);
                    var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                    for (var i = 0; i < ratingStars.length; i++) {
                        if (i < ratings) {
                            dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                        } else {
                            dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                        }
                    }
                }
            }
        }
        li.onclick = function () {
            if (!isReadOnly) {
                rating.value = Number(this.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < this.value) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    } else {
                        dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
        }
    }
}

//Set height for create request container
function SetCreateRequestHeight() {
    RemoveScrollBar(dojo.byId("divInfoDetails"));
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 25) : dojo.coords(dojo.byId("divCreateRequestContainer")).h;
    dojo.byId('divCreateRequestScrollContent').style.height = (height - ((isBrowser) ? 95 : 120)) + "px";
    if (isMobileDevice) {
        dojo.byId('divCreateRequestScrollContent').style.height = (height - 90) + "px";
    }
    CreateScrollbar(dojo.byId("divCreateRequestContent"), dojo.byId("divCreateRequestScrollContent"));
}

//Set rating for rating control
function SetRating(control, rating) {
    control.value = rating;
    var isReadOnly = String(control.getAttribute("readonly")).bool();
    var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", control);
    for (var i = 0; i < ratingStars.length; i++) {
        if (i < rating) {
            dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        } else {
            dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
    }
}

//Adds a new comment
function AddRequestComment() {
    var text = dojo.byId('txtComments').value.trim('');
    if (text == "") {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("enterComment")[0].childNodes[0].nodeValue);
        return;
    }
    if (dojo.byId('txtComments').value.length > 250) {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("commentsLength")[0].childNodes[0].nodeValue);
        return;
    }
    ShowProgressIndicator();
    var commentGraphic = new esri.Graphic();
    var date = new js.date();
    var attr = {};
    attr[databaseFields.RequestIdFieldName] = selectedRequestID;
    attr[databaseFields.CommentsFieldName] = text;
    attr[databaseFields.DateFieldName] = date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()));
    attr[databaseFields.RankFieldName] = Number(dojo.byId('commentRating').value);
    commentGraphic.setAttributes(attr);

    dojo.byId('btnAddComments').disabled = true;
    map.getLayer(serviceRequestCommentsLayerId).applyEdits([commentGraphic], null, null, function (msg) {
        if (msg[0].error) { } else {
            var table = dojo.query('table', dojo.byId("divCommentsContent"));
            if (table.length > 0) {
                var x = dojo.query("tr[noComments = 'true']", table[0]);
                if (x.length > 0) {
                    dojo.empty(table[0]);
                }
                var tr = table[0].insertRow(0);
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                var index = dojo.query("tr", table[0]).length;
                if (index) {
                    index = 0;
                }
                commentsCell.appendChild(CreateCommentRecord(attr, index));
                tr.appendChild(commentsCell);
                CreateRatingWidget(dojo.byId('commentRating' + index));
                SetRating(dojo.byId('commentRating' + index), attr[databaseFields.RankFieldName]);
            }
        }
        dojo.byId('btnAddComments').disabled = false;
        ResetCommentValues();
        HideProgressIndicator();
        SetCommentHeight();
    }, function (err) {
        dojo.byId('btnAddComments').disabled = false;
        HideProgressIndicator();
    });
}

//Create comment record
function CreateCommentRecord(attributes, i) {
    var table = document.createElement("table");
    table.style.width = "100%";
    var tbody = document.createElement("tbody");
    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    var td3 = document.createElement("td");
    td3.align = "left";
    td3.appendChild(CreateRatingControl(true, "commentRating" + i, 0, 5));
    var trDate = document.createElement("tr");
    tbody.appendChild(trDate);
    var td1 = document.createElement("td");
    var utcMilliseconds = Number(dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, attributes));
    var date = new js.date();
    td1.innerHTML = "Date: " + dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
        datePattern: formatDateAs,
        selector: "date"
    });
    td1.align = "left";
    td1.colSpan = 2;
    tr.appendChild(td3);
    trDate.appendChild(td1);
    var tr1 = document.createElement("tr");
    var td2 = document.createElement("td");
    td2.colSpan = 2;
    td2.id = "tdComment";
    if (isMobileDevice) {
        td2.style.width = "100%";
    } else {
        td2.style.width = (infoPopupWidth - 40) + "px";
    }
    td2.colSpan = 2;
    if (dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) {
        var wordCount = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/).length;
        if (wordCount > 1) {
            var value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].length == 0 ? "<br>" : dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].trim();
            for (var c = 1; c < wordCount; c++) {
                var comment;
                if (value != "<br>") {
                    comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim().replace("", "<br>");
                } else {
                    comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim();
                }
                value += dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].length == 0 ? "<br>" : comment;
            }
        } else {
            value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes);
        }
        td2.innerHTML += value;
        if (CheckMailFormat(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) || dojo.string.substitute(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)).match("http:") || dojo.string.substitute(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)).match("https:")) {
            td2.className = "tdBreakWord";
        } else {
            td2.className = "tdBreak";
        }
        var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(" ");
        for (var i in x) {
            if (x.hasOwnProperty(i)) {
                w = x[i].getWidth(15) - 50;
                var boxWidth = (isMobileDevice) ? (dojo.window.getBox().w - 10) : (infoPopupWidth - 40);
                if (boxWidth < w) {
                    td2.className = "tdBreakWord";
                    continue;
                }
            }
        }
    } else {
        td2.innerHTML = showNullValueAs;
    }
    tr1.appendChild(td2);
    tbody.appendChild(tr1);
    table.appendChild(tbody);
    return table;
}

//Sort comments according to date
function SortResultFeatures(a, b) {
    var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, a.attributes);
    var y = dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, b.attributes)
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

//Function to append ... for a long string
String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
}

//Reset the comments textarea
function ResetTextArea() {
    dojo.byId('txtComments').style.overflow = "hidden";
    ResetCommentValues();
    SetCommentHeight();
}

//Reset comments data
function ResetCommentValues() {
    dojo.byId('txtComments').style.overflow = "auto";
    dojo.byId('txtComments').value = '';
    SetRating(dojo.byId('commentRating'), 0);
    document.getElementById('spanCommentError').innerHTML = "";
    document.getElementById('spanCommentError').style.display = 'none';
    dojo.byId('divAddComment').style.display = "none";
    dojo.byId('divCommentsView').style.display = "block";
    dojo.byId('divCommentsList').style.display = "block";
}

//Create rating control
function CreateRatingControl(readonly, ctlId, intitalValue, numStars) {
    var ratingCtl = document.createElement("ul");
    ratingCtl.setAttribute("readonly", readonly);
    ratingCtl.id = ctlId;
    ratingCtl.setAttribute("value", intitalValue);
    ratingCtl.setAttribute("numStars", numStars);
    ratingCtl.style.padding = 0;
    ratingCtl.style.margin = 0;
    return ratingCtl;
}

//Show service request container
function ShowServiceRequestContainer() {
    dojo.byId('divInfoContainer').style.display = "block";
    dojo.byId("divInfoDetails").style.display = "block";
    dojo.replaceClass("divInfoContent", "showContainer", "hideContainer");
}

//Create scroll-bar
function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;
    content.scrollTop = 0;
    if (dojo.byId(container.id + 'scrollbar_track')) {
        dojo.empty(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = document.createElement('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    } else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }
    var containerHeight = dojo.coords(container);
    scrollbar_track.style.right = 5 + 'px';
    var scrollbar_handle = document.createElement('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";
    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);
    if ((content.scrollHeight - content.offsetHeight) <= 5) {
        scrollbar_handle.style.display = 'none';
        scrollbar_track.style.display = 'none';
        return;
    } else {
        if (isBrowser) {
            if ((dojo.byId("divCreateRequestContainer").style.display) == "block") {
                dojo.byId("divCreateRequestContentscrollbar_track").style.top = "35px";
            }
        }
        scrollbar_handle.style.display = 'block';
        scrollbar_track.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;
        yMax = yMax - 5; //for getting rounded bottom of handle
        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }
        content.onmousewheel = function (evt) {
            console.log(content.id);
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) {
                y = yMax
            } // Limit vertical movement
            if (y < 0) {
                y = 0
            } // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));

        } else {
            var y = pxTop - 10;
            if (y > yMax) {
                y = yMax
            } // Limit vertical movement
            if (y < 0) {
                y = 2
            } // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attach events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            } else offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attach events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) {
                y = yMax
            } // Limit vertical movement
            if (y < 0) {
                y = 0
            } // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };

    var startPos;
    var scrollingTimer;

    dojo.connect(container, "touchstart", function (evt) {
        touchStartHandler(evt);
    });


    dojo.connect(container, "touchmove", function (evt) {
        touchMoveHandler(evt);
    });

    dojo.connect(container, "touchend", function (evt) {
        touchEndHandler(evt);
    });

    //Handlers for Touch Events
    function touchStartHandler(e) {
        startPos = e.touches[0].pageY;
    }

    function touchMoveHandler(e) {
        BlurTextIsos();
        var touch = e.touches[0];
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();

        pxTop = scrollbar_handle.offsetTop;
        var y;
        if (startPos > touch.pageY) {
            y = pxTop + 10;
        } else {
            y = pxTop - 10;
        }

        //set scrollbar handle
        if (y > yMax) y = yMax // Limit vertical movement
        if (y < 0) y = 0 // Limit vertical movement
        scrollbar_handle.style.top = y + "px";

        //set content position
        content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));

        scrolling = true;
        startPos = touch.pageY;
    }

    function touchEndHandler(e) {
        scrollingTimer = setTimeout(function () {
            clearTimeout(scrollingTimer);
            scrolling = false;
        }, 100);
    }
    //touch scrollbar end
}

//Trim string
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
}

//Make the text fields blur on scroll
function BlurTextIsos() {
    dojo.byId("txtSelectedRequest").blur();
    dojo.byId("txtDescription").blur();
    dojo.byId("txtName").blur();
    dojo.byId("txtPhone").blur();
    dojo.byId("txtMail").blur();

}
//Show error message span
function ShowSpanErrorMessage(controlId, message) {
    dojo.byId(controlId).style.display = "block";
    dojo.byId(controlId).innerHTML = message;
}

//Get width of a control when text and font size are specified
String.prototype.getWidth = function (fontSize) {
    var test = document.createElement("span");
    document.body.appendChild(test);
    test.style.visibility = "hidden";
    test.style.fontSize = fontSize + "px";
    test.innerHTML = this;
    var w = test.offsetWidth;
    document.body.removeChild(test);
    return w;
}


//Create new service request
function SubmitIssueDetails() {
    dojo.byId('txtPhone').value = dojo.byId('txtPhone').value.trim('');
    dojo.byId('txtMail').value = dojo.byId('txtMail').value.trim('');
    dojo.byId('txtName').value = dojo.byId('txtName').value.trim('');
    if (!ValidateRequestData()) {
        return;
    }

    dojo.byId('spanServiceErrorMessage').innerHTML = "";
    ShowProgressIndicator('map');
    var mapPoint = map.getLayer(tempGraphicsLayerId).graphics[0].geometry;
    var date = new js.date();
    var serviceRequestAttributes = {};
    serviceRequestAttributes[serviceRequestFields.RequestTypeFieldName] = dojo.byId("txtType").value.trim();
    serviceRequestAttributes[serviceRequestFields.RequestLoudnessFieldName] = dojo.byId("txtSelectedRequest").value;
    serviceRequestAttributes[serviceRequestFields.CommentsFieldName] = dojo.byId('txtDescription').value.trim();
    serviceRequestAttributes[serviceRequestFields.NameFieldName] = dojo.byId('txtName').value.trim();
    serviceRequestAttributes[serviceRequestFields.PhoneFieldName] = dojo.byId('txtPhone').value;
    serviceRequestAttributes[serviceRequestFields.EmailFieldName] = dojo.byId('txtMail').value.trim();
    serviceRequestAttributes[serviceRequestFields.StatusFieldName] = "Unassigned";
    serviceRequestAttributes[serviceRequestFields.IncidentDateFieldName] = dojo.byId('incident_date').value.trim();
    serviceRequestAttributes[serviceRequestFields.IncidentTimeFieldName] = dojo.byId('incident_time').value.trim();

    var serviceRequestGraphic = new esri.Graphic(mapPoint, null, serviceRequestAttributes, null);
    map.getLayer(serviceRequestLayerId).applyEdits([serviceRequestGraphic], null, null, function (addResults) {
        if (addResults[0].success) {
            var objectIdField = map.getLayer(serviceRequestLayerId).objectIdField;
            var requestID = {};
            requestID[serviceRequestFields.RequestIdFieldName] = String(addResults[0].objectId);
            requestID[objectIdField] = addResults[0].objectId;
            var requestGraphic = new esri.Graphic(mapPoint, null, requestID, null);
            map.getLayer(serviceRequestLayerId).applyEdits(null, [requestGraphic], null, function () {
                serviceRequestAttributes[serviceRequestFields.RequestIdFieldName] = String(addResults[0].objectId);
                if (dojo.byId('txtFileName').value != "") {
                    map.getLayer(serviceRequestLayerId).addAttachment(addResults[0].objectId, dojo.byId('formFileUplaod'), function (sucess) {
                        ShowServiceRequestDetails(mapPoint, serviceRequestGraphic.attributes);
                        HideProgressIndicator();
                        ResetRequestFields();
                        HideCreateRequestContainer();
			alert(messages.getElementsByTagName("successfulSubmit")[0].childNodes[0].nodeValue);
                    }, function (err) {
                        HideProgressIndicator();
                        alert(dojo.string.substitute(messages.getElementsByTagName("fileSize")[0].childNodes[0].nodeValue, [addResults[0].objectId]));

                    });

                } else {
                    ShowServiceRequestDetails(mapPoint, serviceRequestGraphic.attributes);
                    HideProgressIndicator();
                    ResetRequestFields();
                    HideCreateRequestContainer();
		    alert(messages.getElementsByTagName("successfulSubmit")[0].childNodes[0].nodeValue);
                }
                if (lessthanios6) {
                    if (enablePhotoUploadiOS) {
                        dojo.byId('divUploadDialogContainer').style.display = 'block';
                        var attachmentURL = operationalLayers.ServiceRequestLayerURL + "/${0}/addAttachment";
                        var postURL = dojo.string.substitute(attachmentURL, [addResults[0].objectId]);
                        var currentParams = {
                            'callbackURL': escape(window.location),
                            'posturl': escape(postURL),
                            'debug': 'true',
                            'referrername': escape('Service request'),
                            'purpose': escape('Upload Photo')
                        };
                        Picup.convertFileInput('btnAddPhoto', currentParams);
                    }
                }

            }, function (err) {
                HideProgressIndicator();
                ShowSpanErrorMessage("spanServiceErrorMessage", "Unable to create report.");

            });
        }
    }, function (err) {
        HideProgressIndicator();
        ShowSpanErrorMessage("spanServiceErrorMessage", "Unable to create report.");
    });
}

//Validate service request data
function ValidateRequestData() {
    if (dojo.byId("txtSelectedRequest").value.trim() == "") {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("selectRequestType")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtDescription').value.trim().length > 0 && dojo.byId('txtDescription').value.trim().length > 250) {
        dojo.byId('txtDescription').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("commentsLength")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtName').value.length > 0) {
        if (!IsName(dojo.byId('txtName').value.trim())) {
            dojo.byId('txtName').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("nameProvisions")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    if (dojo.byId('txtMail').value == '' && dojo.byId('txtPhone').value == '') {
        ShowSpanErrorMessage("spanServiceErrorMessage", "Email or Phone number is required.");
        return;
    }
    if (dojo.byId('txtPhone').value == '') {
        if (!CheckMailFormat(dojo.byId('txtMail').value)) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidEmailId")[0].childNodes[0].nodeValue);
            return false;
        }
    } else if (dojo.byId('txtMail').value == '') {
        if (!IsPhoneNumber(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.length < 10 || dojo.byId('txtPhone').value.length > 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    if (dojo.byId('txtPhone').value.length > 0) {
        if (!IsPhoneNumber(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    if (dojo.byId('txtPhone').value.length > 10) {
        dojo.byId('txtPhone').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtMail').value.length > 0) {
        if (!CheckMailFormat(dojo.byId('txtMail').value)) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidEmailId")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtMail').value.length > 100) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("emailIdLength")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.length > 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    return true;
}

//Validate name
function IsName(name) {
    var namePattern = /^[A-Za-z\.\- ]{1,150}$/;
    if (namePattern.test(name)) {
        return true;
    } else {
        return false;
    }
}

//Validate 10 digit number
function IsPhoneNumber(value) {
    var namePattern = /\d{10}/;
    if (namePattern.test(value)) {
        return true;
    } else {
        return false;
    }
}

//Hide create request container
function HideCreateRequestContainer() {
    selectedMapPoint = null;
    map.getLayer(tempGraphicsLayerId).clear();
    map.infoWindow.hide();
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId('divCreateRequest').style.display = "none";
            dojo.replaceClass("divCreateRequest", "opacityShowAnimation", "opacityHideAnimation");
            dojo.replaceClass("divCreateRequestContainer", "hideContainer", "showContainer");
        }, 500);
    } else {
        dojo.byId('divCreateRequestContainer').style.display = "none";
        dojo.byId("divCreateRequestContent").style.display = "none";
    }
}

//Hide upload file dialog for iOS devices
function CloseUploadDialog() {
    dojo.byId('divUploadDialogContainer').style.display = 'none';
}

//Populate filename
function SetFileName(fileUploadCtl) {
    if (fileUploadCtl.value.lastIndexOf("\\") > 0) {
        dojo.byId('txtFileName').value = fileUploadCtl.value.substring(fileUploadCtl.value.lastIndexOf("\\") + 1);
    } else {
        dojo.byId('txtFileName').value = fileUploadCtl.value;
    }
}

//Handle orientation change event
function OrientationChanged() {
    orientationChange = true;
    if (map) {
        var timeout = (isMobileDevice && isiOS) ? 100 : 500;
        map.reposition();
        map.resize();
        map.infoWindow.hide();
        setTimeout(function () {
            map.reposition();
            map.resize();
            if (isMobileDevice) {
                map.reposition();
                map.resize();
                SetAddressResultsHeight();
                SetCommentHeight();
                SetSplashScreenHeight();
                dojo.byId("divRequestTypes").style.width = (dojo.coords("divDropdown").w - 2) + "px";
                SetCreateRequestHeight();
                SetViewDetailsHeight();
                SetCmtControlsHeight();
                BlurTextIsos();
                setTimeout(function () {
                    if (selectedMapPoint) {
                        map.setExtent(GetMobileMapExtent(selectedMapPoint));
                    }
                    orientationChange = false;
                    return;
                }, 1000);

            } else {
                setTimeout(function () {
                    if (selectedMapPoint) {
                        map.setExtent(GetBrowserMapExtent(selectedMapPoint));
                    }
                    orientationChange = false;
                }, 500);
            }
        }, timeout);
    }
}

//Hide splash screen container
function HideSplashScreenMessage() {
    if (dojo.isIE < 9 || isAndroidDevice) {
        dojo.byId("divSplashScreenContent").style.display = "none";
        dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
    } else {
        dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
        dojo.replaceClass("divSplashScreenContent", "hideContainer", "showContainer");

    }

}

//Set height for splash screen
function SetSplashScreenHeight() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 110) : (dojo.coords(dojo.byId('divSplashScreenContent')).h - 80);
    dojo.byId('divSplashContent').style.height = (height + 14) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Handle resize event
function ResizeHandler() {
    if (map) {
        map.reposition();
        map.resize();
    }
}

//Show address container
function ShowLocateContainer() {
    dojo.byId('txtAddress').blur();
    dojo.byId('txtAddress').style.color = "gray";
    HideBaseMapLayerContainer();
    HideShareAppContainer();
    if (isMobileDevice) {
        ResetSearchContainer()
        dojo.byId('divAddressContainer').style.display = "block";
        dojo.replaceClass("divAddressContent", "showContainer", "hideContainer");

    } else {
        if (dojo.coords("divAddressContent").h > 0) {
            HideAddressContainer();
            dojo.byId('txtAddress').blur();
        } else {
            ResetSearchContainer();
            dojo.byId('divAddressContent').style.height = "300px";
            dojo.replaceClass("divAddressContent", "showContainerHeight", "hideContainerHeight");
            setTimeout(function () {
                dojo.byId('txtAddress').style.verticalAlign = "middle";
            }, 500);
            dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
            if (dojo.byId("tdSearchRequest").className == "tdSearchByRequest") {
                dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestName");
            }
        }
    }
    dojo.empty(dojo.byId('tblAddressResults'));
    SetAddressResultsHeight();
}

function ResetSearchContainer() {
    if (dojo.byId("tdSearchAddress").className.trim() == "tdSearchByAddress") {
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
    } else {
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestName");
    }
    dojo.byId("txtAddress").style.color = "gray";
    dojo.byId("imgSearchLoader").style.display == "none";
    lastSearchString = dojo.byId("txtAddress").value.trim();
}


//Hide address container
function HideAddressContainer() {
    dojo.byId("imgSearchLoader").style.display = "none";
    dojo.byId("txtAddress").blur();
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId('divAddressContainer').style.display = "none";
        }, 500);
        dojo.replaceClass("divAddressContent", "hideContainerHeight", "showContainerHeight");
    } else {
        dojo.replaceClass("divAddressContent", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAddressContent').style.height = '0px';
    }
    isContainerVisible = false;
}

//Set height and create scrollbar for address results
function SetAddressResultsHeight() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 50) : dojo.coords(dojo.byId('divAddressContent')).h;
    if (height > 0) {
        dojo.byId('divAddressScrollContent').style.height = (height - ((isMobileDevice) ? 130 : 165)) + "px";
        if (isMobileDevice) {
            dojo.byId("tdSearchAddress").style.width = ((dojo.window.getBox().w - 100) / 3) + "px";
            dojo.byId("tdSearchRequest").style.width = ((dojo.window.getBox().w - 100) / 3) + "px";
            dojo.byId("divAddressPlaceHolder").style.width = (dojo.window.getBox().w - 30) + "px";
        }
    }
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
}

//Hide Info request container
function HideInfoContainer() {
    featureID = null;
    map.getLayer(tempGraphicsLayerId).clear();
    map.getLayer(highlightPollLayerId).clear();
    selectedMapPoint = null;
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId('divInfoContainer').style.display = "none";
            dojo.replaceClass("divInfoContent", "hideContainer", "showContainer");
        }, 500);
    } else {
        map.infoWindow.hide();
        dojo.byId('divInfoContent').style.display = "none";
        dojo.byId("divInfoDetails").style.display = "none";
    }
}

//Set height for view details
function SetViewDetailsHeight() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h) : dojo.coords(dojo.byId('divInfoContent')).h;
    if (height > 0) {
        dojo.byId('divInfoDetailsScroll').style.height = (height - ((!isTablet) ? 55 : 55)) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoDetails"), dojo.byId("divInfoDetailsScroll"));
}

//Set height and create scroll bar for comments
function SetCommentHeight() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h + 20) : (dojo.coords(dojo.byId('divInfoContent')).h - 10);
    if (height > 0) {
        dojo.byId('divCommentsContent').style.height = (height - ((isBrowser) ? 120 : 150)) + "px";
    }
    CreateScrollbar(dojo.byId("divCommentsContainer"), dojo.byId("divCommentsContent"));
    if (isMobileDevice) {
        dojo.byId('divInfoComments').style.width = dojo.window.getBox().w - 15 + "px";
    }
}

//Show Info request directions view
function ShowInfoDirectionsView() {
    if (dojo.byId('imgDirections').getAttribute("disp") == "Details") {
        dojo.byId('imgComments').src = "images/comments.png";
        dojo.byId('imgComments').title = "Comments";
        dojo.byId('imgComments').setAttribute("disp", "Comments");
        dojo.byId('divInfoComments').style.display = "none";
        dojo.byId('divInfoDetails').style.display = "block";
        dojo.byId('imgDirections').style.display = "none";
        dojo.byId('imgComments').style.display = "block";
        SetViewDetailsHeight();
    }
}

//Get the extent based on the map point
function GetBrowserMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 3);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map-point
function GetMobileMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Show add comments view
function ShowAddCommentsView() {
    dojo.byId('divAddComment').style.display = "block";
    dojo.byId('divCommentsView').style.display = "none";
    dojo.byId('divCommentsList').style.display = "none";
    SetCmtControlsHeight();
}

//Show add-comments view
function CreateRequestTypesList(serviceRequestLayerFields) {
    var serviceRequestFields;
    for (var i = 0; i < serviceRequestLayerFields.length; i++) {
        if (serviceRequestLayerFields[i].name.toUpperCase() == requestLayerName.toUpperCase()) {
            serviceRequestFields = serviceRequestLayerFields[i].domain.codedValues;
            break;
        }
    }
    if (!isMobileDevice) {
        dojo.byId('divCreateRequestContainer').style.width = infoPopupWidth + "px";
        dojo.byId('divCreateRequestContainer').style.height = infoPopupHeight + "px";
    }
    var table = document.createElement("table");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;
    for (var i = 0; i < serviceRequestFields.length; i++) {
        var tr = document.createElement("tr");
        tBody.appendChild(tr);
        var td = document.createElement("td");
        td.style.height = "20px";
        td.style.paddingLeft = "5px";
        td.align = "left";
        td.style.cursor = "pointer";
        td.style.fontFamily = "Verdana";
        td.innerHTML = serviceRequestFields[i].name;
        dojo.connect(td, "onclick", function (evt) {
            dojo.byId('txtSelectedRequest').value = this.innerHTML;
            dojo.byId('divRequestTypes').style.display = "none";
            dojo.byId("divCreateRequestContentscrollbar_handle").style.position = "relative";
            if (evt.stopPropagation) evt.stopPropagation();
            return;
        });
        tr.appendChild(td);
    }
    var scrollbar_container = document.createElement('div');
    scrollbar_container.id = "divScrollBarContainer";
    scrollbar_container.className = "scrollbar_container";
    var container = document.createElement("div");
    container.id = "divScrollBarContent";
    container.className = 'scrollbar_content';
    container.appendChild(table);
    scrollbar_container.appendChild(container);
    dojo.byId('divRequestTypes').appendChild(scrollbar_container);
}

//Show comments controls with scrollbar
function SetCmtControlsHeight() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h + 20) : dojo.coords(dojo.byId('divInfoContent')).h;
    dojo.byId("divCmtIpContainer").style.height = (height - ((isTablet) ? 100 : 80)) + "px";
    dojo.byId('divCmtIpContent').style.height = (height - ((isTablet) ? 100 : 80)) + "px";
    CreateScrollbar(dojo.byId("divCmtIpContainer"), dojo.byId("divCmtIpContent"));
}

//Reset map position
function SetMapTipPosition() {
    if (!orientationChange) {
        if (map.getLayer(tempGraphicsLayerId)) {
            if (map.getLayer(tempGraphicsLayerId).graphics.length > 0) {
                if (map.getLayer(tempGraphicsLayerId).graphics[0].attributes) {
                    return;
                }
                mapPoint = map.getLayer(tempGraphicsLayerId).graphics[0].geometry;
                var screenPoint = map.toScreen(mapPoint);
                screenPoint.y = map.height - screenPoint.y;
                map.infoWindow.setLocation(screenPoint);
                return;
            }
            if (selectedMapPoint) {
                var screenPoint = map.toScreen(selectedMapPoint);
                screenPoint.y = map.height - screenPoint.y;
                map.infoWindow.setLocation(screenPoint);
            }
        }
    }
}

//Hide the base map container
function HideBaseMapLayerContainer() {
    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divLayerContainer').style.height = '0px';
}

//Hide the share link container
function HideShareAppContainer() {
    dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divAppContainer').style.height = '0px';
}

//Create the tiny URL with current extent and selected feature
function ShareLink(ext) {
    tinyUrl = null;
    mapExtent = GetMapExtent();
    var url = esri.urlToObject(windowURL);
    if (featureID) {
        var urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$featureID=" + featureID;
    } else {
        var urlStr = encodeURI(url.path) + "?extent=" + mapExtent;
    }

    url = dojo.string.substitute(mapSharingOptions.TinyURLServiceURL, [urlStr]);

    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            tinyResponse = data;
            tinyUrl = data;
            var attr = mapSharingOptions.TinyURLResponseAttribute.split(".");
            for (var x = 0; x < attr.length; x++) {
                tinyUrl = tinyUrl[attr[x]];
            }
            if (ext) {
                HideBaseMapLayerContainer();
                HideAddressContainer();
                var cellHeight = (isMobileDevice || isTablet) ? 81 : 60;

                if (dojo.coords("divAppContainer").h > 0) {
                    HideShareAppContainer();
                } else {
                    dojo.byId('divAppContainer').style.height = cellHeight + "px";
                    dojo.replaceClass("divAppContainer", "showContainerHeight", "hideContainerHeight");
                }
            }
        },
        error: function (error) {
            alert(tinyResponse.error);
        }
    });
    setTimeout(function () {
        if (!tinyResponse) {
            alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
            return;
        }
    }, 6000);
}

//Open login page for facebook,tweet and open Email client with shared link for Email
function Share(site) {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAppContainer').style.height = '0px';
    }
    if (tinyUrl) {
        switch (site) {
            case "facebook":
                window.open(dojo.string.substitute(mapSharingOptions.FacebookShareURL, [tinyUrl]));
                break;
            case "twitter":
                window.open(dojo.string.substitute(mapSharingOptions.TwitterShareURL, [tinyUrl]));
                break;
            case "mail":
                parent.location = dojo.string.substitute(mapSharingOptions.ShareByMailLink, [tinyUrl]);
                break;
        }
    } else {
        alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        return;
    }
}

//Get current map Extent
function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
                  Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Get the query string value of the provided key if not found the function returns empty string
function GetQuerystring(key) {
    var _default;
    if (!_default) {
        _default = "";
    }
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (!qs) {
        return _default;
    } else {
        return qs[1];
    }
}

//Restrict the maximum no of characters in the text area control
function ImposeMaxLength(Object, MaxLen) {
    return (Object.value.length <= MaxLen);
}

//Show progress indicator
function ShowProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "block";
}

//Hide progress indicator
function HideProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "none";
}

//validate Email in comments tab
function CheckMailFormat(emailValue) {
    var pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i
    if (pattern.test(emailValue)) {
        return true;
    } else {
        return false;
    }
}

//Clear default value
function ClearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    target.style.color = "#FFF";
    target.value = '';
}

//Set default value
function ReplaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;

    if (dojo.byId("tdSearchRequest").className == "tdSearchByRequest") {
        ResetTargetValue(target, "defaultRequestTitle", "gray")
    } else {
        ResetTargetValue(target, "defaultAddressTitle", "gray")
    }
}

//Set changed value for address/requestid
function ResetTargetValue(target, title, color) {
    if (target.value == '' && target.getAttribute(title)) {
        target.value = target.title;
        if (target.title == "") {
            target.value = target.getAttribute(title);
            target.style.color = color;
        }
    }
}

//Display the view to search by address
function ShowAddressSearchView() {
    if (dojo.byId("imgSearchLoader").style.display == "block") {
        return;
    }
    if (dojo.byId("txtAddress").getAttribute("defaultAddress") == dojo.byId("txtAddress").getAttribute("defaultAddressTitle")) {
        dojo.byId("txtAddress").style.color = "gray";
    } else {
        dojo.byId("txtAddress").style.color = "gray";
    }
    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.empty(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    dojo.byId("tdSearchAddress").className = "tdSearchByAddress";
    dojo.byId("tdSearchRequest").className = "tdSearchByUnSelectedRequest";
}

//Display the view to search by requestid
function ShowRequestSearchView() {
    if (dojo.byId("imgSearchLoader").style.display == "block") {
        return;
    }
    if (dojo.byId("txtAddress").getAttribute("defaultRequestName") == dojo.byId("txtAddress").getAttribute("defaultRequestTitle")) {
        dojo.byId("txtAddress").style.color = "gray";
    } else {
        dojo.byId("txtAddress").style.color = "gray";
    }
    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestName");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.empty(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    dojo.byId("tdSearchAddress").className = "tdSearchByUnSelectedAddress";
    dojo.byId("tdSearchRequest").className = "tdSearchByRequest";
}

//Add graphic to a layer.
function AddGraphic(layer, symbol, point, attr) {
    var graphic = new esri.Graphic(point, symbol, attr, null);
    layer.add(graphic);
}
