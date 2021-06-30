declare module 'react-native-document-picker' {
  declare export type DocumentPickerResponse = {|
    uri: string,
    type: string,
    name?: string,
    size?: number,
  |};

  declare type FileType = string;

  declare export default {|
    types: {|
      allFiles: FileType,
      audio: FileType,
      images: FileType,
      plainText: FileType,
      pdf: FileType,
      video: FileType,
    |},

    pick({| type?: FileType | FileType[] |}): Promise<DocumentPickerResponse>,

    pickMultiple({| type?: FileType | FileType[] |}): Promise<DocumentPickerResponse[]>,

    isCancel(err: ?{ ... }): ?boolean,
  |};
}
