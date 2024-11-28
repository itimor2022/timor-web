import { Toast } from "@douyinfe/semi-ui";
import { WKSDK } from "wukongimjssdk";
import React from "react";
import { Component } from "react";
import "./index.css";
import SmallTableEdit from "@tsdaodao/base/src/Components/SmallTableEdit";
import { GroupRole, IndexTableItem, SubscriberStatus, WKApp } from "@tsdaodao/base";
import UserSelect from "@tsdaodao/base/src/Components/UserSelect";
export default class ChannelBlacklist extends Component {
    componentDidMount() {
        this.subscriberChangeListener = () => {
            this.setState({});
        };
        WKSDK.shared().channelManager.addSubscriberChangeListener(this.subscriberChangeListener);
    }
    componentWillUnmount() {
        WKSDK.shared().channelManager.removeSubscriberChangeListener(this.subscriberChangeListener);
    }
    render() {
        const { routeContext } = this.props;
        const data = routeContext.routeData();
        return React.createElement("div", { className: "wk-channelblacklist" },
            React.createElement(SmallTableEdit, { addTitle: "\u6DFB\u52A0\u9ED1\u540D\u5355", items: data.subscriberAll.filter((s) => s.status === SubscriberStatus.blacklist).map((subscriber) => {
                    return {
                        id: subscriber.uid,
                        icon: subscriber.avatar,
                        name: subscriber.remark || subscriber.name,
                        showAction: true,
                        onAction: () => {
                            WKApp.dataSource.channelDataSource.blacklistRemove(data.channel, [subscriber.uid]).catch((err) => {
                                Toast.error(err.msg);
                            });
                        }
                    };
                }), onAdd: () => {
                    var btnContext;
                    var selectItems = [];
                    routeContext.push(React.createElement(UserSelect, { onSelect: (items) => {
                            if (items.length === 0) {
                                btnContext.disable(true);
                            }
                            else {
                                btnContext.disable(false);
                            }
                            selectItems = items;
                        }, users: data.subscribers.filter((subscriber) => subscriber.role !== GroupRole.manager && subscriber.role !== GroupRole.owner && subscriber.status === SubscriberStatus.normal).map((item) => {
                            return new IndexTableItem(item.uid, item.name, item.avatar);
                        }) }), {
                        title: "选择成员",
                        showFinishButton: true,
                        onFinish: async () => {
                            btnContext.loading(true);
                            await WKApp.dataSource.channelDataSource.blacklistAdd(data.channel, selectItems.map((item) => {
                                return item.id;
                            })).catch((err) => {
                                Toast.error(err.msg);
                            });
                            btnContext.loading(false);
                            routeContext.pop();
                        },
                        onFinishContext: (context) => {
                            btnContext = context;
                            btnContext.disable(true);
                        }
                    });
                } }));
    }
}
