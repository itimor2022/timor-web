import { Channel } from "wukongimjssdk";
import React from "react";
import { Component } from "react";
import { ChannelInfoListener, SubscriberChangeListener } from "wukongimjssdk";
import RouteContext from "@tsdaodao/base/src/Service/Context";
import { ChannelSettingRouteData } from "@tsdaodao/base";
export interface ChannelManageProps {
    channel: Channel;
    context: RouteContext<ChannelSettingRouteData>;
}
export interface ChannelManageState {
}
export default class ChannelManage extends Component<ChannelManageProps, ChannelManageState> {
    channelInfoListener: ChannelInfoListener;
    subscriberChangeListener?: SubscriberChangeListener;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=manage.d.ts.map