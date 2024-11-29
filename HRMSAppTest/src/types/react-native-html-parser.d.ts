declare module 'react-native-html-parser' {
    export class DOMParser {
      parseFromString(html: string, type: string): Document;
    }
    export class Document {
      getElementsByTagName(tag: string): Element[];
    }
    export class Element {
      textContent: string | null;
    }
  }


  