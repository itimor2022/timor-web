import { Toast } from "@douyinfe/semi-ui";
import React from "react";
import { Component } from "react";
import { WKApp } from "@tsdaodao/base";
import { GroupRole, SubscriberStatus } from "@tsdaodao/base";
import { IndexTableItem } from "@tsdaodao/base";
import "./index.css";
import SmallTableEdit from "@tsdaodao/base/src/Components/SmallTableEdit";
import UserSelect from "@tsdaodao/base/src/Components/UserSelect";
export default class ChannelManagerList extends Component {
    render() {
        const { routeContext } = this.props;
        const data = routeContext.routeData();
        return React.createElement("div", { className: "wk-channelmanagerlist" },
            React.createElement(SmallTableEdit, { addTitle: "\u6DFB\u52A0\u7BA1\u7406\u5458", items: data.subscribers.filter((s) => {
                    return s.role === GroupRole.manager || s.role === GroupRole.owner;
                }).map((subscriber) => {
                    return {
                        id: subscriber.uid,
                        icon: WKApp.shared.avatarUser(subscriber.uid),
                        name: subscriber.remark || subscriber.name,
                        showAction: subscriber.role !== GroupRole.owner,
                        onAction: () => {
                            WKApp.dataSource.channelDataSource.managerRemove(data.channel, [subscriber.uid]).catch((err) => {
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
                        title: "选择管理员",
                        showFinishButton: true,
                        onFinish: async () => {
                            btnContext.loading(true);
                            await WKApp.dataSource.channelDataSource.managerAdd(data.channel, selectItems.map((item) => {
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
