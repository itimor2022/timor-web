
export class Size {
    width: number = 0
    height: number = 0
    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }
}

export class VideoUtil {

    static convertVideoSize(videoSize: Size,viewSize?:Size) {
        if(videoSize.width === 0 && videoSize.height === 0) {
            return new Size(0,0)
        }
        if(!viewSize) {
            viewSize = new Size(120,160)
        }
        console.log('videoSize',videoSize)
        console.log('viewSize',viewSize)
        if (videoSize.width/videoSize.height > viewSize.width/viewSize.height) {
            //视频size比较宽
            const scale = viewSize.height/videoSize.height;
            console.log('1-scale',scale)
            return new Size(videoSize.width * scale, videoSize.height * scale)
        } else {
            //视频size比较长
           
            const scale = viewSize.width/videoSize.width;
            console.log('2-scale',scale)
            return new Size(videoSize.width*scale, videoSize.height*scale);
        }
    }
}