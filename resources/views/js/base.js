const vscode = acquireVsCodeApi();

var $matchTable = $("#matchTable");

$(document).ready(function () {
    $("#attrSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#attrTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    if ($matchTable && $matchTable.bootstrapTable) {
        $matchTable.bootstrapTable();
        $matchTable.bootstrapTable("refreshOptions", {
            classes: "table table-bordered",
        });
    }
});

$(document).ready(function () {
    $("#entitiesSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#entTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    if ($matchTable && $matchTable.bootstrapTable) {
        $matchTable.bootstrapTable();
        $matchTable.bootstrapTable("refreshOptions", {
            classes: "table table-bordered",
        });
    }
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

function linkSpecific(cScore) {
    vscode.postMessage({
        command: "link",
        value: cScore,
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

function sortTable(tableId, n) {
    var table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
    table = document.getElementById(tableId);
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
