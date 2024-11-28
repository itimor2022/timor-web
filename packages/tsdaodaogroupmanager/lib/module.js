import { WKApp, GroupRole, Row, ListItem, Section, IndexTableItem, ListItemSwitch, ListItemButton, ListItemButtonType } from "@tsdaodao/base";
import { ChannelTypeGroup } from "wukongimjssdk";
import React from "react";
import ChannelManage from "./ChannelSetting/manage";
import { RouteContextConfig } from "@tsdaodao/base/src/Service/Context";
import UserSelect from "@tsdaodao/base/src/Components/UserSelect";
import { ChannelSettingManager } from "@tsdaodao/base/src/Service/ChannelSetting";
import ChannelBlacklist from "./ChannelBlacklist";
import ChannelManagerList from "./ChannelManagerList";
import { Toast } from "@douyinfe/semi-ui";
export default class GroupManagerModule {
    id() {
        return "GroupManagerModule";
    }
    init() {
        console.log("【GroupManagerModule】初始化");
        // 群管理
        WKApp.shared.channelSettingRegister("channel.setting.groupmanager", (context) => {
            const data = context.routeData();
            const channelInfo = data.channelInfo;
            const channel = data.channel;
            if (channel.channelType !== ChannelTypeGroup) {
                return undefined;
            }
            const rows = new Array();
            const subscriberOfMe = data.subscriberOfMe;
            if ((subscriberOfMe === null || subscriberOfMe === void 0 ? void 0 : subscriberOfMe.role) === GroupRole.owner || (subscriberOfMe === null || subscriberOfMe === void 0 ? void 0 : subscriberOfMe.role) === GroupRole.manager) {
                rows.push(new Row({
                    cell: ListItem,
                    properties: {
                        title: "群管理",
                        onClick: () => {
                            context.push(React.createElement(ChannelManage, { channel: channel, context: context }), new RouteContextConfig({
                                title: "群管理",
                            }));
                        }
                    },
                }));
            }
            if (rows.length === 0) {
                return undefined;
            }
            return new Section({
                rows: rows,
            });
        }, 2000);
        this.registerChannelManages();
    }
    registerChannelManages() {
        WKApp.shared.channelManageRegister("channel.setting.manage.invite", (context) => {
            var _a;
            const data = context.routeData();
            const channel = data.channel;
            const channelInfo = data.channelInfo;
            return new Section({
                subtitle: "启用后，群成员需要群主或管理员确认才能邀请朋友进群。扫描二维码进群将同时停用。",
                rows: [
                    new Row({
                        cell: ListItemSwitch,
                        properties: {
                            title: "群聊邀请确认",
                            checked: ((_a = channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.orgData) === null || _a === void 0 ? void 0 : _a.invite) === 1,
                            onCheck: (v, ctx) => {
                                ctx.loading = true;
                                ChannelSettingManager.shared
                                    .invite(v, channel)
                                    .then(() => {
                                    ctx.loading = false;
                                    data.refresh();
                                })
                                    .catch((err) => {
                                    ctx.loading = false;
                                });
                            },
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.transfer", (context) => {
            const data = context.routeData();
            const channel = data.channel;
            const subscriberOfMe = data.subscriberOfMe;
            if (!subscriberOfMe || subscriberOfMe.role !== GroupRole.owner) {
                return;
            }
            return new Section({
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "群主管理权转让",
                            onClick: () => {
                                context.push(React.createElement(UserSelect, { cantMulit: true, onSelect: (items) => {
                                        const item = items[0];
                                        WKApp.shared.baseContext.showAlert({
                                            content: "你将自动放弃群主身份",
                                            onOk: () => {
                                                WKApp.dataSource.channelDataSource
                                                    .channelTransferOwner(channel, item.id)
                                                    .then(() => {
                                                    context.popToRoot();
                                                })
                                                    .catch((err) => {
                                                    Toast.error(err.msg);
                                                });
                                            },
                                        });
                                    }, users: data.subscribers
                                        .filter((subscriber) => !(subscriber.uid === WKApp.loginInfo.uid ||
                                        subscriber.uid === WKApp.config.fileHelperUID ||
                                        subscriber.uid === WKApp.config.systemUID))
                                        .map((item) => {
                                        return new IndexTableItem(item.uid, item.name, item.avatar);
                                    }) }), {
                                    title: "选择新的群主",
                                    showFinishButton: false,
                                    onFinish: async () => {
                                        context.pop();
                                    },
                                    onFinishContext: (context) => { },
                                });
                            },
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.mute", (context) => {
            var _a;
            const data = context.routeData();
            const channel = data.channel;
            const channelInfo = data.channelInfo;
            return new Section({
                title: "成员设置",
                subtitle: "全员禁言启用后，只允许群主和管理员发言。",
                rows: [
                    new Row({
                        cell: ListItemSwitch,
                        properties: {
                            title: "全员禁言",
                            checked: ((_a = channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.orgData) === null || _a === void 0 ? void 0 : _a.forbidden) === 1,
                            onCheck: (v, ctx) => {
                                ctx.loading = true;
                                ChannelSettingManager.shared
                                    .forbidden(v, channel)
                                    .then(() => {
                                    ctx.loading = false;
                                    data.refresh();
                                })
                                    .catch((err) => {
                                    ctx.loading = false;
                                });
                            },
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.prohibitAddFriend", (context) => {
            var _a;
            const data = context.routeData();
            const channel = data.channel;
            const channelInfo = data.channelInfo;
            return new Section({
                rows: [
                    new Row({
                        cell: ListItemSwitch,
                        properties: {
                            title: "禁止群成员互加好友",
                            checked: ((_a = channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.orgData) === null || _a === void 0 ? void 0 : _a.forbidden_add_friend) === 1,
                            onCheck: (v, ctx) => {
                                ctx.loading = true;
                                ChannelSettingManager.shared
                                    .forbiddenAddFriend(v, channel)
                                    .then(() => {
                                    ctx.loading = false;
                                    data.refresh();
                                })
                                    .catch((err) => {
                                    ctx.loading = false;
                                });
                            },
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.blacklist", (context) => {
            return new Section({
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "群黑名单",
                            onClick: () => {
                                context.push(React.createElement(ChannelBlacklist, { routeContext: context }), {
                                    title: "群黑名单",
                                });
                            },
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.managerlist", (context) => {
            const data = context.routeData();
            const subscriberOfMe = data.subscriberOfMe;
            if ((subscriberOfMe === null || subscriberOfMe === void 0 ? void 0 : subscriberOfMe.role) !== GroupRole.owner) {
                return;
            }
            return new Section({
                title: "群主、管理员",
                rows: [
                    new Row({
                        cell: ChannelManagerList,
                        properties: {
                            routeContext: context,
                        },
                    }),
                ],
            });
        });
        WKApp.shared.channelManageRegister("channel.setting.manage.disband", (context) => {
            const data = context.routeData();
            if (data.channel.channelType !== ChannelTypeGroup) {
                return;
            }
            const subscriberOfMe = data.subscriberOfMe;
            if ((subscriberOfMe === null || subscriberOfMe === void 0 ? void 0 : subscriberOfMe.role) !== GroupRole.owner) {
                return;
            }
            return new Section({
                rows: [
                    new Row({
                        cell: ListItemButton,
                        properties: {
                            title: "解散群聊",
                            type: ListItemButtonType.warn,
                            onClick: () => {
                                WKApp.shared.baseContext.showAlert({
                                    content: "解散群聊后，群成员和群主都将被移除群聊。",
                                    onOk: async () => {
                                        WKApp.apiClient.delete(`groups/${data.channel.channelID}/disband`).then(() => {
                                            context.popToRoot();
                                        }).catch((err) => {
                                            Toast.error(err.msg);
                                        });
                                    },
                                });
                            }
                        },
                    }),
                ],
            });
        });
    }
}
