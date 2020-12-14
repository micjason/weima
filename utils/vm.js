function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

var vm = function(carId,carPwd, callback){
  this.carId = carId;
  this.carPwd=carPwd;
  this.did = '';  //deviceId
  this.sid = '';  //serviceId
  this.cid = '';  //characteristicId
  this.isWriting = false;
  this.stauts = -1; //-1 未连接,0 连接失败 1 连接中。。。 2 连接成功
  this.msg = []; //信息
  this.status_change = callback;
}

// 工具函数
vm.prototype.setStatus = function (status, msg) {
  this.status = status;
  this.msg = msg;
  if (this.status == 0) {
    this.close();
  }
  if (this.status_change) {
    this.status_change(status, msg);
  }
}

vm.prototype.wait = function (ms) {
  if (!ms) {
    ms = 501;
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms)
  })
}

vm.prototype.getBuffer = function (value) {
  var vs = value.split(' ');
  var cs = 0xFF;
  var sum = 0;
  let i = 0;
  for (i = 0; i < vs.length; i++) {
    var item = vs[i];
    var hex = parseInt(item, 16);
    // console.log(item, hex);
    sum += hex;
  }
  cs = (sum ^ cs).toString(16);
  if (cs.length > 2) {
    cs = cs.substring(cs.length - 2, cs.length);
  }
  console.log("write:", vs.join('') + cs);
  var buffer = this.string2buffer(vs.join('') + cs)

  return buffer;
}

vm.prototype.string2buffer = function (str) {
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

// ......

vm.prototype.close = function () {
  console.log('停止。。。。。')

  this.stopDiscovery();
  if (this.did) {
    wx.closeBLEConnection({
      deviceId: this.did,
      success(res) {
        console.log(res)
      }
    })
  }
  wx.closeBluetoothAdapter({
    success(res) {
      console.log(res)
    }
  })
}

vm.prototype.notify = function () {
  return new Promise((resolve, reject) => {
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: this.did,
      serviceId: this.sid,
      characteristicId: this.nid,
      success: (res) => {
        console.log('notify success', res.errMsg);
        resolve();
      },
      fail: (e) => {
        this.stauts = 0;
        this.msg = '连接失败，请联系客服....';
        reject(e);
      },
      complete: (e) => {

      }
    })
  })
}

vm.prototype.write = function (value) {
  if (this.isWriting) {
    return Promise.reject(0);
  }
  this.isWriting = true;
  return new Promise((resovle, reject) => {
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: this.did,
      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
      serviceId: this.sid,
      // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
      characteristicId: this.cid,
      // 这里的value是ArrayBuffer类型
      value: this.getBuffer(value),
      success: (res) => {
        this.isWriting = false;
        resovle(res);
      },
      fail: (e) => {
        this.isWriting = false;
        reject(e);
      },
      complete: (e) => {
        this.isWriting = false;
      }
    })
  })
}

//开启蓝牙搜寻功能
vm.prototype.startDiscovery = function () {
  return new Promise((resovle, reject) => {
    wx.startBluetoothDevicesDiscovery({
      // services:["F79B0"],
      success: (res) => {
        console.log('正在搜索附近车辆.....');
        resovle();
      },
      fail: (e) => {
        reject(e);
      },
      complete(e) {
        console.log('搜索调用完毕');
        console.log(e);
      }
    })
  })
}

vm.prototype.stopDiscovery = function () {
  wx.stopBluetoothDevicesDiscovery({
    success(res) {
      console.log('停止搜寻附近的蓝牙',res)
    }
  })
}

