const vscode = acquireVsCodeApi();

$(document).ready(function () {
    $(".tabs").tabs();
});

document.addEventListener("DOMContentLoaded", function () {
    var elems = document.querySelectorAll(".fixed-action-btn");
    var instances = M.FloatingActionButton.init(elems, {
        direction: "left",
    });
});

function copyToClipboard(id) {
    var copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    M.toast({ html: "Copied!", classes: "rounded" });
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
