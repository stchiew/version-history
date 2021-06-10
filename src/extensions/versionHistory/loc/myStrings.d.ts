declare interface IVersionHistoryCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'VersionHistoryCommandSetStrings' {
  const strings: IVersionHistoryCommandSetStrings;
  export = strings;
}
