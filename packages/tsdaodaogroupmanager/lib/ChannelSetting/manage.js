import { ChannelTypePerson, WKSDK } from "wukongimjssdk";
import React from "react";
import { Component } from "react";
import { WKApp } from "@tsdaodao/base";
import Sections from "@tsdaodao/base/src/Components/Sections";
export default class ChannelManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sections: [],
        };
    }
    componentDidMount() {
        const { channel } = this.props;
        if (channel.channelType !== ChannelTypePerson) {
            this.subscriberChangeListener = () => {
                this.setState({});
            };
            WKSDK.shared().channelManager.addSubscriberChangeListener(this.subscriberChangeListener);
            // WKSDK.shared().channelManager.syncSubscribes(this.channel)
        }
        this.channelInfoListener = (channelInfo) => {
            this.setState({});
        };
        WKSDK.shared().channelManager.addListener(this.channelInfoListener);
    }
    componentWillUnmount() {
        if (this.subscriberChangeListener) {
            WKSDK.shared().channelManager.removeSubscriberChangeListener(this.subscriberChangeListener);
        }
        WKSDK.shared().channelManager.removeListener(this.channelInfoListener);
    }
    render() {
        const { context } = this.props;
        context.routeData().refresh = () => {
            this.setState({});
        };
        return React.createElement("div", { className: "wk-channelmanage" }, React.createElement(Sections, { sections: WKApp.shared.channelManages(context) }));
    }
}
