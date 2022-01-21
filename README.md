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
      <img src="https://github.com/Power-Maverick/DataverseDevTools-VSCode/actions/workflows/release.yml/badge.svg?branch=main"/>
    </a>
    <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/master/LICENSE" alt="License">
      <img src="https://img.shields.io/github/license/Power-Maverick/DataverseDevTools-VSCode"/>
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

> Do check-out the [planned features](#-planned-features) list. We need your help to complete these planned features.

**Table of contents**

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
- [🎁 Early-Access Preview](#-early-access-preview)
- [🧪 Alpha-Testing](#-alpha-testing)
    - [⌚ Features available for alpha-test](#-features-available-for-alpha-test)
- [💭 Planned Features](#-planned-features)
- [✨ Contributing](#-contributing)
- [🔉 Discussions](#-discussions)
- [📃 License](#-license)
- [✍ Credits](#-credits)

## ⚙ Features

### Connect to your Dataverse environment

There are 3 ways you can connect to your Dataverse Environment.

| Connection Type        | Description                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Username & Password    | This works with environments without MFA-enabled and needs no extra configuration.                                                                                                                                                                                                                                             |
| Microsoft Login Prompt | Uses DVDT's Public App registered in Azure AD. This will need approval from Azure Admin before you can use it for authentication. This connection other than approving the public Azure AD app (which is a one-time activity) needs no extra configuration. This connection will work with MFA-enabled authentication as well. |
| Client Id & Secret     | This works with MFA-enabled authentication but needs extra configuration of Azure AD App Registration. To know more on app registration process [read here](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/walkthrough-register-app-azure-active-directory?WT.mc_id=BA-MVP-5003877).                       |

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

## 🎁 Early-Access Preview

This list showcases the features that are build and ready but not fully tested to be released. You can enable these features by navigating to `File` > `Preferences` > `Settings` and search for `Dataverse DevTools` and make sure `Enable Early Access Preview` is **checked**.

| Preview Feature                      | Details                                                                                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compare local vs server Web Resource | You can compare your local JavaScript web-resource with a server JavaScript file. All you have to do is; right-click the JavaScript file and select `Compare Web Resource`. |

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

1. **Ability for users to select their default TS template**: From the settings option you can now select your default TS Project Template. Selecting the default template will skip the question when you initiate a TS Project.
2. **Improvement to Smart Match**: Smart Match has got a new look-and-feel. It is more robust, shows all the available local files with a status of linked, recommended link or not linked. Recommended link will have a confidence score that will help you link the local files with server files.

> Report any issues or feedback on GitHub.

## 💭 Planned Features

-   Integrate with [Dataverse-ify](https://github.com/scottdurow/dataverse-ify/).
-   Initiate plugin project.

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
  <tr>
    <td align="center"><a href="https://powermaverick.dev/"><img src="https://avatars.githubusercontent.com/u/36135520?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Danish Naglekar</b></sub></a><br /><a href="#question-Power-Maverick" title="Answering Questions">💬</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Code">💻</a> <a href="#content-Power-Maverick" title="Content">🖋</a> <a href="#design-Power-Maverick" title="Design">🎨</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Documentation">📖</a> <a href="#infra-Power-Maverick" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-Power-Maverick" title="Security">🛡️</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=Power-Maverick" title="Tests">⚠️</a> <a href="#tool-Power-Maverick" title="Tools">🔧</a> <a href="#tutorial-Power-Maverick" title="Tutorials">✅</a></td>
    <td align="center"><a href="https://github.com/mohsinonxrm"><img src="https://avatars.githubusercontent.com/u/21046804?v=4?s=100" width="100px;" alt=""/><br /><sub><b>mohsinonxrm</b></sub></a><br /><a href="#question-mohsinonxrm" title="Answering Questions">💬</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Amohsinonxrm" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=mohsinonxrm" title="Code">💻</a> <a href="#example-mohsinonxrm" title="Examples">💡</a> <a href="#ideas-mohsinonxrm" title="Ideas, Planning, & Feedback">🤔</a> <a href="#plugin-mohsinonxrm" title="Plugin/utility libraries">🔌</a> <a href="#research-mohsinonxrm" title="Research">🔬</a> <a href="#userTesting-mohsinonxrm" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/JoshSmithXRM"><img src="https://avatars.githubusercontent.com/u/6895577?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Smith</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3AJoshSmithXRM" title="Bug reports">🐛</a> <a href="#maintenance-JoshSmithXRM" title="Maintenance">🚧</a> <a href="#userTesting-JoshSmithXRM" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/P-focT"><img src="https://avatars.githubusercontent.com/u/81171713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>P-focT</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3AP-focT" title="Bug reports">🐛</a> <a href="#maintenance-P-focT" title="Maintenance">🚧</a> <a href="#userTesting-P-focT" title="User Testing">📓</a></td>
    <td align="center"><a href="https://benediktbergmann.eu/"><img src="https://avatars.githubusercontent.com/u/9703748?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Benedikt Bergmann</b></sub></a><br /><a href="#example-BenediktBergmann" title="Examples">💡</a> <a href="#ideas-BenediktBergmann" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/filcole"><img src="https://avatars.githubusercontent.com/u/6078398?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Phil Cole</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Afilcole" title="Bug reports">🐛</a> <a href="#ideas-filcole" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/improving-jeffd"><img src="https://avatars.githubusercontent.com/u/1213947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeff Dodds</b></sub></a><br /><a href="#mentoring-improving-jeffd" title="Mentoring">🧑‍🏫</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.powerapps.com/"><img src="https://avatars.githubusercontent.com/u/10568244?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MattB</b></sub></a><br /><a href="#mentoring-MattB-msft" title="Mentoring">🧑‍🏫</a></td>
    <td align="center"><a href="http://www.crmkeeper.com/"><img src="https://avatars.githubusercontent.com/u/33664322?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Sandsør</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Athomassandsor" title="Bug reports">🐛</a> <a href="#ideas-thomassandsor" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=thomassandsor" title="Tests">⚠️</a> <a href="#userTesting-thomassandsor" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/glemis"><img src="https://avatars.githubusercontent.com/u/4442368?v=4?s=100" width="100px;" alt=""/><br /><sub><b>glemis</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Aglemis" title="Bug reports">🐛</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=glemis" title="Code">💻</a> <a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/commits?author=glemis" title="Tests">⚠️</a> <a href="#userTesting-glemis" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/ericregnier"><img src="https://avatars.githubusercontent.com/u/9611006?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eric Regnier</b></sub></a><br /><a href="https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues?q=author%3Aericregnier" title="Bug reports">🐛</a></td>
  </tr>
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
