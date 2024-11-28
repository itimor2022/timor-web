/// <reference types="react" />
import { MediaMessageContent } from "wukongimjssdk";
import { MessageCell, MessageBaseCellProps } from "@tsdaodao/base";
import "./index.css";
export declare class FileContent extends MediaMessageContent {
    size?: number;
    name?: string;
    constructor(file?: File);
    decodeJSON(content: any): void;
    encodeJSON(): {
        size: number;
        name: string;
        url: string;
    };
    get contentType(): number;
    get conversationDigest(): string;
    set url(url: string);
    get url(): string;
}
export declare class FileCell extends MessageCell<MessageBaseCellProps> {
    fileIconInfo: any;
    constructor(props: any);
    render(): JSX.Element;
}
//# sourceMappingURL=index.d.ts.map