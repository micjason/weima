import util from './util.js'

var remote = 'https://api.91wenhao.com';

var post = function (url, data, noloading) {
  if (!noloading) {
    wx.showLoading({
      title: '正在努力加载...',
      mask: true
    });
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: remote + url,
      data: data,
      method: "POST",
      success: (res) => {
        wx.hideLoading();
        resolve(res);
      },
      fail: (error) => {
        wx.hideLoading();
        reject(error);
      }
    })
  });
}

var http_get = function (url, noloading) {
  if (!noloading) {
    wx.showLoading({
      title: '正在努力加载...',
      mask: true
    });
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: remote + url,
      method: "GET",
      success: (res) => {
        wx.hideLoading();
        resolve(res);
      },
      fail: (error) => {
        wx.hideLoading();
        reject(error);
      }
    })
  });
}

var getCarBlueInfo = function (data) {
  return post("/carController/blueInfo", data);
}

export default {
  getCarBlueInfo: getCarBlueInfo
}