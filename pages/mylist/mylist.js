const app = getApp()
const config = require('../../utils/config.js')
const util = require('../../utils/util.js')

Page({

  data: {
    products: []
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: config.baseURL + "product/",
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
          products: res.data.map(item => {
            return {
              id: item.id,
              subject: item.subject,
              description: item.description,
              top3Images: item.imageList.length > 0 ? 
              item.imageList.slice(0, 3).map(imageItem => {
                return {
                  id: imageItem.id,
                  url: util.getFullImagePath(imageItem)
                }
              }) : [{
                id: null,
                url: util.getFullImagePath(null)
              }]
            }
          })
        })
        console.log("--------")
        console.log(that.data.products)
        console.log("++++++++")
      },
      fail: function (err) {
        console.log(err)
      }
    })

  },

  createNew: function () {
    wx.navigateTo({
      url: '../create/create'
    })
  },

  productDetails: function (event) {
    wx.navigateTo({
      url: '../view/view?id=' + event.target.id
    })
  }
})