<p align="center">
    <h1 align="center">
        Dataverse DevTools
    </h1>
    <h3 align="center">
        The all-in-one tool to develop code for Dataverse/Dynamics 365!
    </h3>
    <p align="center">
        This repo is an open-source project that provides a code for a Dataverse DevTools VS Code Extension that helps you connect to a Dataverse environment, generate TypeScript definitions for entities, create different type of Dataverse-specific projects, upload web-resources right from VS Code and much more.
    </p>
</p>

<p align="center">
    <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/build.yml" alt="Build">
      <img src="https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/build.yml/badge.svg?branch=main"/>
    </a>
    <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/release.yml" alt="Release">
      <img src="https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/release.yml/badge.svg?branch=release"/>
    </a>
    <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/master/LICENSE" alt="License">
      <img src="https://img.shields.io/github/license/Power-Maverick/DataverseDevTools-VSCode"/>
    </a>
    <a href="https://app.codacy.com/gh/Power-Maverick/DataverseDevTools-VSCode?utm_source=github.com&utm_medium=referral&utm_content=Power-Maverick/DataverseDevTools-VSCode&utm_campaign=Badge_Grade" alt="Codacy Badge">
      <img src="https://api.codacy.com/project/badge/Grade/b947883a529941309d08736843cb126f"/>
    </a>
</p>

<p align="center">
    <a href="https://img.shields.io/visual-studio-marketplace/d/danish-naglekar.dataverse-devtools" alt="Visual Studio Marketplace Downloads">
      <img src="https://img.shields.io/visual-studio-marketplace/d/danish-naglekar.dataverse-devtools" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=danish-naglekar.dataverse-devtools" alt="Visual Studio Marketplace Version">
      <img src="https://img.shields.io/visual-studio-marketplace/v/danish-naglekar.dataverse-devtools?label=vscode%20marketplace" />
    </a>
    <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode" alt="GitHub Stars">
      <img src="https://img.shields.io/github/stars/Power-Maverick/DataverseDevTools-VSCode?label=github%20stars" />
    </a>
</p>

<p align="center">
    <a href="https://github.com/sponsors/Power-Maverick" alt="Sponsor">
      <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub" />
    </a>
    <a href="https://twitter.com/DanzMaverick" alt="Twitter Follow">
      <img src="https://img.shields.io/twitter/follow/DanzMaverick?style=social" />
    </a>
</p>

<h3 align="center">
  <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new?assignees=Power-Maverick&labels=enhancement%2Ctriage&template=issues-form-feature-request.yaml&title=%5BFeature%5D%3A+">Feature request</a>
  <span> · </span>
  <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new?assignees=Power-Maverick&labels=bug%2Ctriage&template=issue-form-bug.yaml&title=%5BBug%5D%3A+">Report a bug</a>
  <span> · </span>
  <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions/categories/q-a">Support</a>
</h3>

**Table of contents**

