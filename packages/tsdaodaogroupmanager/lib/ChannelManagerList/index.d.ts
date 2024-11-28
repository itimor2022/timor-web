import { Component, ReactNode } from "react";
import { ChannelSettingRouteData } from "@tsdaodao/base";
import "./index.css";
import RouteContext from "@tsdaodao/base/src/Service/Context";
export interface ChannelManagerListProps {
    routeContext: RouteContext<ChannelSettingRouteData>;
}
export default class ChannelManagerList extends Component<ChannelManagerListProps> {
    render(): ReactNode;
}
//# sourceMappingURL=index.d.ts.map