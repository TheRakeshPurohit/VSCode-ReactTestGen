# ReactComponent TestCase Generator for Visual Studio Code

Install the extension on the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=TheRakeshPurohit.reacttestgen)

## Features

* This extension adds single and multi-file templates to Visual Studio Code.
Add a template by right clicking the desired location and selecting `Generate ReactComponent TestCase`

* Generates plofile.js (you can modify anytime according to your need)

* Generates `/plop-templates` directory with `test.js.hbs` (contains React Component Test Template) in your VSCode workspace

* Generates `/__test__` inside `src` folder to allow `npm run test` to test all your generated test cases

## Creating new project item from template

To invoke template selection, simply right click on a folder or file in vscode file explorer and click the `Generate ReactComponent TestCase` menu item.

<img src="https://raw.githubusercontent.com/TheRakeshPurohit/VSCode-ReactTestGen/master/resources/menu.png">

### Click it twice if required direcotries does not exists

## Extension Setup

1) Install the [VSCode extension](https://marketplace.visualstudio.com/items?itemName=TheRakeshPurohit.reacttestgen)
2) Install [plop.js](https://github.com/plopjs/plop) globally using `sudo npm i -g plop`

### ProTip: Add plop templates as a [recommended extension](https://code.visualstudio.com/docs/editor/extension-gallery#_workspace-recommended-extensions) to your `Workspace` or `Project` settings file and commit it. Then everyone on your team will see this extension

## Release Notes

## 1.0.0

* Initial release
* Generates Basic Sanity Check Test Cases for React Component
