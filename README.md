[![Build](https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/build.yml)
[![Release](https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/release.yml)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/danish-naglekar.dataverse-devtools)](https://marketplace.visualstudio.com/items?itemName=danish-naglekar.dataverse-devtools)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/danish-naglekar.dataverse-devtools?label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=danish-naglekar.dataverse-devtools)
[![GitHub stars](https://img.shields.io/github/stars/Power-Maverick/DataverseDevTools-VSCode?label=github%20stars)](https://github.com/Power-Maverick/DataverseDevTools-VSCode)
[![License](https://img.shields.io/github/license/Power-Maverick/DataverseDevTools-VSCode)](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/master/LICENSE)

[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/Power-Maverick)

[![Twitter Follow](https://img.shields.io/twitter/follow/DanzMaverick?style=social)](https://twitter.com/Danzmaverick)

# Dataverse DevTools

The all-in-one tool to develop code for Dataverse/Dynamics 365. Helps you connect to a Dataverse environment, generate TypeScript definitions for entities, create different type of Dataverse-specific projects, upload web-resources right from VS Code and much more.

> Do check-out the [planned features](#-planned-features) list.

> **MSFT Login Prompt for connection is not fully functioning and it is been worked upon.**

**Table of contents**

- [Dataverse DevTools](#dataverse-devtools)
  - [⚙ Features](#-features)
    - [Connect to your Dataverse environment](#connect-to-your-dataverse-environment)
    - [Remembers the connected environment per workspace](#remembers-the-connected-environment-per-workspace)
    - [See connection and entity details (with copy feature)](#see-connection-and-entity-details-with-copy-feature)
    - [Initialize TypeScript project & add TS File](#initialize-typescript-project--add-ts-file)
    - [Generate Typings](#generate-typings)
    - [Intellisense for type generated](#intellisense-for-type-generated)
    - [Upload Web Resources](#upload-web-resources)
    - [Filter by solution](#filter-by-solution)
      - [Entities](#entities)
      - [Web Resources](#web-resources)
    - [Smart Match Web Resources](#smart-match-web-resources)
  - [🔥 Using Typings](#-using-typings)
  - [⌨ Keyboard Shortcuts](#-keyboard-shortcuts)
  - [💭 Planned Features](#-planned-features)
  - [🔌 Contributing](#-contributing)
  - [🔉 Discussions](#-discussions)
  - [📃 License](#-license)
  - [💙 Big Thanks](#-big-thanks)
  - [✍ Credits](#-credits)

## ⚙ Features

### Connect to your Dataverse environment

![Create & Connect](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/Create&Connect.gif?raw=true)

### Remembers the connected environment per workspace

![Silent Connection Reload](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/RememberConnection.gif?raw=true)

### See connection and entity details (with copy feature)

![See Details](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/Connection&EntityDetails.gif?raw=true)

### Initialize TypeScript project & add TS File

Instantiates with following setup:

-   [`@types/xrm`](https://www.npmjs.com/package/@types/xrm)
-   [`WebPack`](https://www.npmjs.com/package/webpack)
-   [`ESLint`](https://www.npmjs.com/package/eslint)
-   [`Prettier`](https://www.npmjs.com/package/prettier)

![TypeScript Project](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/TypeScriptInitialization.gif?raw=true)

![TypeScript File](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/AddNewTSFile.gif?raw=true)

### Generate Typings

**Typings are also integrated with [`@types/xrm`](https://www.npmjs.com/package/@types/xrm)**

![Typings](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/GenerateTypings.gif?raw=true)

### Intellisense for type generated

![IntellisenseTypeScript](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/IntellisenseForTypeScript.gif?raw=true)

### Upload Web Resources

![WebResourceUpload](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/WebResourceUpload.gif?raw=true)

### Filter by solution

#### Entities

![FilterEntities](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/FilterEntitiesBySolution.gif?raw=true)

#### Web Resources

![FilterWRs](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/FilterWRBySolution.gif?raw=true)

### Smart Match Web Resources

![SmartMatch](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/SmartMatchScreen.gif?raw=true)

## 🔥 Using Typings

1. Go to **Dataverse DevTools** from the _Activity Side Bar_.
2. From the list of entities, right-click the entity for which you want to create a typing and choose `Generate Typings` option. You can also filter the list of entities by clicking the filter button on the Entities panel as shown [here](#filter-by-solution).
3. Create a onLoad function in your TypeScript file with parameter as `executionContext: Xrm.Events.EventContext`.
4. Initialize your `FormContext` global variable casting it with `Xrm.<entity name>`.

For example:
If you wanted to use _Accounts_ entity typings in your TypeScript file then after the typings are generated the code in your TypeScript file will look as shown below:

```TypeScript
export function onLoad(executionContext: Xrm.Events.EventContext) {
    const formContext: Xrm.Account = executionContext.getFormContext();
    formContext.getAttribute("accountnumber").getValue();
}
```

In the above code snippet, `Xrm.Account` is a typing generated by Dataverse DevTools to provide intellisense specific to the **Account** entity.

## ⌨ Keyboard Shortcuts

| Command                   | Keyboard Shortcut    |
| ------------------------- | -------------------- |
| Create TypeScript project | `Ctrl + D, Ctrl + T` |

## 💭 Planned Features

-   Integrate with [Dataverse-ify](https://github.com/scottdurow/dataverse-ify/).
-   Initiate plugin project.

## 🔌 Contributing

Before creating the pull request for contributing, please read the [Contributing Guidelines](CONTRIBUTING.md).

We encourage you to pitch in, join the team and showcase your name on this repo. If you are unsure how you can contribute, please reach out to [Power Maverick](https://twitter.com/DanzMaverick).

Thanks to our contributors. JOIN THE TEAM.

<a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Power-Maverick/DataverseDevTools-VSCode" />
</a>

## 🔉 Discussions

If you want to have any discussions on any feature, please use the [Discussion Board](https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions).

## 📃 License

This software is released under [MIT License](http://www.opensource.org/licenses/mit-license.php)

## 💙 Big Thanks

**Matt Barbour** for explaining the authentication using MSAL/ADAL in Dataverse.

[Mohsin Mirza](https://www.linkedin.com/in/mohsin-mirza-94210615/) for helping in creating POC & testing the final authentication using MSFT Login Prompt.

[Magnus Gether Sørensen](https://www.linkedin.com/in/xrmwizard/) for helping in providing insights for XrmDefinitelyTyped.

[Temmy Raharjo](https://www.linkedin.com/in/temmy-wahyu-raharjo/) for encouraging me to start using `pac cli command` to generate Plugin project.

[Benedikt Bergmann](https://www.linkedin.com/in/benedikt-bergmann/) for helping with TypeScript project structure.

## ✍ Credits

Icons sourced from - [https://icon-sets.iconify.design](https://icon-sets.iconify.design/)

JSON to TypeScript conversions - [https://quicktype.io/typescript](https://quicktype.io/typescript)
