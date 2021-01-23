"use strict";

import {
    workspace,
    window,
    commands,
    ExtensionContext,
    Terminal,
    Uri,
    QuickPickItem
} from "vscode";
import {
    dirname
} from "path";
import * as fs from "fs";
import nodePlop, {
    NodePlopAPI
} from "node-plop";
import * as vscode from "vscode";

function isWorkspaceOpen() {
    if ((workspace) && (workspace.workspaceFolders) && (workspace.workspaceFolders.length > 0)) {
        return true;
    }
    return false;
}

type Generator = {
    name: string;
    description: string;
};

async function selectGenerator(plop: NodePlopAPI, plopFile: string): Promise < Generator | undefined > {
    const generators = plop.getGeneratorList();

    // no generators, output error
    if (generators.length === 0) {
        window.showErrorMessage(`No Plop.js generators found in the config file "${plopFile}". Add one using plop.setGenerator(...)`);
        throw "No Plop.js generators found...";
    }

    // single generator, no need in prompting for selection
    if (generators.length === 1) {
        return generators[0];
    }

    // prompt user for which generator they want to use
    if (generators.length > 1) {
        const result = await window.showQuickPick < QuickPickItem > (
            generators.map((generator: Generator) => ({
                label: generator.name,
                description: generator.description
            })), {
                placeHolder: "Please choose a generator"
            }
        );

        if (result === undefined) {
            return undefined;
        }

        return {
            name: result.label,
            description: result.description!
        };
    }
}

async function runPlopInNewTerminal(dirUri: Uri) {
    if (!dirUri && isWorkspaceOpen()) {
        window.showErrorMessage("Project items cannot be created if workspace is not open.");
        return;
    }

    if ((workspace) && (vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 0)) {
        const plopTemplateDirPath = Uri.parse(vscode.workspace.workspaceFolders[0].uri.path.toString() + "/plop-templates");
        const testDirPath = Uri.parse(vscode.workspace.workspaceFolders[0].uri.path.toString() + "/src/__tests__");

        workspace.fs.createDirectory(plopTemplateDirPath);
        workspace.fs.createDirectory(testDirPath);

        const wsedit = new vscode.WorkspaceEdit();
        const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
        const filePath = vscode.Uri.file(
            wsPath + "/plopfile.js"
        );
        vscode.window.showInformationMessage(filePath.toString());
        wsedit.createFile(filePath, {
            ignoreIfExists: false
        });
        vscode.workspace.applyEdit(wsedit);

        const writeData = Buffer.from(`module.exports = function (plop) {
  // create your generators here
  // Read more about templates at https://plopjs.com/
  plop.setGenerator("React Component Test template", {
    description: "this is a skeleton plopfile",
    prompts: [
      {
        type: "input",
        name: "fileName",
        message: "file name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/__tests__/{{fileName}}.test.js",
        templateFile: "plop-templates/test.js.hbs",
      },
    ],
  });
};
`, "utf8");
        vscode.workspace.fs.writeFile(filePath, writeData);
        vscode.window.showInformationMessage(
            "plpofile.js Generated !"
        );


        //create test.js.hbs filePath

        const esedit1 = new vscode.WorkspaceEdit();
        const wsPath1 = vscode.workspace.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
        const filePath1 = vscode.Uri.file(
            wsPath1 + "/plop-templates/test.js.hbs"
        );
        vscode.window.showInformationMessage(filePath1.toString());
        esedit1.createFile(filePath1, {
            ignoreIfExists: false
        });
        vscode.workspace.applyEdit(esedit1);

        const writeData1 = Buffer.from(`/**
*
* Tests for {{fileName}}
*
*/

import React from 'react';
import { render } from '@testing-library/react';
// import 'jest-dom/extend-expect'; // add some helpful assertions

import {{fileName}} from '../components/{{fileName}}';

describe('<{{fileName}} />', () => {
it('Expect to not log errors in console', () => {
const spy = jest.spyOn(global.console, 'error');
render(<{{fileName}} />);
expect(spy).not.toHaveBeenCalled();
});

it('Expect to have additional unit tests specified', () => {
expect(true).toEqual(false);
});

/**
* Unskip this test to use it
* @see {@link https://jestjs.io/docs/en/api#testskipname-fn}
*/
it.skip('Should render and match the snapshot', () => {
const {
container: { firstChild },
} = render(<{{fileName}} />);
expect(firstChild).toMatchSnapshot();
});
});
`, "utf8");
        vscode.workspace.fs.writeFile(filePath1, writeData1);
        vscode.window.showInformationMessage(
            "test.js.hbs Generated !"
        );

    }
    setInterval(function () {}, 5000);
    // user based settings
    const userSettings = workspace.getConfiguration();
    const plopFileName: string = userSettings.get("plopTemplates.configFileName") || "plopfile.js";
    const plopTerminalName: string = userSettings.get("plopTemplates.terminalName") || "Generate ReactComponent TestCase";
    const destinationpathName: string = userSettings.get("plopTemplates.destinationPath") || "destinationpath";
    const plopCommand: string = (userSettings.get("plopTemplates.plopCommand") as string || "plop").trim();
    let plopCommandRelative: string = plopCommand;

    const plopFile = workspace.rootPath + "/" + plopFileName;
    let plop: NodePlopAPI;

    try {
        plop = nodePlop(plopFile);
    } catch (e) {
        window.showErrorMessage(`Couldn't load plop config file at the path: "${plopFile}" - ${e}`);
        return;
    }


    let destPath: string = "";
    let plopTerminal: Terminal;
    let selectedGenerator = await selectGenerator(plop, plopFile);

    if (selectedGenerator === undefined) {
        window.showInformationMessage("No Plop.js generator selected, cancelling...");
        return;
    }

    if (dirUri) {
        destPath = dirUri.fsPath;
    } else {
        window.showInformationMessage(`Couldn't find a target location "dirUri", the value of dirUri: "${dirUri}"`);
        return;
    }

    if (destPath !== "") {
        let fsStat = fs.statSync(destPath);
        if (!fsStat.isDirectory()) {
            destPath = dirname(destPath);
        }
    } else {
        window.showInformationMessage(`Couldn't find a target location "destPath", the value of destPath: "${destPath}"`);
        return;
    }

    const existingTerminals = window.terminals.filter((value) => value.name === plopTerminalName);

    if (existingTerminals.length > 0) {
        // use existing terminal
        plopTerminal = existingTerminals[0];
    } else {
        // create new terminal
        plopTerminal = window.createTerminal({
            name: plopTerminalName
        });
    }

    if (plopCommand !== "plop") {
        plopCommandRelative = "npm run " + plopCommand;
    }

    plopTerminal.show();
    plopTerminal.sendText(`${plopCommandRelative} "${selectedGenerator.name}" --${destinationpathName} "${destPath}"`);
}

export function activate(context: ExtensionContext) {
    let disposable = commands.registerCommand("ploptemplates.newFile", (dirUri: Uri) => {
        try {
            runPlopInNewTerminal(dirUri);
        } catch (e) {
            window.showErrorMessage(e);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}