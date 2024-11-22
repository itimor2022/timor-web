

import { MessageContentTypeConst } from "@tsdaodao/base";
import { MessageContent } from "wukongimjssdk";


export class RTCDataContent extends MessageContent {
    data!: string

    encodeJSON() {
        return {
            content: this.data,
        }
    }
    decodeJSON(content: any): void {
        this.data = content["content"]
    }

    get contentType(): number {
        return MessageContentTypeConst.rtcData
    }

}