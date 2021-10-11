"use strict";
const { Text, ITextProps, DetailsList, DetailsListLayoutMode, SelectionMode, DetailsRow, IDetailsRowProps, ThemeProvider, initializeIcons } = window.FluentUIReact;
// Initialize icons in case this example uses them
initializeIcons();
const testText = "The quick brown fox jumped over the lazy dog.";
const variants = [{ name: "tiny" }, { name: "xSmall" }, { name: "small" }, { name: "smallPlus" }, { name: "medium" }, { name: "mediumPlus" }, { name: "large" }, { name: "xLarge" }, { name: "xxLarge" }, { name: "mega" }];
const renderDetailsRowStyles = { root: { color: "inherit" } };
const renderDetailsRow = (props) => React.createElement(DetailsRow, Object.assign({}, props, { styles: renderDetailsRowStyles }));
const allItems = [];
variants.forEach((setting, index) =>
    allItems.push({
        key: setting.name + index,
        variant: setting.name,
        example: React.createElement(Text, { key: setting.name + "text" + index, variant: setting.name, nowrap: true, block: true }, testText),
    }),
);
const columns = [
    { key: "column1", name: "Variant", fieldName: "variant", minWidth: 100, maxWidth: 150, isResizable: true },
    { key: "column2", name: "Example", fieldName: "example", minWidth: 200, maxWidth: 1600, isResizable: true },
];
const TextRampExample = () =>
    React.createElement(DetailsList, { items: allItems, columns: columns, setKey: "set", selectionMode: SelectionMode.none, layoutMode: DetailsListLayoutMode.fixedColumns, onRenderRow: renderDetailsRow });
const TextRampExampleWrapper = () => React.createElement(ThemeProvider, null, React.createElement(TextRampExample, null));
ReactDOM.render(React.createElement(TextRampExampleWrapper, null), document.getElementById("content"));
