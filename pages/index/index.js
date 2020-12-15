const app = getApp()
const key = '1111111111111111' //16个1

const CryptoJS = require('crypto-js')

// console.log(111,CryptoJS.enc.Hex.parse('619f1bd7ed52018d1b957ee7a1a974b7'))
var a = CryptoJS.enc.Hex.parse('619f1bd7ed52018d1b957ee7a1a974b7')
var b = CryptoJS.enc.Base64.stringify(a);
var c = decrypt(b)
console.log(222, c)

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

function decrypt(text) {
  var result = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding
  })
  //return result.toString(CryptoJS.enc.Utf8)//字符串
  return result.toString(); //16进制
}

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding
  })
}

function hex16tostr(str) {
  var strarr = str.split(' ');
  var res = '';
  for (var i = 0; i < strarr.length; i++) {
    res += hexCharCodeToStr(strarr[i]);
  }
  return res;
}

// 字符串转16进制

function strToHexCharCode(str) {
  if (str === "")
    return "";
  var hexCharCode = [];
  hexCharCode.push("0x");
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16));
  }
  return hexCharCode.join("");
}



// 16进制转字符串

function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x" ?
    trimedStr.substr(2) :
    trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    alert("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    status: false,
    createStatus: false,
    writeStatus: 1
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        this.setData({
          status: true
        })
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        this.setData({
          status: false
        })
        console.log('openBluetoothAdapter fail', res)
        // if (res.errCode === 10001) {
        //   wx.onBluetoothAdapterStateChange(function (res) {
        //     console.log('onBluetoothAdapterStateChange', res)
        //     if (res.available) {
        //       this.startBluetoothDevicesDiscovery()
        //     }
        //   })
        // }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        console.log('device',device.deviceId)
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  createBLEConnection2() {
    // const deviceId = 'C8:05:E0:F1:50:C9'
    const deviceId = 'E2:79:5C:5D:93:37'
    //  const deviceId = 'F0:29:4E:C9:F1:77' 
    const name = 'lihao'
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log('createBLEConnection success', res)

        this.setData({
          connected: true,
          name,
          deviceId,
          createStatus: true
        })
        this.getBLEDeviceServices(deviceId)
      },
      fail: (res) => {
        this.setData({
          createStatus: false
        })
      }
    })
    // this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log('getBLEDeviceServices success', res)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            console.log('this._characteristicId', item.uuid, item.uuid.replace(/6E400\d{3}/, '6E400002'))
          }

          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
        console.log('this._characteristicId', this._characteristicId)
        this._characteristicId2 = this._characteristicId.replace(/6E400\d{3}/, '6E400002')
        this.writeBLECharacteristicValue()
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }


    })
    // 操作之前先监听，保证第一时间获取数据
    console.log('开启特征值变化监听')
    wx.onBLECharacteristicValueChange(function (res) {
      console.log('changed', res)
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      console.log(ab2hex(res.value))

      if (res.value) {
        var encryptedHexStr = CryptoJS.enc.Hex.parse(ab2hex(res.value)); //密文转16进制
        var encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr)

        console.log('解密后的值：', decrypt(encryptedBase64Str))
        // console.log('CryptoJS',CryptoJS)
      }


    })
  },
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
    // let buffer = new ArrayBuffer(1)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(0, Math.random() * 255 | 0)
    const that = this
    let buffer = new ArrayBuffer(14)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, 0x01)
    dataView.setUint8(1, 0x01)
    dataView.setUint8(2, 0x11)
    dataView.setUint8(3, 0x22)
    dataView.setUint8(4, 0x33)
    dataView.setUint8(5, 0x44)
    dataView.setUint8(6, 0)
    dataView.setUint8(7, 0)
    dataView.setUint8(8, 0)
    dataView.setUint8(9, 0)
    dataView.setUint8(10, 0)
    dataView.setUint8(11, 0)
    dataView.setUint8(12, 0)
    dataView.setUint8(13, 0)
    wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
        complete: res => {
          console.log('write', res)
        }
      }),
      this.setData({
        writeStatus: 2
      })

    wx.onBLEConnectionStateChange(function (res) {
      console.log('执行了状态变化', res)
      that.setData({
        writeStatus: 3
      })
    })
  },

  writeBLECharacteristicValue3() {
    let buffer = new ArrayBuffer(4)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, 0x04)
    dataView.setUint8(1, 0x21) //BleCtrlAuthReq0x04 0x21 0x02 0x27
    dataView.setUint8(2, 0x02) //四门解锁
    dataView.setUint8(3, 0x27)

    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._uuid2, //'6E400002-B5A3-F393-E0A9-37935D5C79E2',
      value: buffer,
      success(res) {
        console.log('write success', buffer);
        for (let i = 0; i < dataView.byteLength; i++) {
          console.log("0x" + dataView.getUint8(i).toString(16))
        }
      }
    })
  },

  writeBLECharacteristicValue4() {
    var str2 = hex16tostr('03 11 12'); //原始16进制
    var pwdstr = encrypt(str2).ciphertext.toString(); //加密后密文
    let str = this.strToHexCharCode(pwdstr);
    console.log('加密后密文',str)
    this.sendData(str)
  },

  //16进制字符加OX，如c705220689fe7ca970570ae4c373df92 转为0xc7 0x05 0x22 0x06 0x89 0xfe 0x7c 0xa9 0x70 0x57 0x0a 0xe4 0xc3 0x73 0xdf 0x92
  strToHexCharCode(str) {
    if (str === "")
      return "";
    var strlen = str.length;
    var code = 0;
    var res = '';
    //hexCharCode.push("0x"); 
    for (var i = 0; i < strlen; i = i + 2) {
      res += ' 0x' + str.substr(i, 2)
      code++;
    }
    return res.trim();
  },
  //数据发送
  sendData(str) { //str = '0x03 0x11 0x12';
    let strarr = str.split(' ');
    let strarrlen = strarr.length;
    let buffer = new ArrayBuffer(strarrlen);
    let dataView = new DataView(buffer);
    let writeDatas = '';
    for (let i = 0; i < strarrlen; i++) {
      dataView.setUint8(i, strarr[i].toString(16));
      writeDatas += dataView.getUint8(i).toString(16) + ' ';
    }

    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId2,
      value: buffer,
      success: function (res) {
        console.log('发送的数据：' + writeDatas)
        console.log('message发送成功')
        console.log('successres', res);
      },
      fail: function (res) {
        console.log('failres', res);
      },
      complete: function (res) {
        console.log('completeres', res);
        // let resView = new DataView(res.value);
        // for (let i = 0; i < resView.byteLength; i++) {
        //   console.log("0x" + resView.getUint8(i).toString(16))
        // }
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
    this.setData({
      status: false,
      createStatus: false,
      writeStatus: 1
    })
  },
})