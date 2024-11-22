import { WKApp } from "@tsdaodao/base";
import { P2pCallAPI, SignalingChannel, WKRTCCallType } from "./signalingChannel";


export enum P2PCallStatus {
    None,
    Calling,
    Answering,
    Talking,
    Hangup
}

declare const Owt: any;

export class P2pCallManager {

    public status: P2PCallStatus = P2PCallStatus.None


    private static instance: P2pCallManager;
    p2p!: any
    localStream?: any
    publicationForCamera?: any
    fromUID!: string
    callType!: WKRTCCallType
    isCaller!: boolean // 是否是主动呼叫者
    startAnswerTime?: Date // 开始呼叫时间
    isConnected?: boolean // 是否已经连接
    stopped?: boolean // 是否已经挂断
    ringtoneElement?: HTMLAudioElement
    hangupElement?: HTMLAudioElement
    onStreamadded?: (e: any) => void
    localStreamIsPublished?: boolean

    static shared(): P2pCallManager {
        if (!P2pCallManager.instance) {
            P2pCallManager.instance = new P2pCallManager();
        }
        return P2pCallManager.instance;
    }

    initP2p() {
        // Please change this STUN and TURN server information.
        const rtcConfiguration = {
            iceServers: [{
                urls: [
                    'turn:18.167.189.182:3478?transport=udp',
                ],
                credential: 'password1',
                username: 'user1',
            }],
        };
        this.p2p = new Owt.P2P.P2PClient({
            audioEncodings: true,
            videoEncodings: [{
                codec: {
                    name: 'h264',
                },
            }, {
                codec: {
                    name: 'vp9',
                },
            }, {
                codec: {
                    name: 'vp8',
                },
            }],
            rtcConfiguration,
        }, new SignalingChannel());

        const self = this

        this.p2p.addEventListener('streamadded', async (e: any) => {
            console.log("streamadded---->")
            self.status = P2PCallStatus.Talking
            if (self.onStreamadded) {
                self.onStreamadded(e)
            }
            self.startAnswerTime = new Date()
        })

        this.p2p.addEventListener('messagereceived', (e:any) => { 
            console.log("messagereceived------------------>", e)
        });

        console.log("----this.p2p---->", this.p2p)

    }

    setupCall(fromUID: string, callType: WKRTCCallType, isCaller: boolean) {
        this.status = P2PCallStatus.Calling
        this.fromUID = fromUID
        this.callType = callType
        this.isCaller = isCaller
        this.stopped = false
        this.localStreamIsPublished = false
        this.initP2p()
    }

    connect() {
        this.isConnected = true
        return this.p2p.connect({ host: "xxx", token: "kksd" })
    }

    getLocalStream(): Promise<any> {
        const self = this
        if (this.localStream) {
            return new Promise((resolve) => {
                return resolve(self.localStream)
            })
        }

        return new Promise((resolve, reject) => {
            const audioConstraintsForMic = new Owt.Base.AudioTrackConstraints(
                Owt.Base.AudioSourceInfo.MIC);
            const videoConstraintsForCamera = new Owt.Base
                .VideoTrackConstraints(Owt.Base.VideoSourceInfo.CAMERA);

            var streamConstraints: any;
            if (self.callType == WKRTCCallType.Audio) {
                streamConstraints = new Owt.Base
                    .StreamConstraints(audioConstraintsForMic,videoConstraintsForCamera);
                streamConstraints.video = false
            } else {
                streamConstraints = new Owt.Base
                    .StreamConstraints(audioConstraintsForMic,
                        videoConstraintsForCamera);
                streamConstraints.video = true
            }

            let mediaStream;
            Owt.Base.MediaStreamFactory.createMediaStream(streamConstraints).then((stream: any) => {
                mediaStream = stream;
                var cameraSource = 'camera'
                if (self.callType == WKRTCCallType.Video) {
                    cameraSource = 'camera'
                }
                self.localStream = new Owt.Base.LocalStream(mediaStream, new Owt
                    .Base.StreamSourceInfo('mic', cameraSource));
                resolve(self.localStream)
            }, (err: any) => {
                console.error('Failed to create MediaStream, ' + err);
                reject(err)
            });
        })

    }

