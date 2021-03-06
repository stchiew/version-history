import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
//import { Dialog } from '@microsoft/sp-dialog';
import { setup as pnpSetup } from "@pnp/common";

//import * as strings from 'VersionHistoryCommandSetStrings';
import VersionHistoryDialog from "./VersionHistoryLambda";
//import { find } from "lodash";
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IVersionHistoryCommandSetProperties {
  // This is an example; replace with your own properties
  //  sampleTextOne: string;
  // sampleTextTwo: string;
}

const LOG_SOURCE: string = 'VersionHistoryCommandSet';

export default class VersionHistoryCommandSet extends BaseListViewCommandSet<IVersionHistoryCommandSetProperties> {
  public fields: Array<string>;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized VersionHistoryCommandSet');
    pnpSetup({
      spfxContext: this.context
    });
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_ViewHistory');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_ViewHistory':
        const dialog: VersionHistoryDialog = new VersionHistoryDialog();
        dialog.itemId = event.selectedRows[0].getValueByName("ID");
        dialog.listId = this.context.pageContext.list.id.toString();
        dialog.viewId = this.context.pageContext.legacyPageContext.viewId;
        dialog.show().then(() => {
        })
          .catch((e) => {
            debugger;
          });
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
