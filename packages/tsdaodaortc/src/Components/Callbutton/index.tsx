
import React, { Component } from "react";

import "./index.css"

export class CallButtonProps {
    onClick?:()=>void
}

export class HangupButton extends Component<CallButtonProps> {

    constructor(props: any) {
        super(props)
    }

    render(): React.ReactNode {
        const {onClick} = this.props
        return <div className="wk-call-btn">
            <button className="hangup" onClick={()=>{
                if(onClick) {
                    onClick()
                }
            }}>
                <img src={require('./assets/hangup.png')} alt=""></img>
            </button>
            <div className="label">
                挂断
            </div>
        </div>
    }
}

export class AnswerButton extends Component<CallButtonProps> {
    render(): React.ReactNode {
        const {onClick} = this.props
        return <div className="wk-call-btn">
            <button className="answer" onClick={()=>{
                if(onClick) {
                    onClick()
                }
            }}>
                <img src={require('./assets/answer.png')} alt=""></img>
            </button>
            <div className="label">
                接听
            </div>
        </div>
    }
}