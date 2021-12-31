const vscode = acquireVsCodeApi();

var $table = $("#matchTable");

$(document).ready(function () {
    $("#attrSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#attrTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    $table.bootstrapTable();
    $table.bootstrapTable("refreshOptions", {
        classes: "table table-bordered",
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var elems = document.querySelectorAll(".fixed-action-btn");
    // var instances = M.FloatingActionButton.init(elems, {
    //     direction: "left",
    // });
});

function copyToClipboard(id) {
    var copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    //document.execCommand("copy");
    navigator.clipboard.writeText(copyText.value);
    // M.toast({ html: "Copied!", classes: "rounded" });
    var toastCopyInfo = document.getElementById("copyToast");
    var toast = new bootstrap.Toast(toastCopyInfo);
    toast.show();
}

function link100Only() {
    vscode.postMessage({
        command: "link",
        value: "100only",
    });
}

function linkAll() {
    vscode.postMessage({
        command: "link",
        value: "all",
    });
}

function uploadAll() {
    vscode.postMessage({
        command: "upload",
        value: "all",
    });
}

function upload(wrId) {
    vscode.postMessage({
        command: "upload",
        value: wrId,
    });
}

function link(fullPath, wrId) {
    vscode.postMessage({
        command: "link",
        value: `{ "fp": "${fullPath}", "id": "${wrId}" }`,
    });
}
