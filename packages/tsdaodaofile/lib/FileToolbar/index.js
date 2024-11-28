import { FileHelper, ImageContent, WKApp } from "@tsdaodao/base";
import React from "react";
import { Component } from "react";
import { FileContent } from "../Messages/File";
import "./index.css";
export default class FileToolbar extends Component {
    constructor(props) {
        super(props);
        this.onFileClick = (event) => {
            event.target.value = ''; // 防止选中一个文件取消后不能再选中同一个文件
        };
        this.chooseFile = () => {
            this.$fileInput.click();
        };
        this.state = {
            showDialog: false,
        };
    }
    componentDidMount() {
        let self = this;
        const { conversationContext } = this.props;
        this.pasteListen = function (event) {
            let files = event.clipboardData.files;
            if (files.length > 0) {
                self.showFile(files[0]);
            }
        };
        document.addEventListener('paste', this.pasteListen);
        conversationContext.setDragFileCallback((file) => {
            self.showFile(file);
        });
    }
    componentWillUnmount() {
        document.removeEventListener("paste", this.pasteListen);
    }
    onFileChange() {
        let file = this.$fileInput.files[0];
        this.showFile(file);
    }
    showFile(file) {
        const self = this;
        if (file.type && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (e) {
                self.setState({
                    file: file,
                    fileType: "image",
                    previewUrl: reader.result,
                    showDialog: true,
                });
            };
        }
        else {
            const fileIconInfo = FileHelper.getFileIconInfo(file.name);
            this.setState({
                fileType: 'file',
                fileIconInfo: fileIconInfo,
                file: file,
                showDialog: true,
                canSend: true,
            });
        }
    }
    onSend() {
        const { conversationContext } = this.props;
        const { file, previewUrl, width, height, fileType } = this.state;
        if (fileType === "image") {
            conversationContext.sendMessage(new ImageContent(file, previewUrl, width, height));
        }
        else {
            conversationContext.sendMessage(new FileContent(file));
        }
        this.setState({
            showDialog: false,
        });
    }
    onPreviewLoad(e) {
        let img = e.target;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        this.setState({
            width: width,
            height: height,
            canSend: true,
        });
    }
    render() {
        const { icon } = this.props;
        const { showDialog, canSend, fileIconInfo, file, fileType, previewUrl } = this.state;
        return React.createElement("div", { className: "wk-filetoolbar" },
            React.createElement("div", { className: "wk-filetoolbar-content", onClick: () => {
                    this.chooseFile();
                } },
                React.createElement("div", { className: "wk-filetoolbar-content-icon" },
                    React.createElement("img", { src: icon }),
                    React.createElement("input", { onClick: this.onFileClick, onChange: this.onFileChange.bind(this), ref: (ref) => { this.$fileInput = ref; }, type: "file", multiple: false, accept: "*", style: { display: 'none' } }))),
            showDialog ? (React.createElement(ImageDialog, { onSend: this.onSend.bind(this), onLoad: this.onPreviewLoad.bind(this), canSend: canSend, fileIconInfo: fileIconInfo, file: file, fileType: fileType, previewUrl: previewUrl, onClose: () => {
                    this.setState({
                        showDialog: !showDialog
                    });
                } })) : null);
    }
}
class ImageDialog extends Component {
    // 格式化文件大小
    getFileSizeFormat(size) {
        if (size < 1024) {
            return `${size} B`;
        }
        if (size > 1024 && size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        }
        if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)} M`;
        }
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)}G`;
    }
    render() {
        const { onClose, onSend, fileType, previewUrl, file, canSend, fileIconInfo, onLoad } = this.props;
        return React.createElement("div", { className: "wk-imagedialog" },
            React.createElement("div", { className: "wk-imagedialog-mask", onClick: onClose }),
            React.createElement("div", { className: "wk-imagedialog-content" },
                React.createElement("div", { className: "wk-imagedialog-content-close", onClick: onClose },
                    React.createElement("svg", { viewBox: "0 0 1024 1024", version: "1.1", xmlns: "http://www.w3.org/2000/svg", "p-id": "2683" },
                        React.createElement("path", { d: "M568.92178541 508.23169412l299.36805789-299.42461715a39.13899415 39.13899415 0 0 0 0-55.1452591L866.64962537 152.02159989a39.13899415 39.13899415 0 0 0-55.08869988 0L512.19286756 451.84213173 212.76825042 151.90848141a39.13899415 39.13899415 0 0 0-55.0886999 0L155.98277331 153.54869938a38.46028327 38.46028327 0 0 0 0 55.08869987L455.46394971 508.23169412 156.03933259 807.71287052a39.13899415 39.13899415 0 0 0 0 55.08869986l1.64021795 1.6967772a39.13899415 39.13899415 0 0 0 55.08869988 0l299.42461714-299.48117638 299.36805793 299.42461714a39.13899415 39.13899415 0 0 0 55.08869984 0l1.6967772-1.64021796a39.13899415 39.13899415 0 0 0 0-55.08869987L568.86522614 508.17513487z", "p-id": "2684" }))),
                React.createElement("div", { className: "wk-imagedialog-content-title" },
                    "\u53D1\u9001",
                    fileType === 'image' ? '图片' : '文件'),
                React.createElement("div", { className: "wk-imagedialog-content-body" },
                    fileType === 'image' ? (React.createElement("div", { className: "wk-imagedialog-content-preview" },
                        React.createElement("img", { alt: "", className: "wk-imagedialog-content-previewImg", src: previewUrl, onLoad: onLoad }))) : (React.createElement("div", { className: "wk-imagedialog-content-preview" },
                        React.createElement("div", { className: "wk-imagedialog-content-preview-file" },
                            React.createElement("div", { className: "wk-imagedialog-content-preview-file-icon", style: { backgroundColor: fileIconInfo === null || fileIconInfo === void 0 ? void 0 : fileIconInfo.color } },
                                React.createElement("img", { alt: "", className: "wk-imagedialog-content-preview-file-thumbnail", src: fileIconInfo === null || fileIconInfo === void 0 ? void 0 : fileIconInfo.icon })),
                            React.createElement("div", { className: "wk-imagedialog-content-preview--filecontent" },
                                React.createElement("div", { className: "wk-imagedialog-content-preview--filecontent-name" }, file === null || file === void 0 ? void 0 : file.name),
                                React.createElement("div", { className: "wk-imagedialog-content-preview--filecontent-size" }, this.getFileSizeFormat(file === null || file === void 0 ? void 0 : file.size)))))),
                    React.createElement("div", { className: "wk-imagedialog-footer" },
                        React.createElement("button", { onClick: onClose }, "\u53D6\u6D88"),
                        React.createElement("button", { onClick: onSend, className: "wk-imagedialog-footer-okbtn", disabled: !canSend, style: { backgroundColor: canSend ? WKApp.config.themeColor : 'gray' } }, "\u53D1\u9001")))));
    }
}
