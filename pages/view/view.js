const app = getApp()
const config = require('../../utils/config.js')
const util = require('../../utils/util.js')

Page({

  data: {
    product: null
  },

  onLoad: function (options) {
    console.log("-------productDetails:" + options.id);
    var that = this;
    var id = options.id;
    wx.request({
      url: config.baseURL + "product/" + id,
      method: "GET",
      header: {
        "Authorization": "Bearer " + app.globalData.session.access_token,
        'Content-Type': 'application/json'
      },
      data: {
        category: 'published',
      },
      success: function (res) {
        console.log(res)
        that.setData({
          product: {
            id: res.data.id,
            subject: res.data.subject,
            description: res.data.description,
            imageList: res.data.imageList.map(item => {
              return {
                id: item.id,
                imageURL: util.getFullImagePath(item)
              }
            })
          }
        })
        console.log(that.data.product)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  }
})