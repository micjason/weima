const util = require('./util.js');
var Crypto = require('./cropto/aes.js').Crypto;

function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

var mh = function (carId,carPwd, callback) {
  this.carId = carId;
  this.carPwd=carPwd;
  this.did = '';
  this.sid = '';
  this.cid = '';
  this.nid = '';
  this.pwdHand = false;
  this.isWriting = false;
  this.stauts = -1; //-1 未连接,0 连接失败 1 连接中。。。 2 连接成功
  this.msg = []; //信息
  this.controlType = -1; //指令类型：开锁，关锁，启动，熄火
  this.controlResolve = null; //指令发送回调
  this.status_change = callback;
  this.command = {
    // 测试连接(测试时使用)
    testConnect: 'AB 02 AB 01 A6',
    // 唤醒(测试时使用)
    awaken: 'BD 11 A1 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F',
    // 密码握手
    pwdHandShake: 'BD 11 B1 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F',
    // 申请验证密码
    pwdInit: 'BD 11 B2 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F',
    // 密码
    pwd: '',
    // app申请控制
    appControlInit: 'BD 11 A2 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F',
    // 上锁
    lock: '4D 48 2D 42 54 2D 43 6D 64 2D 4C 6F 63 6B 21 21',
    // 开锁
    open: '4D 48 2D 42 54 2D 43 6D 64 2D 55 6E 4C 6F 63 6B',
    //启动
    run: '4D 48 2D 42 54 2D 43 6D 64 2D 53 74 61 72 74 21',
    //熄火
    stop: '4D 48 2D 42 54 2D 43 6D 64 2D 53 74 6F 70 21 21'
  }
  this.key = {
    AES_Chang_Key1: 'C7 1D 49 70 08 87 21 A3 CA 69 EB F9 01 14 68 38',
    AES_Chang_Key2: 'D2 AE 92 10 f3 4f 8F 29 B6 e6 4e A8 3f 58 82 44',
    AES_Chang_Key4: 'FD 21 AA 04 73 C5 0E 6D 51 13 78 17 DA 48 18 EF',
    AES_Chang_Key5: '20 c1 52 29 cd a1 65 f5 4b ef 8a f9 8b c2 9e ff',
    BT_AES_IV: '78 28 65 6D FC 2F BB 0F 18 FB 62 22 45 3C 0C 9F'
  }
}

mh.prototype.setStatus = function (status, msg) {
  this.status = status;
  this.msg = msg;
  if (this.status == 0) {
    this.close();
  }
  if (this.status_change) {
    this.status_change(status, msg);
  }
}

mh.prototype.getHexCode = function (str) {
  if (str === "")
    return "";
  var hexCharCode = [];
  hexCharCode.push("0x");
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16));
  }
  return hexCharCode.join("");
}

mh.prototype.getBuffer = function (value) {
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

mh.prototype.string2buffer = function (str) {
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

mh.prototype.test = function () {
  return this.write("AB 02 AB 01");
}

mh.prototype.read = async function () {
  return new Promise((resolve, reject) => {
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: this.did,
      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
      serviceId: this.sid,
      // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
      characteristicId: this.nid,
      success: (res) => {
        console.log('读取值成功')
        resolve(res);
      },
      fail: (e) => {
        console.log('读取值失败')
        reject(e);
      },
      complete: (e) => {
        console.log('readBLECharacteristicValue:', e)
        console.log('读取值完毕')
      }
    })
  })
}

mh.prototype.write = function (value) {
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

mh.prototype.weekUp = function () {
  return this.write(this.command.awaken);
}

mh.prototype.wait = function (ms) {
  if (!ms) {
    ms = 501;
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms)
  })
}

//申请密码握手
mh.prototype.hand = async function () {
  console.log('密码握手开始', '==========================');
  this.pwdHand = false;
  console.log('密码第一次握手开始', '==========================');
  var r1 = await this.write(this.command.pwdHandShake).catch((r) => {
    return Promise.reject("第一次握手失败")
  })
  console.log('密码第一次握手结束', '==========================');
  await this.wait(500);
  console.log('密码第二次握手开始', '==========================');
  var r2 = await this.write(this.command.pwdHandShake).catch(() => {
    return Promise.reject("第二次握手失败")
  })
  console.log('密码第二次握手结束', '==========================');
  console.log('密码握手结束', '==========================');
  this.pwdHand = true;
  await this.wait(500);
  console.log('申请密码验证', '==========================');
  var res7 = await this.applyPwd().catch((r) => {
    this.stauts = 0;
    this.msg = '连接失败，请联系客服....';
    console.log("fail---申请密码验证失败");
  })
  return Promise.resolve();
}