//获取要连接的蓝牙设备
vm.prototype.getBlue = function () {
  console.log('getblue.......', Math.random());
  return new Promise((resolve, reject) => {
    wx.getBluetoothDevices({
      success: async (res) => {
        // res.devices.forEach((item) => {
        //   if (item.localName == this.carId) {
        //     console.log("设备：", item);
        //     this.did = item.deviceId;
        //     this.stopDiscovery();
        //     return;
        //   }
        // })
        this.did = 'E2:79:5C:5D:93:37'  // *******
        this.stopDiscovery();           // *******

        if (this.did) {
          var res2 = await this.create();
          var service = await this.getService();
          var res4 = await this.getCharacter();

          res4.characteristics.forEach((item) => {
            if (item.properties.write) {
              this.cid = item.uuid;
            }
            if (item.properties.notify) {
              this.nid = item.uuid;
            }
          })

          await this.notify().catch((e) => {
            console.log("notify fail", e);
          });


          // this.hand().catch((r) => {
          //   this.stauts = 0;
          //   this.msg = '连接失败，请联系客服....';
          //   console.log("握手失败", r);
          // });

          wx.onBLECharacteristicValueChange((e) => {
            // console.log('=====characteristic has changed=====', ab2hex(e.value))
            // this.answer(ab2hex(e.value));
            console.log('特征值改变',e)
          })

        } else {
          reject();
        }
      }
    })
  })
}


//启动蓝牙连接
vm.prototype.start = async function () {
  this.setStatus(1, "连接中");

  // 监听蓝牙适配器状态变化事件
  // available	boolean	蓝牙适配器是否可用
  // discovering	boolean	蓝牙适配器是否处于搜索状态
  wx.onBluetoothAdapterStateChange((res) => {
    if (!res.available) {
      this.setStatus(0, "连接已断开");
    }
  })

  // 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
  // deviceId	string	蓝牙设备ID
  // connected	boolean	是否处于已连接状态
  wx.onBLEConnectionStateChange((res) => {
    if (!res.connected) {
      this.setStatus(0, "连接已断开");
    }
  })

  var res = await this.openBlue().catch(() => {
    this.stauts = 0;
    this.msg = '请先打开蓝牙,并允许微信使用蓝牙';
  });

  await this.wait(500);

  if (this.did) {
    var res1 = await this.getBlue();
  } else {
    wx.onBluetoothDeviceFound(async (res) => {
      console.log(res);
      console.log('检测倒新设备....')
      var devices = res.devices;
      if (!this.did)
        await this.getBlue();
    })

    var res1 = await this.startDiscovery();
    console.log('获取蓝牙设备')
  }

}

//打开蓝牙
vm.prototype.openBlue = function () {
  return new Promise((resolve, reject) => {
    console.log('openBlue..............');
    wx.openBluetoothAdapter({
      success: (res) => {
        resolve(res);
      },
      fail: (e) => {
        this.setStatus(0, "请先打开蓝牙,并允许微信使用蓝牙");
        reject(e);
      },
      complete(e) {
        console.log('openBluetoothAdapter complete..............',e);
      }
    })
  })
}

//建立蓝牙连接
vm.prototype.create = function () {
  return new Promise((resolve, reject) => {
    console.log('开始链接.......',this.did);
    wx.createBLEConnection({
      deviceId: this.did,
      success: (res) => {
        console.log('建立链接....')
        console.log(res)
        resolve(res);
      },
      fail: (e) => {
        this.setStatus(0, "连接失败，请在车辆附近重试");
        reject(e);
        console.log('建立链接失败....')
        console.log(e)
      },
      complete: (e) => {
        console.log('建立链接调用完毕....')
        console.log(e)
      }
    })
  })
}
//获取蓝牙服务
vm.prototype.getService = function () {
  return new Promise((resolve, reject) => {
    console.log('获取设备服务....');
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: this.did,
      success: (res) => {
        resolve(res.services[0]);
        this.sid = res.services[0].uuid;
        console.log('device services:', res.services)
      },
      fail: (e) => {
        // this.setStatus(0, "连接失败，请在车辆附近重试");
        console.log('获取服务调用失败...', e)
      },
      complete: (e) => {
        console.log('获取服务调用完毕...', e)
      }
    })
  })
}
//获取蓝牙服务特征
vm.prototype.getCharacter = function () {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: this.did,
      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
      serviceId: this.sid,
      success(res) {
        resolve(res);
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
      },
      fail: (e) => {
        this.setStatus(0, "连接失败，请在车辆附近重试");
      }
    })
  })
}


export default vm