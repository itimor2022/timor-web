import { ConversationContext } from "@tsdaodao/base";
import { Component, ReactNode } from "react";
import "./index.css";
interface FileToolbarProps {
    conversationContext: ConversationContext;
    icon: string;
}
interface FileToolbarState {
    showDialog: boolean;
    file?: any;
    fileType?: string;
    previewUrl?: any;
    fileIconInfo?: any;
    canSend?: boolean;
    width?: number;
    height?: number;
}
export default class FileToolbar extends Component<FileToolbarProps, FileToolbarState> {
    pasteListen: (event: any) => void;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    $fileInput: any;
    onFileClick: (event: any) => void;
    onFileChange(): void;
    chooseFile: () => void;
    showFile(file: any): void;
    onSend(): void;
    onPreviewLoad(e: any): void;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=index.d.ts.map