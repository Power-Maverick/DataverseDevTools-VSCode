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
