import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import  { BaseModule, WKApp } from '@tsdaodao/base';
import  { LoginModule } from '@tsdaodao/login';
import  { DataSourceModule } from '@tsdaodao/datasource';
import {ContactsModule} from '@tsdaodao/contacts';
import {AdvancedModule} from '@tsdaodao/advanced';
import {FileModule} from '@tsdaodao/file';
import {GroupManagerModule} from '@tsdaodao/groupmanager';
import {RTCModule} from '@tsdaodao/rtc';

const apiURL = "https://154.202.156.171:701"

if((window as any).__TAURI_IPC__) { // tauri环境
  console.log("tauri环境")
  WKApp.apiClient.config.apiURL = apiURL
}else if((window as any)?.__POWERED_ELECTRON__){
  console.log("__POWERED_ELECTRON__环境")
  WKApp.apiClient.config.apiURL = apiURL
}else{
  if(process.env.NODE_ENV === "development") {
    WKApp.apiClient.config.apiURL = apiURL + '/v1/'
  }else {
    WKApp.apiClient.config.apiURL = "/v1/" // 正式环境地址 (通用打包镜像，用此相对地址),打包出来的镜像可以通过API_URL环境变量来修改API地址
  }
}


WKApp.apiClient.config.tokenCallback = ()=> {
  return WKApp.loginInfo.token
}
WKApp.config.appVersion = `${process.env.REACT_APP_VERSION || "0.0.0"}`

WKApp.loginInfo.load() // 加载登录信息

WKApp.shared.registerModule(new BaseModule()); // 基础模块
WKApp.shared.registerModule(new DataSourceModule()) // 数据源模块
WKApp.shared.registerModule(new LoginModule()); // 登录模块
WKApp.shared.registerModule(new ContactsModule()); // 联系模块
WKApp.shared.registerModule(new AdvancedModule()); // 高级模块
WKApp.shared.registerModule(new FileModule()); // 文件模块
WKApp.shared.registerModule(new RTCModule()); // RTC模块
WKApp.shared.registerModule(new GroupManagerModule()); // 群管理模块

WKApp.shared.startup() // app启动


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();