mh.prototype.applyPwd = function () {
  return this.write(this.command.pwdInit);
}

//打开蓝牙
mh.prototype.openBlue = function () {
  return new Promise((resolve, reject) => {
    console.log('start..............');
    wx.openBluetoothAdapter({
      success: (res) => {
        resolve(res);
      },
      fail: (e) => {
        this.setStatus(0, "请先打开蓝牙,并允许微信使用蓝牙");
        reject(e);
      },
      complete(e) {
        console.log('openBluetoothAdapter complete..............');
        console.log(e);
      }
    })
  })
}
//开启蓝牙搜寻功能
mh.prototype.startDiscovery = function () {
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

mh.prototype.stopDiscovery = function () {
  wx.stopBluetoothDevicesDiscovery({
    success(res) {
      console.log(res)
    }
  })
}

//车辆蓝牙的应答统一集中处理
mh.prototype.answer = async function (str) {
    let that = this,
      type = str[4] + str[5],
      status = str[6] + str[7],
      time = str[8] + str[9],
      content = '',
      data = '';
    console.log('蓝牙返回类型: ', type, status);

    switch (type) {
      case 'b3': // 申请验证密码
        //util.delayedHideLoading(0)
        console.log('主机应答申请验证密码指令');

        content = str.replace('bd11b3', '');
        content = util.delfh(content, 2);

        for (let i = 0; i < 32; i++) {
          if (i % 2 == 0) {
            data = data + content[i] + content[i + 1] + ',';
          }
        }
        data = util.delfh(data, 1)
        console.log('BlueCS.AesDecryptKey4', data);
        //解密蓝牙发送过来的数据得到可变组
        var decry_res = await util.getAes4(data, 4)

        console.log('解密', decry_res);

        console.log('验证密码开始', '==========================');
        if (this.pwdHand) {
          await this.wait(500);
          await this.login();
        }
        console.log('验证密码结束', '==========================');

        // // 根据获取到的密码进行连接
        // that.setData({
        //   'command.pwd': bluetoothPwd
        // })

        break;
      case 'b6': // 验证密码
        console.log('主机应答验证密码指令', status);
        var state = parseInt(status);
        // 密码正确
        if (state == 1) {
          this.setStatus(2, "连接成功");
          console.log("密码正确");
          this.stauts = 1;
        }
        // 密码错误
        else if (state == 2) {
          this.setStatus(0, "连接失败，请联系客服");
          console.log("密码错误");
        } else if (state == 3) {
          this.setStatus(0, "连接失败，请联系客服");
          console.log("需验证密码");
          that.closeBT();
        } else if (state == 6) {
          this.setStatus(0, '密码连续错误5次，剩余时间：' + parseInt(time));
          console.log('密码连续错误5次，剩余时间：' + parseInt(time));
        }

        break;
      case 'a3': // 解密APP申请控制指令
        content = str.replace('bd11a3', '');
        content = util.delfh(content, 2);
        //console.log('主机应答APP申请控制指令', content);

        for (let i = 0; i < 32; i++) {
          if (i % 2 == 0) {
            data = data + content[i] + content[i + 1] + ',';
          }
        }
        data = util.delfh(data, 1);
        console.log('控制解密开始', data);
        var decry_res = await util.getAes4(data, 1)
        console.log('控制解密结束', decry_res);
        //解密后台处理
        if (this.controlType == 1) { //关锁
          var lockstr = this.command.lock.split(' ').join(',');
          console.log('关锁加密内容', lockstr);
          var str = await util.getAes4(lockstr, 2);
          this.write('BD 11 A4 ' + str);
        } else if (this.controlType == 2) { //开锁
          var openstr = this.command.open.split(' ').join(',');
          console.log('开锁加密内容', openstr);
          var str = await util.getAes4(openstr, 2);
          this.write('BD 11 A5 ' + str);
        } else if (this.controlType == 3) { //启动
          var runstr = this.command.run.split(' ').join(',');
          var str = await util.getAes4(runstr, 2);
          this.write('BD 11 AB ' + str);
        } else if (this.controlType == 4) { //熄火
          var stopstr = this.command.stop.split(' ').join(',');
          var str = await util.getAes4(stopstr, 2);
          this.write('BD 11 AC ' + str);
        }
        break;
      case 'a6': // 主机应答APP控制指令
        var state = parseInt(status);
        if (state == 1) {
          console.log("指令发送成功");
        }
        if (this.controlResolve) {
          this.controlResolve(state);
        }
        break;
    }
},

//获取要连接的蓝牙设备
mh.prototype.getBlue = function () {
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
        this.did = 'F0:29:4E:C9:F1:77';

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

          this.cid2 = this.cid.replace(/6E400\d{3}/,'6E400002')

          await this.notify().catch((e) => {
            console.log("notify fail", e);
          });

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
              console.log('写入成功',res)
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


          // this.hand().catch((r) => {
          //   this.stauts = 0;
          //   this.msg = '连接失败，请联系客服....';
          //   console.log("握手失败", r);
          // });

          // wx.onBLECharacteristicValueChange((e) => {
          //   console.log('=====characteristic has changed=====', ab2hex(e.value))
          //   this.answer(ab2hex(e.value));
          // })

        } else {
          reject();
        }
      }
    })
  })
}

