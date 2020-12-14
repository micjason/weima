import sha1 from './sha1.js'
var CryptoJS = require('./cropto/aes.js');
var code = 457775;
var api_wenhao = 'https://test.91wenhao.com';

function string2Buffer(str) {
  str = str.replace(/ /g, '');
  let val = ""
  if (!str) return;
  let length = str.length;
  let index = 0;
  let array = []
  while (index < length) {
    array.push(str.substring(index, index + 2));
    index = index + 2;
  }
  val = array.join(",");
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}

var post = function (url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: data,
      method: "POST",
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        reject(error);
      }
    })
  });
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 去除最后一位字符
function delfh(str, num) {
  return str.substr(0, str.length - num || 1);
}

var getAes4 = async function (data, type) {
  return new Promise((resolve, reject) => {
    var sign_res = post(`${api_wenhao}/carController/aes`, {
      type: type,
      content: data
    }).then((res) => {
      console.log("加密接口",res);
      var data = JSON.parse(res.data.content.data);
      for(var i=0;i<data.length;i++){
        data[i]=data[i].toString().padStart(2, "0");
      }
      resolve(data.join(' '));
    })
  })
}

var decrypt4 = function (encryptedData, key, iv) {
  key = key.replace(/ /g, '');
  iv = iv.replace(/ /g, '');

  console.log("key:", CryptoJS.enc.Utf8.parse(key));
  console.log("iv:", CryptoJS.enc.Utf8.parse(iv));

  var decrypt = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  var str = decrypt.toString(CryptoJS.enc.Utf8);
  return str.toString();
}
//SHA1 加密
function encodeUTF8(s) {
  var i, r = [],
    c, x;
  for (i = 0; i < s.length; i++)
    if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
    else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
  else {
    if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
      c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
      r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
    else r.push(0xE0 + (c >> 12 & 0xF));
    r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
  };
  return r;
};

function getPwdMsg(status, time) {
  let title = '';
  if (status == '01' || status == 1) {
    title = '连接成功';
  } else if (status == '02' || status == 2) {
    title = '密码错误';
  } else if (status == '03' || status == 3) {
    title = '需验证密码';
  } else if (status == '04' || status == 4) {
    title = '更改密码成功';
  } else if (status == '05' || status == 5) {
    title = '更改密码失败';
  } else if (status == '06' || status == 6) {
    title = '密码错误5次,冻结剩余时间' + (parseInt(time, 16) || 0) + '分钟';
  }
  return title;
}

module.exports = {
  formatTime: formatTime,
  delfh: delfh,
  sha1: sha1,
  getAes4: getAes4,
  decrypt4: decrypt4,
  getPwdMsg: getPwdMsg
}