import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';

import { find } from "lodash";
import {
  PrimaryButton,
  Button,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';


import {
  DetailsList, DetailsListLayoutMode, IColumn, SelectionMode, Selection,
  ColumnActionsMode
} from "office-ui-fabric-react/lib/DetailsList";

import { parse, format, parseISO } from "date-fns";
import { sp } from "@pnp/sp";
import { IField, IFieldInfo } from "@pnp/sp/fields/types";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import "@pnp/sp/items";
//import { IField } from "@pnp/sp/fields";

interface IItemHistoryDialogContentProps {
  versions: Array<any>;
  columns: Array<string>;
  columnDefs: Array<IField>;
  close: () => void;
}

export const VersionHistoryDialogContent: React.FunctionComponent<IItemHistoryDialogContentProps> = (props: IItemHistoryDialogContentProps) => {

  const fieldChanged = (item?: any, index?: number, column?: IColumn, columnType: string = "Text"): boolean => {
    if (index < props.versions.length - 1) {
      switch (columnType) {
        case "User":
        case "Lookup":
          if (props.versions[index][column.fieldName]["LookupId"] !== props.versions[index + 1][column.fieldName]["LookupId"]) {
            return true;
          }
          return false;

        case "UserMulti":
        case "LookupMulti":
          //debugger;
          if (props.versions[index][column.fieldName].length !== props.versions[index + 1][column.fieldName].length) {
            return true;
          }
          for (let x: number = 0; x < props.versions[index][column.fieldName].length; x++) {
            if (props.versions[index][column.fieldName][x].LookupId !== props.versions[index + 1][column.fieldName][x].LookupId) {
              return true;
            }
          }
          return false;

        default:
          if (props.versions[index][column.fieldName] !== props.versions[index + 1][column.fieldName]) {
            return true;
          }
          break;
      }
    }
    return false;
  };

  const getStyle = (item?: any, index?: number, column?: IColumn, columnType: string = "Text"): React.CSSProperties => {
    //if (fieldChanged(item, index, column, columnType)) {
    return {
      backgroundColor: 'yellow',
    };
    //}
    //return {};
  };

  const JoinLookupValues = (column: Array<any>): JSX.Element => {
    const lookupValues = column.map((col) =>
      <div>{col["LookupValue"]}</div>
    );
    return <div>{lookupValues}</div>;
  };

  const onRenderDateTime = (item?: any, index?: number, column?: IColumn): any => {
    return (<div style={getStyle(item, index, column)}>
      {format(parseISO(item[column.fieldName]), "dd-MMM-yyyy")}
    </div>);
  };

  const onRenderUser = (item?: any, index?: number, column?: IColumn): any => {
    return (<div style={getStyle(item, index, column, "User")}>
      {item[column.fieldName]["LookupValue"]}
    </div>);
  };

  const onRenderUserMulti = (item?: any, index?: number, column?: IColumn): any => {
    return (<div style={getStyle(item, index, column, "UserMulti")}>
      {JoinLookupValues(item[column.fieldName])}
    </div>);
  };

  const onRenderLookup = (item?: any, index?: number, column?: IColumn): any => {
    return (<div style={getStyle(item, index, column, "Lookup")}>
      {item[column.fieldName]["LookupValue"]}
    </div>);
  };

  const onRenderLookupMulti = (item?: any, index?: number, column?: IColumn): any => {
    return (<div style={getStyle(item, index, column, "LookupMulti")}>
      {JoinLookupValues(item[column.fieldName])}
    </div>);
  };

  const onRenderChoice = (item?: any, index?: number, column?: IColumn): any => {
    //debugger;
    return (<div style={getStyle(item, index, column)}>
      {item[column.fieldName]}
    </div>);
  };

  const onRenderText = (item?: any, index?: number, column?: IColumn): any => {
    //debugger;
    return (<div style={getStyle(item, index, column)}>
      {item[column.fieldName]}
    </div>);
  };

  try {
    let testviewFields: Array<IColumn> = props.columns.map(cname => {
      let columnDef: IField = find(props.columnDefs, (colunmDef) => { return colunmDef["InternalName"] === cname; });
      switch (columnDef["TypeAsString"]) {
        case "DateTime":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderDateTime,


          };
        case "Choice":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderChoice
          };
        case "User":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderUser
          };
        case "UserMulti":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderUserMulti
          };
        case "Lookup":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderLookup
          };
        case "LookupMulti":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderLookupMulti
          };
        case "Counter":
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 50,
            onRender: onRenderText
          };
        default:
          console.warn(`Column Type of '${columnDef["TypeAsString"]}' is not setup. Defaulting to text`);
          return {
            name: columnDef["Title"],
            isResizable: true,
            key: cname,
            fieldName: cname,
            minWidth: 100,
            onRender: onRenderText
          };
      }

    });
    testviewFields.unshift({
      name: "Version",
      isResizable: true,
      key: "Version",
      fieldName: "VersionLabel",
      minWidth: 50
    }
    );



    return (<DialogContent
      title='Version History(Grid)'
      onDismiss={props.close}
      showCloseButton={true}

    >
      <DetailsList
        items={props.versions}
        columns={testviewFields}
        compact={false}
        selectionMode={SelectionMode.none}
        key={"ID"}
        onShouldVirtualize={() => { return false; }}
        layoutMode={DetailsListLayoutMode.justified}
        skipViewportMeasures={true}

      />
      <DialogFooter>
        <Button text='Cancel' title='Cancel' onClick={props.close} />

      </DialogFooter>
    </DialogContent>);
  }
  catch (e) {
    debugger;
  }

};

export default class VersionHistoryDialog extends BaseDialog {
  public itemId: number;
  public listId: string;
  public viewId: string;
  public fieldInterntalNames: Array<string>;
  public fieldDefinitions: Array<IField>;
  public versionHistory: Array<any>;
  public onBeforeOpen(): Promise<void> {
    // set up pnp here
    // let viewId = this.context.pageContext.legacyPageContext.viewId //get the view id and then used pnp to query view columns/fields as follows,
    let batch = sp.createBatch();
    // get the fields in the view
    sp.web.lists.getById(this.listId).views.getById(this.viewId).fields.inBatch(batch).get().then((results: any) => {

      this.fieldInterntalNames = results.Items.map(f => {
        switch (f) {
          case "LinkTitle":
          case "LinkTitleNoMenu":
            return "Title";
          //break;
          default:
            return f;
        }
      });

    }).catch((err: any) => {
      debugger;
    });
    // get the field definitions for the list
    sp.web.lists.getById(this.listId).fields.inBatch(batch).get().then((results: any) => {

      this.fieldDefinitions = results;
    }).catch((err: any) => {
      debugger;
    });
    // get the field versionHostory
    sp.web.lists.getById(this.listId).items.getById(this.itemId).versions.inBatch(batch).get().then((versions) => {
      this.versionHistory = versions;

      return;
    }).catch((err: any) => {
      debugger;
    });
    return batch.execute().then(e => {

    });

  }
  public render(): void {

    ReactDOM.render(<VersionHistoryDialogContent
      versions={this.versionHistory}
      columns={this.fieldInterntalNames}
      columnDefs={this.fieldDefinitions}
      close={this.close}


    />, this.domElement);
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

}