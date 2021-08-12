## How to contribute to Dataverse DevTools

#### **Did you find a bug?**

-   **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues).
-   If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or **a demonstrating** of the expected behavior that is not occurring.

#### **Did you wrote a patch that fixes a bug?**

-   Open a new GitHub pull request with the patch.
-   Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.
-   Before submitting, please read the [Code of Conduct](https://github.com/Power-Maverick/DataverseDevTools-VSCode/blob/main/CODE_OF_CONDUCT.md).

#### **Do you intend to add a new feature or change an existing one?**

-   Create a [discussion](https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions/new?category=show-and-tell) under **Show and tell** category.
-   Fork this repo and write code. You can find the guidelines [below](#guidelines).
-   Once you have gather a positive feedback about the change you are welcomed to create a PR with your changes.
-   Do reference the discussion number/link in the PR so that the reviewer can confirm.
-   If you failed to reference the discussion number/link then the PR might get rejected.

#### **Do you have questions about the source code?**

-   Ask any question about how to use Dataverse DevTools can be discussed on the [Discussion](https://github.com/Power-Maverick/DataverseDevTools-VSCode/discussions) tab.

## Guidelines

### Registering a new command

When adding a new command first list it in the `package.json` file under **"contributes"** > **"commands"** and make sure the category is properly listed. You can find the available categories in `package.nls.json` file and the name would end in **category**. Also make sure the `when` condition on the command is correctly specified.

Once you add the command name in the package.json file, register the command under **src** > **commands** > **registerCommands.ts**. The callback function needs to invoke one of the helper classes.

### Choosing the right helper class to add your function

#### CLI Helper

This helper class is to work with Power Platform CLI. If you plan on using the PP CLI then write your function in this class file. All commands for CLI will be listed under **terminals** > **commands.ts**.

#### Dataverse Helper

This class is when you would like to interact with Dataverse API; e.g. fetch all solutions, update plugin assembly, etc. will go in here. Do not write the request function here but utilize already built **requestHelper.ts** file.

#### Request Helper

This is a generic request function class that will help you fetch the data or create or update the data either from Dataverse or any other system (in future).

#### Template Helper

This will contain the code to initialize any of the project templates, like TypeScript, etc.

#### Typings Helper

In this class you can find the code that will help in creating the type definition classes for selected entities.

#### Upload Helper

As the name suggests, this class will contain functions to upload different Dataverse components using Web APIs.

### Want to execute a command?

To execute a command, first make sure your command is listed under **terminals** > **commands.ts**. Once you have the command listed in this file, head over to one of your helper functions and use the following code:

```TypeScript
let commands: string[] = Array();
commands.push(Commands.YourCommandOne());
commands.push(Commands.YourCommandTwo());
Console.runCommand(commands);
```

### Want to add a new webview to the Dataverse DevTools?

Create a new TS file under **views** folder. Add a class in this file that extends **Panel** class. Finally add `getHtmlForWebview` method. You can add additional parameters to the constructors.

For more information on Webview, read [here](https://code.visualstudio.com/api/extension-guides/webview).

### Want to add a new tree to the Dataverse DevTools explorer?

First in `package.json` add the view details under **"contributes"** > **"views"** > **"dvd-explorer"**. Create a Tree Data Provider file under **trees** folder. This file will consist of two classes one will be the **TreeItem** class that will extend **TreeItemBase** class. Second class will be the actual **DataProvider** class that will implement **vscode.TreeDataProvider** with **TreeItem** type defined earlier.

For e.g.
If the TreeItem class that extends TreeItemBase is named MyTreeItem, then DataProvider will implement `vscode.TreeDataProvider<MyTreeItem>`.

For more information on Treeview, read [here](https://code.visualstudio.com/api/extension-guides/tree-view).

---

Dataverse DevTools is a volunteer effort. We encourage you to pitch in and join the team!

Thanks! ♥ ♥ ♥

Power Maverick
