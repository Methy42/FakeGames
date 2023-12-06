import './js/libs/weapp-adapter'
import './js/libs/symbol'

import { InitGame, start, wxLogin } from './dist/main';

window.request = (url, options) => {
  return wx.request({
    url,
    ...options
  })
};

window.Request = function (url, options) {
  return {
    url,
    ...options
  };
};

window.Headers = function (options) {
  console.log("Headers", options);
  return options;
}

window.fetch = function (request) {
  return new Promise((resolve, reject) => {
    wx.request({
      timeout: 3600000,
      success: function (res) {
        resolve(res);
      },
      fail: function (error) {
        reject(error);
      },
      ...request
    })
  });
}

window.createVideo = wx.createVideo;

function userLogin() {
  wx.getUserInfo({
    success: function(res) {
      const userInfo = res.userInfo;

      wx.login({
        success (res) {
          if (res.code) {
            //发起网络请求
            console.log("Success to wxlogin",res.code, userInfo);
            wxLogin(res.code, userInfo);
          } else {
            console.log('Failed to wxlogin', res.errMsg)
          }
        }
      })
    }
  })
}

wx.getSetting({
  success(res) {
    if (!res.authSetting['scope.userInfo']) {
      wx.authorize({
        scope: 'scope.userInfo',
        success () {
          console.log("Success to get user info permission");
          userLogin();
        },
        fail(error) {
          console.log("Failed to get user info permission", error);
        }
      })
    } else {
      userLogin();
    }
  }
})

wx.getSystemInfo({
  success: (result) => {
    console.log("Success to get system info", result);
    window.safeArea = JSON.parse(JSON.stringify(result.safeArea));
  },
  fail: (error) => {
    console.log("Failed to get system info", error);
  }
});

InitGame({canvas});
start();
