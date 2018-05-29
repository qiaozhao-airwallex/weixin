//index.js
const util = require('../../utils/util.js')
const config = require('../../utils/config.js')
const app = getApp()

Page({
  userInfoHandler: function() {
    this.wxlogin();
  },
  wxlogin: function () {
    var that = this;
    console.log('logining..........');
    //调用登录接口
    wx.login({
      success: function (e) {
        console.log('wxlogin succeed........');
        var code = e.code;
        wx.getUserInfo({
          success: function (res) {
            console.log('wxgetUserInfo succeed........');
            // var encryptedData = encodeURIComponent(res.encryptedData);
            that.appLogin(code, res.rawData, res.signature);
            app.globalData.userInfo = res.userInfo
          },
          fail: function (e) {
            console.log('wxgetUserInfo failed........', e);
          },
          complete: function () {
            console.log('wxgetUserInfo complete........');
          }
        })
      }
    });
  },

  appLogin: function (code, rawData, signature) {
    var that = this;
    var auth = util.base64_encode("my-garage:");
    wx.request({
      url: config.baseURL + "oauth/token",
      method: "POST",
      header: {
        "Authorization": "Basic " + auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        grant_type: 'password',
        social: 'weixin',
        code: code,
        rawData: rawData,
        signature: signature,
        password: code
      },
      success: function (res) {
        console.log(res.data)
        app.globalData.session = res.data
        wx.navigateTo({
          url: '../mylist/mylist'
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

})
