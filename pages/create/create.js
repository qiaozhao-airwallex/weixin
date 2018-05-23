const app = getApp()
const config = require('../../utils/config.js')

Page({
  data: {
    image_photos: [],
    image_upload_progress: [],
    image_server_file_id: [],
    product_id: null,
    subject: null,
    description: null,
    image_upload_index: 0
  },

  onLoad: function (options) {
    var that = this;
    console.log(wx.getStorageSync('draft'))
    if (wx.getStorageSync('draft')) {
      that.showDraftDialog()
    }
  },

  submit: function () {
    this.uploadImagesAndPublish();
  },

  publish: function() {
    var that = this;
    wx.request({
      url: config.baseURL + "product/",
      method: "POST",
      header: {
        "Authorization": "Bearer " + app.globalData.session.access_token,
        'Content-Type': 'application/json'
      },
      data: {
        imageList: that.data.image_server_file_id,
        subject: that.data.subject,
        description: that.data.description,
        published: true
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  subjectInputEvent: function (e) {
    this.setData({
      subject: e.detail.value
    })
  },

  descriptionInputEvent: function (e) {
    this.setData({
      description: e.detail.value
    })
  },
  
  showDraftDialog() {
    let dialogComponent = this.selectComponent('.wxc-dialog')
    dialogComponent && dialogComponent.show();
  },
  hideDraftDialog() {
    let dialogComponent = this.selectComponent('.wxc-dialog')
    dialogComponent && dialogComponent.hide();
  },

  clearDraft: function() {
    wx.clearStorageSync('draft')
  },

  onDraftContinue: function() {
    console.log("onDraftContinue")
    var draft = wx.getStorageSync('draft');
    this.setData({
      image_photos: draft.image_photos,
      product_id: draft.product_id,
      subject: draft.subject,
      description: draft.description
    })
    this.clearDraft()
    this.hideDraftDialog()
  },

  onDraftCancel: function() {
    console.log("onDraftCancel")
    this.clearDraft()
    this.hideDraftDialog()
  },

  previewImage: function (e) {
    console.log("preview image")
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接 
      urls: this.data.image_photos // 需要预览的图片http链接列表 
    })
  }, 

  selectImages: function (e) {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths
        var tempUploadProgress = [];
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          tempUploadProgress.push(0);
        }
        that.setData({
          image_photos: that.data.image_photos.concat(tempFilePaths),
          image_upload_progress: tempUploadProgress
        })
      }
    })  
  },

  uploadImagesAndPublish: function () {
    var that = this
    if (that.data.image_upload_index == that.data.image_photos.length) {
      that.publish();
      return
    }
    console.log("upload image " + (that.data.image_upload_index + 1) + "/" + that.data.image_photos.length)
    const uploadTask = wx.uploadFile({
      url: config.baseURL + "image/",
      method: "POST",
      header: {
        "Authorization": "Bearer " + app.globalData.session.access_token,
      },
      filePath: that.data.image_photos[that.data.image_upload_index],
      name: "file",
      success: function (res) {
        console.log(res)
        var progress = "image_upload_progress[" + that.data.image_upload_index + "]"
        that.setData({
          [progress]: 100,
          image_server_file_id: that.data.image_server_file_id.concat({
            id: JSON.parse(res.data).id
          }),
          image_upload_index: that.data.image_upload_index + 1,
        })
        that.uploadImagesAndPublish();
      },
      fail: function (err) {
        console.log(err)
      }
    })
    uploadTask.onProgressUpdate((res) => {
      var progress = "image_upload_progress[" + this.data.image_upload_index + "]"
      this.setData({
        [progress]: res.progress,
      })
    })
  },
  
  onUnload: function () {
    if (this.data.image_photos.length > 0
      || this.data.subject 
      || this.data.description) {
      console.log("save draft")
      wx.setStorageSync('draft', {
        image_photos: this.data.image_photos,
        product_id: this.data.product_id,
        subject: this.data.subject,
        description: this.data.description
      })
    }
  }
})