mh.prototype.notify = function () {
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

mh.prototype.login = async function () {
  var pwd = this.carPwd;
  var len = pwd.length.toString(16).padStart(2, "0");
  var pwdstr = `76,72,66,70,77,64,2D,${len},${pwd.length>=1?pwd[0].toString(16).padStart(2,"0"):"00"},${pwd.length>=2?pwd[1].toString(16).padStart(2,"0"):"00"},${pwd.length>=3?pwd[2].toString(16).padStart(2,"0"):"00"},${pwd.length>=4?pwd[3].toString(16).padStart(2,"0"):"00"},${pwd.length>=5?pwd[4].toString(16).padStart(2,"0"):"00"},${pwd.length>=6?pwd[5].toString(16).padStart(2,"0"):"00"},${pwd.length>=7?pwd[6].toString(16).padStart(2,"0"):"00"},${pwd.length>=8?pwd[7].toString(16).padStart(2,"0"):"00"}`;

  var commend = `BD 11 B4 `;
  // console.log('加密前：', pwdstr);
  var pwd = await util.getAes4(pwdstr, 5);
  // console.log('加密后：', commend + pwd.toUpperCase());
  return this.write(commend + pwd.toUpperCase());
}

mh.prototype.controlInit = async function () {
  console.log("唤醒===============")
  await this.weekUp();
  await this.wait(500);
  await this.weekUp();
  await this.wait(500);
  console.log("唤醒===============")
  console.log("申请控制验证开始===============")
  var res = await this.write(this.command.appControlInit);
  console.log("申请控制验证结束===============")
  return res;
}

mh.prototype.unlock = async function () {
  wx.showLoading({
    title: '指令发送中...',
  })
  return new Promise((resolve, reject) => {
    this.controlType = 2 //开锁
    this.controlResolve = resolve;
    this.controlInit();
  })
}

mh.prototype.lock = async function () {
  wx.showLoading({
    title: '指令发送中...',
  })
  return new Promise((resolve, reject) => {
    this.controlType = 1 //关锁
    this.controlResolve = resolve;
    this.controlInit();
  })
}

mh.prototype.run = async function () {
  this.controlType = 3 //启动
  this.controlInit();
}

mh.prototype.stop = async function () {
  this.controlType = 4 //熄火
  this.controlInit();
}

//建立蓝牙连接
mh.prototype.create = function () {
  return new Promise((resolve, reject) => {
    console.log('开始链接.......');
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
mh.prototype.getService = function () {
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
        this.setStatus(0, "连接失败，请在车辆附近重试");
        console.log('获取服务调用失败...', e)
      },
      complete: (e) => {
        console.log('获取服务调用完毕...', e)
      }
    })
  })
}
//获取蓝牙服务特征
mh.prototype.getCharacter = function () {
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
//启动蓝牙连接
mh.prototype.start = async function () {
  this.setStatus(1, "连接中");

  wx.onBluetoothAdapterStateChange((res) => {
    if (!res.available) {
      this.setStatus(0, "连接已断开");
    }
  })

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

mh.prototype.close = function () {
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


export default mh;