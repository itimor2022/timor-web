import { MessageContentTypeConst, WKApp } from "@tsdaodao/base";
import { IModule } from "@tsdaodao/base";
import React, { ElementType } from "react";
import WKSDK, {
  CMDContent,
  Channel,
  ChannelTypePerson,
  Message,
} from "wukongimjssdk";
import P2PCall from "./P2pcall";
import { RTCDataContent } from "./Messages/rtcdata";
import {
  AuidoCallManager,
  P2PCallStatus,
  P2pCallManager,
} from "./P2pcall/manager";
import { CallSystemCell, CallSystemContent } from "./Messages/system";
import { WKRTCCallType } from "./P2pcall/signalingChannel";
import { Toast } from "@douyinfe/semi-ui";

declare const Owt: any;

/**
 * 拨打语音/视频
 * @param channelID
 * @param CallType
 */
export const RTCCall = (channelID: string, CallType: WKRTCCallType) => {
  P2pCallManager.shared().setupCall(channelID, CallType, true);
  P2pCallManager.shared().invite();
  WKApp.shared.baseContext.showGlobalModal({
    body: (
      <P2PCall
        uid={channelID}
        onHangup={async () => {
          const isActive = true;
          if (
            P2pCallManager.shared().status == P2PCallStatus.Calling &&
            isActive
          ) {
            await P2pCallManager.shared().refuse();
          } else {
            await P2pCallManager.shared().hangup(isActive);
          }

          P2pCallManager.shared().close();
          WKApp.shared.baseContext.hideGlobalModal();
        }}
        onAnswer={async () => {
          P2pCallManager.shared().status = P2PCallStatus.Answering;
          await P2pCallManager.shared().accept();
        }}
      ></P2PCall>
    ),
    className: "wk-p2pcall-modal",
    closable: false,
  }); // 显示全局弹窗
};

export default class RTCModule implements IModule {
  notify?: Notification;

  id(): string {
    return "RTCModule";
  }

  async handleHangup(isActive: boolean) {
    if (this.notify && this.notify.close) {
      this.notify.close();
      this.notify = undefined;
    }
    if (P2pCallManager.shared().status == P2PCallStatus.Calling && isActive) {
      await P2pCallManager.shared().refuse();
    } else {
      await P2pCallManager.shared().hangup(isActive);
    }
    this.handleClose();
  }

  handleClose() {
    P2pCallManager.shared().close();
    WKApp.shared.baseContext.hideGlobalModal();
  }

  async handleAnswer() {
    P2pCallManager.shared().status = P2PCallStatus.Answering;
    await P2pCallManager.shared().accept();
  }