    pulishLocalStream(toUID: string, localStream: any): Promise<any> {
        console.log("pulishLocalStream---->")
        if (this.localStreamIsPublished) {
            return new Promise((resolve) => {
                return resolve(null)
            })
        }
        this.localStreamIsPublished = true
        const self = this
        return new Promise((resolve, reject) => {
            console.log("this.p2p----->", self.p2p, self)
            self.p2p.publish(toUID, localStream).then((publication: any) => {
                self.publicationForCamera = publication;
                resolve(null)
            }, (error: any) => {
                console.log('Failed to share video.', error);
                reject(error)
            });
        })
    }

    async accept() {
        this.p2p.allowedRemoteIds = [this.fromUID, WKApp.loginInfo.uid || ""];
        await P2pCallManager.shared().connect()
        return P2pCallAPI.shared().accept(this.fromUID, this.callType)
    }

    async invite() {
        this.p2p.allowedRemoteIds = [this.fromUID, WKApp.loginInfo.uid || ""];
        await P2pCallManager.shared().connect()
        return P2pCallAPI.shared().invite(this.fromUID, this.callType)
    }

    refuse() {
        return P2pCallAPI.shared().refuse(this.fromUID, this.callType)
    }

    getCallSeconds() {
        if (!this.startAnswerTime) {
            return 0
        }
        const endAnswerTime = new Date()
        const diff = endAnswerTime.getTime() - this.startAnswerTime.getTime()
        const second = Math.floor(diff / 1000)
        return second
    }
    formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    hangup(isActive: boolean) {
        if (!isActive) {
            return
        }
        const endAnswerTime = new Date()
        const diff = endAnswerTime.getTime() - this.startAnswerTime!.getTime()
        const second = Math.floor(diff / 1000)

        return P2pCallAPI.shared().hangup(this.fromUID, second, this.callType, this.isCaller)
    }

    async close() {
        if (this.stopped) {
            return
        }
        console.log("rtc close---->")
        this.stopped = true
        this.startAnswerTime = undefined

        if (this.publicationForCamera) {
            this.publicationForCamera.stop()
            this.publicationForCamera = null
        }

        if (this.localStream) {
            for (const track of this.localStream.mediaStream.getTracks()) {
                track.stop();
            }
            this.localStream = undefined
        }


        this.status = P2PCallStatus.None
        if (this.p2p) {
            if (this.isConnected) {
                await this.p2p.stop(this.fromUID)
                await this.p2p.disconnect()
            }

            this.p2p.clearEventListener("streamadded")
            this.p2p.clearEventListener("messagereceived")
            this.p2p = null
        }
        this.isConnected = false

    }


}

export class AuidoCallManager {
    private static instance: AuidoCallManager;
    ringtoneElement?: HTMLAudioElement
    hangupElement?: HTMLAudioElement

    static shared(): AuidoCallManager {
        if (!AuidoCallManager.instance) {
            AuidoCallManager.instance = new AuidoCallManager();
        }
        return AuidoCallManager.instance;
    }
    playRingtone() {
        if (!this.ringtoneElement) {
            const audioContext = new AudioContext();
            this.ringtoneElement = new Audio('/audio/receive.mp3');
            this.ringtoneElement.loop = true;
            const source = audioContext.createMediaElementSource(this.ringtoneElement);
            source.connect(audioContext.destination);
            this.ringtoneElement.play();
        } else {
            this.ringtoneElement.currentTime = 0;
            this.ringtoneElement.play();
        }
    }
    stopRingtone() {
        if (this.ringtoneElement) {
            this.ringtoneElement.pause();
        }
    }

    playHangup() {
        if (!this.hangupElement) {
            const audioContext = new AudioContext();
            this.hangupElement = new Audio('/audio/hangup.wav');
            const source = audioContext.createMediaElementSource(this.hangupElement);
            source.connect(audioContext.destination);
            this.hangupElement.play();
        } else {
            this.hangupElement.currentTime = 0;
            this.hangupElement.play();
        }
    }

    stopHangup() {
        if (this.hangupElement) {
            this.hangupElement.pause();
        }
    }

}