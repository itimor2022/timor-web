import { SubscriberChangeListener } from "wukongimjssdk";
import { Component, ReactNode } from "react";
import "./index.css";
import RouteContext from "@tsdaodao/base/src/Service/Context";
import { ChannelSettingRouteData } from "@tsdaodao/base";
export interface ChannelBlacklistProps {
    routeContext: RouteContext<ChannelSettingRouteData>;
}
export default class ChannelBlacklist extends Component<ChannelBlacklistProps> {
    subscriberChangeListener: SubscriberChangeListener;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): ReactNode;
}
//# sourceMappingURL=index.d.ts.map