  recvCallNotification(fromUID: string, callType: WKRTCCallType) {
    const channel = new Channel(fromUID, ChannelTypePerson);
    let channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel);
    if (!channelInfo) {
      return;
    }
    const self = this;
    if (window.Notification && Notification.permission !== "denied") {
      this.notify = new Notification(
        channelInfo ? channelInfo.orgData.displayName : "通知",
        {
          body: `${channelInfo.title}正在呼叫您`,
          icon: WKApp.shared.avatarChannel(channel),
          lang: "zh-CN",
          tag: "tag",
          // renotify: true
        }
      );

      this.notify.onclick = () => {
        self.notify!.close();
        window.focus();
        WKApp.endpoints.showConversation(channel);
      };
      this.notify.onshow = () => {
        console.log("通知显示");
      };
      this.notify.onclose = () => {
        console.log("通知关闭");
      };
    }
  }

  // 发送通话被其他设备接听的通知
  sendAnsweredByOtherDeviceNotification() {
    const self = this;
    if (window.Notification && Notification.permission !== "denied") {
      const notify = new Notification("通知", {
        body: `通话被其他设备接听`,
        lang: "zh-CN",
        tag: "tag",
        // renotify: true
      });

      notify.onclick = () => {
        self.notify!.close();
      };
      notify.onshow = () => {
        console.log("通知显示");
      };
      notify.onclose = () => {
        console.log("通知关闭");
      };
    }
  }

  init(): void {
    WKSDK.shared().register(
      MessageContentTypeConst.rtcData,
      () => new RTCDataContent()
    );

    WKSDK.shared().register(
      MessageContentTypeConst.rtcResult,
      () => new CallSystemContent(MessageContentTypeConst.rtcResult)
    );
    WKSDK.shared().register(
      MessageContentTypeConst.rtcSwitchToVideo,
      () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideo)
    );
    WKSDK.shared().register(
      MessageContentTypeConst.rtcSwitchToVideoReply,
      () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideoReply)
    );

    WKApp.messageManager.registerCell(
      MessageContentTypeConst.rtcResult,
      () => CallSystemCell
    );
    WKApp.messageManager.registerCell(
      MessageContentTypeConst.rtcSwitchToVideo,
      () => CallSystemCell
    );
    WKApp.messageManager.registerCell(
      MessageContentTypeConst.rtcSwitchToVideoReply,
      () => CallSystemCell
    );

    WKSDK.shared().conversationManager.addNoUpdateContentType(
      MessageContentTypeConst.rtcData
    );

    // 注入语音通话
    WKApp.endpoints.registerChannelHeaderRightItem(
      "rtc.p2p.call.audio",
      (param) => {
        const channel = param.channel;
        if (channel.channelType != ChannelTypePerson) {
          return undefined;
        }
        const self = this;
        return (
          <div
            onClick={ (event) => {
              event.stopPropagation();
              console.log(channel);
              // 在Mac获取语音权限
              if ((window as any).__POWERED_ELECTRON__) {
                console.log('在Mac获取语音权限');
                (window as any).ipc.send('get-media-access-status', 'microphone')
              }
              P2pCallManager.shared().setupCall(
                channel.channelID,
                WKRTCCallType.Audio,
                true
              );
              P2pCallManager.shared().invite();
              WKApp.shared.baseContext.showGlobalModal({
                body: (
                  <P2PCall
                    uid={channel.channelID}
                    onHangup={() => {
                      self.handleHangup(true);
                    }}
                    onAnswer={async () => {
                      await self.handleAnswer();
                    }}
                  ></P2PCall>
                ),
                className: "wk-p2pcall-modal",
                closable: false,
              }); // 显示全局弹窗
            }}
          >
            <svg
              fill={WKApp.config.themeColor}
              height="30px"
              role="presentation"
              viewBox="0 0 36 36"
              width="30px"
            >
              <path d="M25.753 28.2c1.07-.357 1.816-1.275 2.423-2.225a2.05 2.05 0 00.037-2.151 4.998 4.998 0 00-.723-.963 11.594 11.594 0 00-2.888-2.112c-.58-.299-1.272-.212-1.808.159l-2.098 1.452a.472.472 0 01-.437.055 11.557 11.557 0 01-4.045-2.63 11.554 11.554 0 01-2.63-4.044.472.472 0 01.056-.437l1.453-2.098c.37-.536.457-1.228.158-1.807A11.587 11.587 0 0013.14 8.51a4.995 4.995 0 00-.963-.723 2.05 2.05 0 00-2.15.037c-.951.607-1.87 1.353-2.225 2.424-1.174 3.527 1.187 8.461 5.338 12.613 4.152 4.151 9.086 6.512 12.614 5.338z"></path>
            </svg>
            <div className="wk-conversation-header-mask"></div>
          </div>
        );
      }
    );
    // 注入视频通话
    WKApp.endpoints.registerChannelHeaderRightItem(
      "rtc.p2p.call.video",
      (param) => {
        const channel = param.channel;
        if (channel.channelType != ChannelTypePerson) {
          return undefined;
        }
        const self = this;
        return (
          <div
            onClick={(event) => {
              event.stopPropagation();
              // 在Mac获取相机权限
              if ((window as any).__POWERED_ELECTRON__) {
                console.log('在Mac获取相机权限');
                (window as any).ipc.send('get-media-access-status', 'camera')
              }
              P2pCallManager.shared().setupCall(
                channel.channelID,
                WKRTCCallType.Video,
                true
              );
              P2pCallManager.shared().invite();
              WKApp.shared.baseContext.showGlobalModal({
                body: (
                  <P2PCall
                    uid={channel.channelID}
                    onHangup={() => {
                      self.handleHangup(true);
                    }}
                    onAnswer={async () => {
                      await self.handleAnswer();
                    }}
                  ></P2PCall>
                ),
                className: "wk-p2pcall-modal",
                closable: false,
              }); // 显示全局弹窗
            }}
          >
            <svg
              fill={WKApp.config.themeColor}
              height="34px"
              role="presentation"
              viewBox="0 0 36 36"
              width="34px"
            >
              <path d="M9 9.5a4 4 0 00-4 4v9a4 4 0 004 4h10a4 4 0 004-4v-9a4 4 0 00-4-4H9zm16.829 12.032l3.723 1.861A1 1 0 0031 22.5v-9a1 1 0 00-1.448-.894l-3.723 1.861A1.5 1.5 0 0025 15.81v4.38a1.5 1.5 0 00.829 1.342z"></path>
            </svg>
            <div className="wk-conversation-header-mask"></div>
          </div>
        );
      }
    );

    WKSDK.shared().chatManager.addCMDListener((message) => {
      const cmd = message.content as CMDContent;
      const param = cmd.param;
      switch (cmd.cmd) {
        case "rtc.p2p.invoke":
          if (P2pCallManager.shared().status == P2PCallStatus.Talking) {
            console.log("正在通话中，忽略呼叫");
            return;
          }
          var fromUID = param.from_uid;
          if (fromUID === WKApp.loginInfo.uid) {
            return;
          }
          this.recvCallNotification(fromUID, param.call_type);
          P2pCallManager.shared().setupCall(fromUID, param.call_type, false);
          WKApp.shared.baseContext.showGlobalModal({
            body: (
              <P2PCall
                uid={param.from_uid}
                onHangup={() => {
                  this.handleHangup(true);
                }}
                onAnswer={async () => {
                  await this.handleAnswer();
                }}
              ></P2PCall>
            ),
            className: "wk-p2pcall-modal",
            closable: false,
          }); // 显示全局弹窗
          break;
        case "rtc.p2p.accept":
          var fromUID = param.from_uid;
          if (fromUID === WKApp.loginInfo.uid) {
            // 说明被其他设备接收
            if (P2pCallManager.shared().status != P2PCallStatus.Calling) {
              return;
            }
            this.handleClose();
            Toast.info({
              content: "通话被其他设备接听",
              duration: 3,
            });
            this.sendAnsweredByOtherDeviceNotification();
            return;
          }

          break;
        case "rtc.p2p.cancel":
          var fromUID = param.uid;
          if (fromUID !== P2pCallManager.shared().fromUID) {
            return;
          }
          this.handleHangup(false);
          WKApp.shared.baseContext.hideGlobalModal();
          break;
        case "rtc.p2p.hangup":
          var fromUID = param.uid;
          if (fromUID !== P2pCallManager.shared().fromUID) {
            return;
          }
          this.handleHangup(false);
          WKApp.shared.baseContext.hideGlobalModal();
          break;
        case "rtc.p2p.refuse":
          var fromUID = param.uid;
          if (fromUID !== P2pCallManager.shared().fromUID) {
            return;
          }
          this.handleHangup(false);
          WKApp.shared.baseContext.hideGlobalModal();
          break;
      }
    });

    WKSDK.shared().chatManager.addMessageListener((message) => {
      const contentType = message.contentType;
      switch (contentType) {
        case MessageContentTypeConst.rtcResult:
          var fromUID = message.fromUID;
          if (fromUID !== P2pCallManager.shared().fromUID) {
            return;
          }
          this.handleHangup(false);
          break;

        default:
          break;
      }
    });
  }
}
