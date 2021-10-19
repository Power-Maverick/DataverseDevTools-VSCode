const vscode = acquireVsCodeApi();

$(document).ready(function () {
    $(".tabs").tabs();
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
