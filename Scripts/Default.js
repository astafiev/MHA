﻿/* global $ */
/* global onResize */
/* global HeaderModel */
/* global ImportedStrings */
/* global initializeTableUI */
/* global rebuildSections */
/* global rebuildTables */
/* global recalculateVisibility */

var viewModel = null;

// This function is run when the app is ready to start interacting with the host application.
// It ensures the DOM is ready before updating the span elements with values from the current message.
$(document).ready(function () {
    try {
        $(window).resize(onResize);
        viewModel = new HeaderModel();
        initializeTableUI();
        updateStatus(ImportedStrings.mha_loading);
        window.addEventListener("message", eventListener, false);
        postMessageToParent("frameActive");
    }
    catch (e) {
        LogError(e, "Failed initializing frame");
        showError(e, "Failed initializing frame");
    }
});

function site() { return window.location.protocol + "//" + window.location.host; }

function postMessageToParent(eventName, data) {
    window.parent.postMessage({ eventName: eventName, data: data }, site());
}

function eventListener(event) {
    if (!event || event.origin !== site()) return;

    if (event.data) {
        switch (event.data.eventName) {
            case "showError":
                showError(JSON.parse(event.data.data.error), event.data.data.message);
                break;
            case "updateStatus":
                updateStatus(event.data.data);
                break;
            case "renderItem":
                renderItem(event.data.data);
                break;
        }
    }
}

function LogError(error, message) {
    postMessageToParent("LogError", { error: JSON.stringify(error), message: message });
}

function enableSpinner() {
    $("#response").css("background-image", "url(/Resources/loader.gif)");
    $("#response").css("background-repeat", "no-repeat");
    $("#response").css("background-position", "center");
}

function disableSpinner() {
    $("#response").css("background", "none");
}

function hideStatus() {
    disableSpinner();
}

function updateStatus(statusText) {
    enableSpinner();
    $("#status").text(statusText);
    if (viewModel !== null) {
        viewModel.status = statusText;
    }

    recalculateVisibility();
}

function renderItem(headers) {
    updateStatus(ImportedStrings.mha_foundHeaders);
    $("#originalHeaders").text(headers);
    viewModel = new HeaderModel(headers);
    rebuildTables();
    hideStatus();
}

// Handles rendering of an error.
// Does not log the error - caller is responsible for calling LogError
function showError(error, message) {
    updateStatus(message);
    disableSpinner();
    rebuildSections();
}