-   [🆕 Recent Updates (v2.2.6)](#-recent-updates-v226)
    -   [What's New](#whats-new)
-   [⚙ Features](#-features)
    -   [Connect to your Dataverse environment](#connect-to-your-dataverse-environment)
    -   [Remembers the connected environment per workspace](#remembers-the-connected-environment-per-workspace)
    -   [See connection and entity details (with copy feature)](#see-connection-and-entity-details-with-copy-feature)
    -   [Initialize TypeScript project \& add TS File](#initialize-typescript-project--add-ts-file)
    -   [Generate Typings](#generate-typings)
    -   [Intellisense for type generated](#intellisense-for-type-generated)
    -   [Upload Web Resources](#upload-web-resources)
    -   [Filter by solution](#filter-by-solution)
        -   [Entities](#entities)
        -   [Web Resources](#web-resources)
    -   [Smart Match Web Resources](#smart-match-web-resources)
-   [⚒️ Tools](#️-tools)
-   [🔥 Using Typings](#-using-typings)
-   [Generate Typing](#generate-typing)
    -   [When working with Xrm object from @types/xrm](#when-working-with-xrm-object-from-typesxrm)
    -   [When working with entity and attributes only](#when-working-with-entity-and-attributes-only)
-   [🎮 Power Platform CLI Commands](#-power-platform-cli-commands)
-   [🎁 Early-Access Preview](#-early-access-preview)
-   [🧪 Alpha-Testing](#-alpha-testing)
    -   [⌚ Features available for alpha-test](#-features-available-for-alpha-test)
-   [💭 Planned Features](#-planned-features)
-   [✨ Contributing](#-contributing)
-   [🔉 Discussions](#-discussions)
-   [📃 License](#-license)
-   [✍ Credits](#-credits)

## 🆕 Recent Updates (v2.2.6)

### What's New

-   **Improved Comparison of files between local and server**: The tool now correctly shows file from server on the left-side and compares with the local file on the right-side. This is equivalent to GitHub compare where the incoming files are shown on the left and local changes are shown on the right.
-   **Automatic Token Expiration Monitoring**: Implemented automatic token expiration monitoring with user notifications as well as visual indication on the Connection. Any connection that has a token expired will now been shown in "amber" colored Dataverse icon.
-   **Stability Improvements**:
    -   Fixed web resource upload issue when connection was timed out ([#283](https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/283))
    -   Various performance and security enhancements

## ⚙ Features

### Connect to your Dataverse environment

There are 4 ways you can connect to your Dataverse Environment.

| Connection Type                      | Description                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microsoft Login Prompt (Recommended) | Uses Dataverse Dev Client Id for authentication. This connection will work with MFA-enabled authentication as well. **Improved in v2.2.4** with enhanced authentication flow.                                                                                                                                                                                                                                          |
| Username & Password                  | This works with environments without MFA-enabled and needs no extra configuration.                                                                                                                                                                                                                                                                                                                                     |
| Client Id & Secret                   | This works with MFA-enabled authentication but needs extra configuration of Azure AD App Registration. To know more on app registration process [read here](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/walkthrough-register-app-azure-active-directory?WT.mc_id=BA-MVP-5003877).                                                                                                               |
| Azure                                | If you are already logged in inside VSCode using Az extension, Azure CLI or Azure PowerShell, you can leverage Azure Identity Framework to get authenticated against Dataverse. The developer has to use the same account for both Azure and Power Platform for this work (thanks to [Natraj Yegnaraman](https://github.com/rajyraman) for this method). This is a single-click authentication method with no prompts. |

Below is one of the way you can create the connection.

![Create & Connect](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/Create&Connect.gif?raw=true)

### Remembers the connected environment per workspace

Once you connect to your preferred Dataverse Environment; the tool will rememeber the connection for that workspace/folder.

![Silent Connection Reload](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/RememberConnection.gif?raw=true)

### See connection and entity details (with copy feature)

This provides an ability for you to quikly check the details of the connection and also copy certain important information.

![See Details](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/Connection&EntityDetails.gif?raw=true)

### Initialize TypeScript project & add TS File

You can instantiate a TypeScript project for Dataverse that automatically installs all the prerequisites needed:

-   [`@types/xrm`](https://www.npmjs.com/package/@types/xrm)
-   [`WebPack`](https://www.npmjs.com/package/webpack)
-   [`ESLint`](https://www.npmjs.com/package/eslint)
-   [`Prettier`](https://www.npmjs.com/package/prettier)

Below procecss shows how you can create a TypeScript project for Dataverse with one of the available options and also how you can add a TypeScript file that loads the code-snippet.

![TypeScript Project](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/TypeScriptInitialization.gif?raw=true)

![TypeScript File](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/AddNewTSFile.gif?raw=true)

### Generate Typings

Typings help you write early-bound code. And with the help of `@types/xrm` you can provide types to all of your variables/methods.

**Typings are also integrated with [`@types/xrm`](https://www.npmjs.com/package/@types/xrm)**

**Enhanced in v2.2.3:** Typings now include entity attribute metadata, providing more detailed information about entity attributes including attribute type names and relationships.

![Typings](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/GenerateTypings.gif?raw=true)

### Intellisense for type generated

When you generate typings for entities you are provided with an intellisense; provided you have casted the `FormContext` into proper `Entity` type.

![IntellisenseTypeScript](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/IntellisenseForTypeScript.gif?raw=true)

### Upload Web Resources

Once you build your project you can upload your script directly from the VS Code with the help of Dataverse DevTools.

![WebResourceUpload](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/WebResourceUpload.gif?raw=true)

### Filter by solution

#### Entities

![FilterEntities](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/FilterEntitiesBySolution.gif?raw=true)

#### Web Resources

![FilterWRs](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/FilterWRBySolution.gif?raw=true)

### Smart Match Web Resources

![SmartMatch](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/SmartMatchScreen.gif?raw=true)

## ⚒️ Tools

You can launch your favorite Power Platform tools right from VSCode. Below are the list of currently integrated tools with DVDT.

> **UI Enhancement (v2.2.5)**: All tool views now feature modern themed interfaces that automatically adapt to your VS Code theme (light/dark mode).

| Tool Name                | Author       |
| ------------------------ | ------------ |
| Dataverse REST Builder   | Guido Preite |
| Plugin Registration Tool | Microsoft    |
| Configuration Migration  | Microsoft    |
| Package Deployer         | Microsoft    |

## 🔥 Using Typings

## Generate Typing

1. Go to **Dataverse DevTools** from the _Activity Side Bar_.
2. From the list of entities, right-click the entity for which you want to create a typing and choose `Generate Typings` option. You can also filter the list of entities by clicking the filter button on the Entities panel as shown [here](#filter-by-solution).

### When working with Xrm object from @types/xrm

1. Create a onLoad function in your TypeScript file with parameter as `executionContext: Xrm.Events.EventContext`.
2. Initialize your `FormContext` global variable casting it with `Xrm.<entity name>`.

For example:
If you wanted to use _Accounts_ entity typings in your TypeScript file then after the typings are generated the code in your TypeScript file will look as shown below:

```TypeScript
export function onLoad(executionContext: Xrm.Events.EventContext) {
    const formContext: Xrm.Account = executionContext.getFormContext();
    formContext.getAttribute("accountnumber").getValue();
}
```

In the above code snippet, `Xrm.Account` is a typing generated by Dataverse DevTools to provide intellisense specific to the **Account** entity.

### When working with entity and attributes only

1. Just use by typings the entity name

For example:
If you wanted to use _Accounts_ entity typings in your TypeScript file then after the typings are generated the code in your TypeScript file will look as shown below:

```TypeScript
let fetchAccount =
  `<fetch>
    <entity name="${Account.EntityLogicalName}">
      <attribute name="${Account.Attribute.accountid}" />
      <attribute name="${Account.Attribute.telephone1}" />
    </entity>
  </fetch>`;
```

## 🎮 Power Platform CLI Commands

All the Power Platform CLI commands are easily categorized in a tree format that enables you to execute them with a button-click. If any command needs a parameter then system will intelligently prompt for the input from you. At this time only **required** parameters will be prompted by the system. Please see it in action below:

![PacCliCommands](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/PacCliCommands.gif?raw=true)

![PacCliModelBuilder](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/assets/PacCliModelBuilder.gif?raw=true)

## 🎁 Early-Access Preview

This list showcases the features that are build and ready but not fully tested to be released. You can enable these features by navigating to `File` > `Preferences` > `Settings` and search for `Dataverse DevTools` and make sure `Enable Early Access Preview` is **checked**.

> No features in early-access at the moment.

## 🧪 Alpha-Testing

There are different ways in which you can contribute to this open-source project. One of the way is to be part of alpha-testing. In order to perform alpha-testing follow the below steps:

-   Fork this project and clone it on your local machine
-   Identify the changes in alpha-test mode (list is mentioned below)
-   Open the project in VS Code
-   Navigate to `Run and Debug` from **Activity Bar**
-   Make sure `Run Extension` is selected; click on ▶️ icon.
-   This will open another VS Code instance, this instance will have _Extention Development Host_ on it's title
-   You are ready to perform your tests

#### ⌚ Features available for alpha-test

> No features in alpha-testing at the moment.

> Report any issues or feedback on GitHub.

## 💭 Planned Features

-   [ ] Integrate with [Dataverse-ify](https://github.com/scottdurow/dataverse-ify/).
-   [ ] Initiate plugin project.

## ✨ Contributing

We encourage you to pitch in, join the team and showcase your name on this repo. If you are unsure how you can contribute, please reach out to [Power Maverick](https://twitter.com/DanzMaverick).

**Different ways to contribute**:

-   Improve the code or fix a bug by creating a Pull Request.
-   Get involved in Alpha & Beta tests.
-   Provide suggestions, feedback or feature request on GitHub.
-   Report issues & bugs on GitHub.
-   Answer any open questions on the [Discussion Board](https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions).
-   Join [Power Platform LevelUP](https://discord.gg/MwdEqfeZXD) community on Discord to answer any of the questions that may rise w.r.t. this tool.

Before creating the pull request for contributing, please read the [Contributing Guidelines](CONTRIBUTING.md).

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://powermaverick.dev/"><img src="https://avatars.githubusercontent.com/u/36135520?v=4?s=100" width="100px;" alt="Danish Naglekar"/><br /><sub><b>Danish Naglekar</b></sub></a><br /><a href="#question-Power-Maverick" title="Answering Questions">💬</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Code">💻</a> <a href="#content-Power-Maverick" title="Content">🖋</a> <a href="#design-Power-Maverick" title="Design">🎨</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Documentation">📖</a> <a href="#infra-Power-Maverick" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-Power-Maverick" title="Security">🛡️</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Tests">⚠️</a> <a href="#tool-Power-Maverick" title="Tools">🔧</a> <a href="#tutorial-Power-Maverick" title="Tutorials">✅</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mohsinonxrm"><img src="https://avatars.githubusercontent.com/u/21046804?v=4?s=100" width="100px;" alt="mohsinonxrm"/><br /><sub><b>mohsinonxrm</b></sub></a><br /><a href="#question-mohsinonxrm" title="Answering Questions">💬</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Amohsinonxrm" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=mohsinonxrm" title="Code">💻</a> <a href="#example-mohsinonxrm" title="Examples">💡</a> <a href="#ideas-mohsinonxrm" title="Ideas, Planning, & Feedback">🤔</a> <a href="#plugin-mohsinonxrm" title="Plugin/utility libraries">🔌</a> <a href="#research-mohsinonxrm" title="Research">🔬</a> <a href="#userTesting-mohsinonxrm" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JoshSmithXRM"><img src="https://avatars.githubusercontent.com/u/6895577?v=4?s=100" width="100px;" alt="Josh Smith"/><br /><sub><b>Josh Smith</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3AJoshSmithXRM" title="Bug reports">🐛</a> <a href="#maintenance-JoshSmithXRM" title="Maintenance">🚧</a> <a href="#userTesting-JoshSmithXRM" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/P-focT"><img src="https://avatars.githubusercontent.com/u/81171713?v=4?s=100" width="100px;" alt="P-focT"/><br /><sub><b>P-focT</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3AP-focT" title="Bug reports">🐛</a> <a href="#maintenance-P-focT" title="Maintenance">🚧</a> <a href="#userTesting-P-focT" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://benediktbergmann.eu/"><img src="https://avatars.githubusercontent.com/u/9703748?v=4?s=100" width="100px;" alt="Benedikt Bergmann"/><br /><sub><b>Benedikt Bergmann</b></sub></a><br /><a href="#example-BenediktBergmann" title="Examples">💡</a> <a href="#ideas-BenediktBergmann" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/filcole"><img src="https://avatars.githubusercontent.com/u/6078398?v=4?s=100" width="100px;" alt="Phil Cole"/><br /><sub><b>Phil Cole</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Afilcole" title="Bug reports">🐛</a> <a href="#ideas-filcole" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/improving-jeffd"><img src="https://avatars.githubusercontent.com/u/1213947?v=4?s=100" width="100px;" alt="Jeff Dodds"/><br /><sub><b>Jeff Dodds</b></sub></a><br /><a href="#mentoring-improving-jeffd" title="Mentoring">🧑‍🏫</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.powerapps.com/"><img src="https://avatars.githubusercontent.com/u/10568244?v=4?s=100" width="100px;" alt="MattB"/><br /><sub><b>MattB</b></sub></a><br /><a href="#mentoring-MattB-msft" title="Mentoring">🧑‍🏫</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.crmkeeper.com/"><img src="https://avatars.githubusercontent.com/u/33664322?v=4?s=100" width="100px;" alt="Thomas Sandsør"/><br /><sub><b>Thomas Sandsør</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Athomassandsor" title="Bug reports">🐛</a> <a href="#ideas-thomassandsor" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=thomassandsor" title="Tests">⚠️</a> <a href="#userTesting-thomassandsor" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/glemis"><img src="https://avatars.githubusercontent.com/u/4442368?v=4?s=100" width="100px;" alt="glemis"/><br /><sub><b>glemis</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Aglemis" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=glemis" title="Code">💻</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=glemis" title="Tests">⚠️</a> <a href="#userTesting-glemis" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ericregnier"><img src="https://avatars.githubusercontent.com/u/9611006?v=4?s=100" width="100px;" alt="Eric Regnier"/><br /><sub><b>Eric Regnier</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Aericregnier" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.crmanswers.net/"><img src="https://avatars.githubusercontent.com/u/43754988?v=4?s=100" width="100px;" alt="Guido Preite"/><br /><sub><b>Guido Preite</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3AGuidoPreite" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=GuidoPreite" title="Code">💻</a> <a href="#infra-GuidoPreite" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=GuidoPreite" title="Tests">⚠️</a> <a href="#maintenance-GuidoPreite" title="Maintenance">🚧</a> <a href="#userTesting-GuidoPreite" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SatkunamSuganthar"><img src="https://avatars.githubusercontent.com/u/97066265?v=4?s=100" width="100px;" alt="SatkunamSuganthar"/><br /><sub><b>SatkunamSuganthar</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3ASatkunamSuganthar" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://dreamingincrm.com/"><img src="https://avatars.githubusercontent.com/u/5035266?v=4?s=100" width="100px;" alt="Natraj Yegnaraman"/><br /><sub><b>Natraj Yegnaraman</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=rajyraman" title="Code">💻</a> <a href="#content-rajyraman" title="Content">🖋</a> <a href="#design-rajyraman" title="Design">🎨</a> <a href="#example-rajyraman" title="Examples">💡</a> <a href="#ideas-rajyraman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-rajyraman" title="Maintenance">🚧</a> <a href="#security-rajyraman" title="Security">🛡️</a> <a href="#userTesting-rajyraman" title="User Testing">📓</a> <a href="#tool-rajyraman" title="Tools">🔧</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/petrochuk"><img src="https://avatars.githubusercontent.com/u/30735471?v=4?s=100" width="100px;" alt="Andrew Petrochuk"/><br /><sub><b>Andrew Petrochuk</b></sub></a><br /><a href="#data-petrochuk" title="Data">🔣</a> <a href="#ideas-petrochuk" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cyco77"><img src="https://avatars.githubusercontent.com/u/1198698?v=4?s=100" width="100px;" alt="Lars Hildebrandt"/><br /><sub><b>Lars Hildebrandt</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=cyco77" title="Code">💻</a> <a href="#ideas-cyco77" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Acyco77" title="Bug reports">🐛</a> <a href="#maintenance-cyco77" title="Maintenance">🚧</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=cyco77" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/uofirob"><img src="https://avatars.githubusercontent.com/u/1754842?v=4?s=100" width="100px;" alt="Rob Montague"/><br /><sub><b>Rob Montague</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Auofirob" title="Bug reports">🐛</a> <a href="#userTesting-uofirob" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/kkazala"><img src="https://avatars.githubusercontent.com/u/22429087?v=4?s=100" width="100px;" alt="Kinga"/><br /><sub><b>Kinga</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Akkazala" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=kkazala" title="Code">💻</a> <a href="#maintenance-kkazala" title="Maintenance">🚧</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=kkazala" title="Tests">⚠️</a> <a href="#userTesting-kkazala" title="User Testing">📓</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## 🔉 Discussions

If you want to have any discussions on any feature, please use the [Discussion Board](https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions).

## 📃 License

This software is released under [MIT License](http://www.opensource.org/licenses/mit-license.php)

## ✍ Credits

Icons sourced from - [https://icon-sets.iconify.design](https://icon-sets.iconify.design/)

JSON to TypeScript conversions - [https://quicktype.io/typescript](https://quicktype.io/typescript)
