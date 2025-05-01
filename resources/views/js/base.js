const vscode = acquireVsCodeApi();

var $matchTable = $("#matchTable");

$(document).ready(function () {
    $("#attrSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#attrTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $("#entitiesSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#entTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $("#flowsSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#flowsTable tr").filter(function () {
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

function copyToClipboard(event, id) {
    event.preventDefault(); // Prevents the default behavior

    var copyText = document.getElementById(id);

    navigator.clipboard.writeText(copyText.value);

    vscode.postMessage({
        command: "showInfo",
        text: "Copied to clipboard",
    });
}

function copyToClipboardFromParagraph(event, id) {
    event.preventDefault(); // Prevents the default behavior

    var copyText = document.getElementById(id);

    navigator.clipboard.writeText(copyText.textContent);

    vscode.postMessage({
        command: "showInfo",
        text: "Copied to clipboard",
    });
}

function copyToClipboardFromMermaid(event, id) {
    event.preventDefault(); // Prevents the default behavior

    var copyText = document.getElementById(id);
    var value = copyText.innerHTML;

    // our mermaid is a svg... but it has some issues

    // now some styles that are not ok
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "text/html");

    // Replace all <style> tags inside any <div>
    doc.querySelectorAll("div").forEach((div) => {
        div.setAttribute("style", "line-height: 15px; font-size: 70%");
    });

    value = doc.body.innerHTML;

    // we have to fix <br> into <br />
    value = value.replace(/<br>/g, "<br />");

    navigator.clipboard.writeText(value);

    vscode.postMessage({
        command: "showInfo",
        text: "Copied to clipboard",
    });
}

function saveToFileFromMermaid(event, id, name) {
    event.preventDefault(); // Prevents the default behavior

    var copyText = document.getElementById(id);
    var value = copyText.innerHTML;

    // our mermaid is a svg... but it has some issues

    // now some styles that are not ok
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "text/html");

    // Replace all <style> tags inside any <div>
    doc.querySelectorAll("div").forEach((div) => {
        div.setAttribute("style", "line-height: 15px; font-size: 70%");
    });

    value = doc.body.innerHTML;

    // we have to fix <br> into <br />
    value = value.replace(/<br>/g, "<br />");

    const blob = new Blob([value], { type: "image/svg+xml" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "flow.svg";

    link.click();
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

function sortTable(tableId, column) {
    var table = document.getElementById(tableId);
    var tbody = table.querySelector("tbody");
    var rows = Array.from(tbody.rows);
    var sortOrder = 1;
    var headerRow = table.querySelector("thead tr");
    var sortIcons = headerRow.querySelectorAll(".sort-icon");

    if (headerRow.cells[column].classList.contains("sorted")) {
        sortOrder = headerRow.cells[column].classList.contains("asc") ? -1 : 1;
        headerRow.cells[column].classList.toggle("asc");
        headerRow.cells[column].classList.toggle("desc");
    } else {
        var sortedCells = table.querySelectorAll(".sorted");
        sortedCells.forEach(function (cell) {
            cell.classList.remove("sorted", "asc", "desc");
        });

        headerRow.cells[column].classList.add("sorted", "asc");
    }

    sortIcons.forEach(function (sortIcon, index) {
        if (index === column) {
            sortIcon.classList.remove("asc", "desc");
            sortIcon.classList.add(sortOrder === 1 ? "asc" : "desc");
        } else {
            sortIcon.classList.remove("asc", "desc");
        }
    });

    rows.sort(function (a, b) {
        var cellA = a.cells[column].textContent.toLowerCase();
        var cellB = b.cells[column].textContent.toLowerCase();
        if (cellA < cellB) return -sortOrder;
        if (cellA > cellB) return sortOrder;
        return 0;
    });

    rows.forEach(function (row) {
        tbody.appendChild(row);
    });
}
