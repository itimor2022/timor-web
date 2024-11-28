import { ChannelTypeCustomerService, WKApp, ListItemSwitch, Row, Section } from "@tsdaodao/base";
import { ChannelSettingManager } from "@tsdaodao/base/src/Service/ChannelSetting";
export default class AdvancedModule {
    id() {
        return "AdvancedModule";
    }
    init() {
        console.log("【AdvancedModule】初始化");
        // 消息回执
        WKApp.shared.channelSettingRegister("channel.setting.recepit", (context) => {
            const data = context.routeData();
            const channelInfo = data.channelInfo;
            const channel = data.channel;
            const rows = new Array();
            if (channel.channelType == ChannelTypeCustomerService) {
                return;
            }
            rows.push(new Row({
                cell: ListItemSwitch,
                properties: {
                    title: "消息回执",
                    checked: (channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.orgData.receipt) === 1,
                    onCheck: (v, ctx) => {
                        ctx.loading = true;
                        ChannelSettingManager.shared.receipt(v, channel).then(() => {
                            ctx.loading = false;
                            data.refresh();
                        }).catch(() => {
                            ctx.loading = false;
                        });
                    }
                },
            }));
            return new Section({
                rows: rows,
            });
        }, 3100);
    }
}
