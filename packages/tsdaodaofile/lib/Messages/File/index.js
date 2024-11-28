import { MediaMessageContent } from "wukongimjssdk";
import React from "react";
import { MessageContentTypeConst, FileHelper, MessageCell, MessageBase, WKApp } from "@tsdaodao/base";
import "./index.css";
export class FileContent extends MediaMessageContent {
    constructor(file) {
        super();
        if (file) {
            this.file = file;
            this.size = file.size;
            this.name = file.name;
            this.extension = FileHelper.getFileExt(file.name);
        }
    }
    decodeJSON(content) {
        this.size = content["size"] || 0;
        this.name = content["name"] || "";
        this.url = content["url"] || '';
        this.remoteUrl = this.url;
    }
    encodeJSON() {
        return { "size": this.size || 0, "name": this.name || "", "url": this.remoteUrl || "" };
    }
    get contentType() {
        return MessageContentTypeConst.file;
    }
    get conversationDigest() {
        return "[文件]";
    }
    set url(url) {
        this.remoteUrl = url;
    }
    get url() {
        return this.remoteUrl;
    }
}
export class FileCell extends MessageCell {
    constructor(props) {
        super(props);
        const { message } = this.props;
        const content = message.content;
        this.fileIconInfo = FileHelper.getFileIconInfo(content.name || "");
    }
    render() {
        var _a, _b;
        const { message, context } = this.props;
        const content = message.content;
        const isSend = message.send;
        let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(content.url || '');
        if (downloadURL.indexOf("?") != -1) {
            downloadURL += "&filename=" + content.name;
        }
        else {
            downloadURL += "?filename=" + content.name;
        }
        return React.createElement(MessageBase, { context: context, message: message, bubbleStyle: { padding: '0px' } },
            React.createElement("div", { className: "wk-message-file", onClick: () => {
                    window.open(`${downloadURL}`, 'top');
                } },
                React.createElement("div", { className: "fileHeader", style: { backgroundColor: (_a = this.fileIconInfo) === null || _a === void 0 ? void 0 : _a.color, borderRadius: isSend ? "4px 0px 0px 4px" : "0px 4px 4px 0px" } },
                    React.createElement("img", { alt: "", src: (_b = this.fileIconInfo) === null || _b === void 0 ? void 0 : _b.icon, style: { width: '48px', height: '48px' } })),
                React.createElement("div", { className: "fileContent" },
                    React.createElement("div", { className: "name" }, content.name),
                    React.createElement("div", { className: "size" }, FileHelper.getFileSizeFormat(content.size || 0)))));
    }
}
