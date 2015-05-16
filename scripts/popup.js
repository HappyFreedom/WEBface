$(document).ready(function() {
    var WF = chrome.extension.getBackgroundPage().WF;

    $("#EdtiPageCheckBox").prop("checked", WF.isEditing);
    $("#ShowEditedCheckBox").prop("checked", WF.isAllShowing);

    $("#EdtiPageCheckBox").click(function(event){
        WF.isEditing = $("#EdtiPageCheckBox").prop("checked");
        WF.update();
    });
    $("#ShowEditedCheckBox").click(function(event){
        WF.isAllShowing = $("#ShowEditedCheckBox").prop("checked");
        WF.update();
    });
});