const CryptoJS = require("./crypto-js/index");
//status 0:关，1:开
let door = [
  {
    name: "四车门锁状态",
    status: 0,
  },
  {
    name: "后备箱锁状态",
    status: 0,
  },
  {
    name: "后备箱门关闭状态",
    status: 0,
  },
  {
    name: "左前门关闭状态",
    status: 0,
  },
  {
    name: "右前门关闭状态",
    status: 0,
  },
  {
    name: "左后门关闭状态",
    status: 0,
  },
  {
    name: "右后门关闭状态",
    status: 0,
  },
  {
    name: "四门关闭状态",
    status: null,
  },
];

let windowInfo = [
  {
    name: "右后窗状态",
    status: "00",
  },
  {
    name: "左后窗状态",
    status: "00",
  },
  {
    name: "副驾窗状态",
    status: "00",
  },
  {
    name: "主驾窗状态",
    status: "00",
  },
];

// 6~7	BCM_RR_wdw_Opend	右后窗状态 00 关闭  10 打开
// 4~5	BCM_RL_wdw_Opend	左后窗状态
// 2~3	BCM_Pas_wdw_Opend	副驾窗状态
// 0~1	BCM_Drv_wdw_Opend	主驾窗状态

let fail = [
  {
    name: "失败，鉴权失败",
    status: "01",
  },
  {
    name: "失败，命令由于距离受限",
    status: "02",
  },
  {
    name: "失败，用户操作未授权",
    status: "03",
  },
  {
    name: "失败，车控处理忙",
    status: "04",
  },
  {
    name: "失败，BCM超时未响应",
    status: "05",
  },
  {
    name: "失败，错误的命令",
    status: "06",
  },
  {
    name: "失败，BCM执行车控失败",
    status: "07",
  },
  {
    name: "失败，车上有人",
    status: "08",
  },
  {
    name: "失败，车速不为0",
    status: "09",
  },
  {
    name: "失败，电源不在OFF档",
    status: "0a",
  },
  {
    name: "失败，档位不在P档",
    status: "0b",
  },
  {
    name: "失败，车内启动开关被按下",
    status: "0c",
  },
  {
    name: "失败，车辆未熄火",
    status: "0d",
  },
  {
    name: "失败，车辆未上锁",
    status: "0e",
  },
  {
    name: "失败，钥匙在车内",
    status: "0f",
  },
  {
    name: "失败，电量不足",
    status: "10",
  },
  {
    name: "失败，发动机启动加车上有人",
    status: "11",
  },
  {
    name: "失败，错误的随机数",
    status: "12",
  },
  {
    name: "失败，后备箱已打开",
    status: "13",
  },
  {
    name: "失败，车门未关闭",
    status: "14",
  },
  {
    name: "失败，刹车被踩下",
    status: "15",
  },
];

// 0x00 - 超时5分钟未操作
// 0x01 - 二级鉴权失败
// 0x02 - 三级鉴权失败
// 0x03 - 蓝牙钥匙过期
// 0x04 - 蓝牙钥匙无效
// 0x05 - 蓝牙钥匙不存在
// 0x06 - Anting 次数超过5次
// 0x07 - unknown
let disconnect = [
  {
    name: "超时2分钟未操作",
    status: "00",
  },
  {
    name: "二级鉴权失败",
    status: "01",
  },
  {
    name: "三级鉴权失败",
    status: "02",
  },
  {
    name: "蓝牙钥匙过期",
    status: "03",
  },
  {
    name: "蓝牙钥匙无效",
    status: "04",
  },
  {
    name: "蓝牙钥匙不存在",
    status: "05",
  },
  {
    name: "Anting 次数超过5次",
    status: "06",
  },
  {
    name: "unknown",
    status: "07",
  },
];

function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ("00" + bit.toString(16)).slice(-2);
  });
  return hexArr.join("");
}

// 比如'0x21'==>'!'
function hex16tostr(str) {
  var strarr = str.split(" ");
  var result = "";
  for (var i = 0; i < strarr.length; i++) {
    result += hexCharCodeToStr(strarr[i]);
  }
  return result;
}

function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x"
      ? trimedStr.substr(2)
      : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    console.log("Illegal Format ASCII Code!");
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

// 字符串转16进制
function strToHexCharCode(str) {
  if (str === "") return "";
  var strlen = str.length;
  var code = 0;
  var res = "";
  for (var i = 0; i < strlen; i = i + 2) {
    res += " 0x" + str.substr(i, 2);
    code++;
  }
  return res.trim();
}

// 16进制转2进制
function hex_to_bin(str) {
  let hex_array = [
    {
      key: 0,
      val: "0000",
    },
    {
      key: 1,
      val: "0001",
    },
    {
      key: 2,
      val: "0010",
    },
    {
      key: 3,
      val: "0011",
    },
    {
      key: 4,
      val: "0100",
    },
    {
      key: 5,
      val: "0101",
    },
    {
      key: 6,
      val: "0110",
    },
    {
      key: 7,
      val: "0111",
    },
    {
      key: 8,
      val: "1000",
    },
    {
      key: 9,
      val: "1001",
    },
    {
      key: "a",
      val: "1010",
    },
    {
      key: "b",
      val: "1011",
    },
    {
      key: "c",
      val: "1100",
    },
    {
      key: "d",
      val: "1101",
    },
    {
      key: "e",
      val: "1110",
    },
    {
      key: "f",
      val: "1111",
    },
  ];

  let value = "";
  for (let i = 0; i < str.length; i++) {
    for (let j = 0; j < hex_array.length; j++) {
      if (str.charAt(i).toLowerCase() == hex_array[j].key) {
        value = value.concat(hex_array[j].val);
        break;
      }
    }
  }
  return value;
}

function getKey(str) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(str); //密文转16进制
  let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let key = CryptoJS.AES.decrypt(
    encryptedBase64Str,
    CryptoJS.enc.Utf8.parse("14cd516a30dc872b"),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.ZeroPadding,
    }
  );
  let key_str = key.toString();
  let key_arr = key_str.split("");
  let result = [];
  key_arr.forEach((item, index) => {
    if (index % 2 === 1) {
      result.push(item);
    }
  });
  console.log("getKey", key.toString());
  console.log("getKey", result.join(""));
  return result.join("");
}

function getpasswd(str) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(str); //密文转16进制
  let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let key = CryptoJS.AES.decrypt(
    encryptedBase64Str,
    CryptoJS.enc.Utf8.parse("14cd516a30dc872b"),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.ZeroPadding,
    }
  );
  let key_str = key.toString();

  console.log("key_str", key_str);

  let code1 = "0x" + key_str.substring(0, 2);
  let code2 = "0x" + key_str.substring(2, 4);
  let code3 = "0x" + key_str.substring(4, 6);
  let code4 = "0x" + key_str.substring(6, 8);

  let buffer = new ArrayBuffer(14);
  let dataView = new DataView(buffer);
  dataView.setUint8(0, 0x01);
  dataView.setUint8(1, 0x01);
  dataView.setUint8(2, code1);
  dataView.setUint8(3, code2);
  dataView.setUint8(4, code3);
  dataView.setUint8(5, code4);
  dataView.setUint8(6, 0);
  dataView.setUint8(7, 0);
  dataView.setUint8(8, 0);
  dataView.setUint8(9, 0);
  dataView.setUint8(10, 0);
  dataView.setUint8(11, 0);
  dataView.setUint8(12, 0);
  dataView.setUint8(13, 0);
  return buffer;
}

var mh = function (macId, key, passwd, callback) {
  this.macId = macId;
  this.did = "";
  this.sid = "";
  this.cid = "";
  this.cid2 = "";
  this.nid = "";
  this.passwd = getpasswd(passwd);
  this.key = getKey(key);
  this.isWriting = false;
  this.status = -1; //-1 未连接,0 连接失败 1 连接中。。。 2 连接成功
  this.msg = []; //信息
  this.controlResolve = null; //指令发送回调
  this.status_change = callback;
  this.commandType = -1;
  // 1开锁 2关锁 3升窗 4降窗 5闪灯 6闪灯鸣笛 7后备箱开锁 8后备箱关锁 9检查车辆信息 998关闭蓝牙 999连接蓝牙
  this.command = {
    flash: "04 21 00 25",
    flashAndHonking: "04 21 01 24",
    lock: "04 21 03 26",
    unlock: "04 21 02 27",
    roseWindow: "04 21 06 23",
    dropWindow: "04 21 07 22",
    check: "03 11 12",
    trunklock: "04 21 05 20",
    trunkUnlock: "04 21 04 21",
    openMainWindow: "04 21 09 2c",
    closeMainWindow: "04 21 08 2d",
    openTopWindow: "04 21 0b 2e",
    closeTopWindow: "04 21 0a 2f",
  };
};

mh.prototype.flash = function () {
  this.commandType = 5;
  this.write(this.command.flash);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.flashAndHonking = function () {
  this.commandType = 6;
  this.write(this.command.flashAndHonking);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.lock = function () {
  this.commandType = 2;
  this.write(this.command.lock);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.unlock = function () {
  this.commandType = 1;
  this.write(this.command.unlock);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.roseWindow = function () {
  this.commandType = 3;
  this.write(this.command.roseWindow);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.dropWindow = function () {
  this.commandType = 4;
  this.write(this.command.dropWindow);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.trunklock = function () {
  this.commandType = 8;
  this.write(this.command.trunklock);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.trunkUnlock = function () {
  this.commandType = 7;
  this.write(this.command.trunkUnlock);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};
mh.prototype.openMainWindow = function () {
  this.write(this.command.openMainWindow);
};
mh.prototype.closeMainWindow = function () {
  this.write(this.command.closeMainWindow);
};
mh.prototype.openTopWindow = function () {
  this.write(this.command.openTopWindow);
};
mh.prototype.closeTopWindow = function () {
  this.write(this.command.closeTopWindow);
};
mh.prototype.check = function () {
  this.commandType = 9;
  this.write(this.command.check);
  return new Promise((resolve, reject) => {
    this.controlResolve = resolve;
  });
};

mh.prototype.decrypt = function (text) {
  const that = this;
  var result = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(that.key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  });
  //return result.toString(CryptoJS.enc.Utf8)//字符串
  return result.toString(); //16进制
};

mh.prototype.encrypt = function (text) {
  const that = this;
  return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(that.key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  });
};

mh.prototype.setStatus = function (status, msg) {
  this.status = status;
  this.msg = msg;
  if (this.status == 0) {
    this.close();
  }

  if (this.status_change) {
    this.status_change(status, msg);
  }
};

mh.prototype.wait = function (ms) {
  if (!ms) {
    ms = 501;
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

// 读取低功耗蓝牙设备的特征值的二进制数据值
mh.prototype.read = async function () {
  return new Promise((resolve, reject) => {
    wx.readBLECharacteristicValue({
      deviceId: this.did,
      serviceId: this.sid,
      characteristicId: this.nid,
      success: (res) => {
        console.log("读取值成功");
        resolve(res);
      },
      fail: (e) => {
        console.log("读取值失败");
        reject(e);
      },
      complete: (e) => {
        console.log("readBLECharacteristicValue:", e);
        console.log("读取值完毕");
      },
    });
  });
};

// 这里接受value = '03 11 12'这种类型的指令
mh.prototype.write = function (value) {
  console.log("value", value);
  if (this.status === 1) {
    this.setStatus(1, "连接中，请稍后");
    return false;
  }
  if (this.status === -1) {
    this.setStatus(-1, "蓝牙未连接");
    return false;
  }
  if (this.status === 0) {
    this.setStatus(0, "蓝牙连接失败");
    return false;
  }
  if (this.isWriting) {
    return Promise.reject(0);
  }
  this.isWriting = true;
  let str = hex16tostr(value);
  console.log("strsss", str);
  var pwdstr = this.encrypt(str).ciphertext.toString(); //加密后密文
  console.log("pwdstr", pwdstr);
  let str2 = strToHexCharCode(pwdstr);

  let strarr = str2.split(" ");
  let strarrlen = strarr.length;
  let buffer = new ArrayBuffer(strarrlen);
  let dataView = new DataView(buffer);
  let writeDatas = "";
  for (let i = 0; i < strarrlen; i++) {
    dataView.setUint8(i, strarr[i].toString(16));
    writeDatas += dataView.getUint8(i).toString(16) + " ";
  }
  console.log("dataView", dataView, "writeDatas", writeDatas);
  console.log("str2", str2);

  if (this.status !== 2) {
    return false;
  }

  return new Promise((resovle, reject) => {
    wx.writeBLECharacteristicValue({
      deviceId: this.did,
      serviceId: this.sid,
      characteristicId: this.cid2,
      // 这里的buffer是ArrayBuffer类型
      value: buffer,
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
      },
    });
  });
};

//打开蓝牙
mh.prototype.openBlue = function () {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log("开启蓝牙适配器success", res);
        resolve(res);
      },
      fail: (e) => {
        console.log("打开蓝牙失败");
        this.setStatus(0, "请先打开蓝牙,并允许微信使用蓝牙");
        reject(e);
      },
      complete(e) {},
    });
  });
};

//开启蓝牙搜寻功能
mh.prototype.startDiscovery = function () {
  return new Promise((resovle, reject) => {
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log("开启蓝牙搜寻功能.....");
        resovle();
      },
      fail: (e) => {
        reject(e);
      },
      complete(e) {},
    });
  });
};

// 关闭蓝牙搜寻功能
mh.prototype.stopDiscovery = function () {
  wx.stopBluetoothDevicesDiscovery({
    success(res) {
      console.log("关闭蓝牙搜寻功能", res);
    },
  });

  wx.offBluetoothDeviceFound({
    success(res) {
      console.log("取消监听寻找到新设备", res);
    },
  });
};

//车辆蓝牙的应答统一集中处理
mh.prototype.answer = async function (str) {
  console.log("执行value变化后的回调", str);
  if (str.substring(2, 4) == "51") {
    let code_door = hex_to_bin(str.substring(6, 8)).split("");
    console.log("code_door", code_door);

    if (this.commandType === 1) {
      if (code_door[0] == 1) {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }

    if (this.commandType === 2) {
      if (code_door[0] == 0) {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }

    if (this.commandType === 3) {
      //升窗
      let code_window = str.substring(8, 10);
      console.log("code_window", code_window, hex_to_bin(str.substring(8, 10)));
      if (code_window == "00") {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }

    if (this.commandType === 4) {
      let code_window = str.substring(8, 10);
      if (code_window == "aa") {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }

    if (this.commandType === 7) {
      if (code_door[1] == 1) {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }

    if (this.commandType === 8) {
      if (code_door[1] == 0) {
        if (this.controlResolve) {
          this.controlResolve({
            status: "success",
            content: "",
          });
        }
      } else {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: "",
          });
        }
      }
    }
  } else if (str.substring(2, 4) == "24") {
    let code3 = str.substring(4, 6);
    console.log("code3", code3);
    if (code3 == "00") {
      if (this.controlResolve) {
        this.controlResolve({
          status: "complete",
          content: "",
        });
      }
    } else {
      let tmp_index = "";
      for (let i = 0; i < fail.length; i++) {
        if (fail[i].status == code3) {
          tmp_index = i;
        }
      }
      console.log('tmp_index',tmp_index,fail[tmp_index].name)
      console.log('controlResolve',this.controlResolve)
      if (tmp_index !== "") {
        if (this.controlResolve) {
          this.controlResolve({
            status: "fail",
            content: fail[tmp_index].name,
          });
        }
      }
    }
  } else if (str.substring(2, 4) == "61") {
    let code4 = str.substring(4, 6);

    let tmp_index = "";
    for (let i = 0; i < disconnect.length; i++) {
      if (disconnect[i].status == code4) {
        tmp_index = i;
      }
    }
    console.log("disconnect[tmp_index].name", disconnect[tmp_index].name);
    if (tmp_index !== "") {
      this.setStatus(0, disconnect[tmp_index].name);
    }
  } else if (str.substring(2, 4) == "12") {
    let code_door = hex_to_bin(str.substring(6, 8)).split("");
    for (let i = 0; i < door.length; i++) {
      door[i].status = code_door[i];
    }
    let code_window = hex_to_bin(str.substring(8, 10)).split("");
    if (code_window[0] == 0 && code_window[1] == 0) {
      windowInfo[0].status = 0;
    }
    if (code_window[0] == 1 && code_window[1] == 0) {
      windowInfo[0].status = 1;
    }
    if (code_window[2] == 0 && code_window[3] == 0) {
      windowInfo[1].status = 0;
    }
    if (code_window[2] == 1 && code_window[3] == 0) {
      windowInfo[1].status = 1;
    }
    if (code_window[4] == 0 && code_window[5] == 0) {
      windowInfo[2].status = 0;
    }
    if (code_window[4] == 1 && code_window[5] == 0) {
      windowInfo[2].status = 1;
    }
    if (code_window[6] == 0 && code_window[7] == 0) {
      windowInfo[3].status = 0;
    }
    if (code_window[6] == 1 && code_window[7] == 0) {
      windowInfo[3].status = 1;
    }

    let result = door.concat(windowInfo);
    console.log("door", door);
    console.log("window", windowInfo);
    console.log("result", result);
    if (this.controlResolve) {
      this.controlResolve({
        status: "info",
        content: result,
      });
    }
  }
};

//获取要连接的蓝牙设备
mh.prototype.getBlue = function () {
  let tmp_arr = this.macId.split(":")
  let tmp_mac = tmp_arr.reverse().join("")
  return new Promise((resolve, reject) => {
    wx.getBluetoothDevices({
      success: (res) => {
        res.devices.forEach((item) => {
          if(item.advertisServiceUUIDs&&item.advertisServiceUUIDs.length>0){
            if(item.advertisServiceUUIDs[0] == "6E400001-B5A3-F393-E0A9-" + tmp_mac){
              console.log('找到了')
              this.did = item.deviceId;
              this.stopDiscovery();
              this.connect()
              return;
            }
          }
        });
       
      },
    });
  });
};

// 执行连接操作
mh.prototype.connect = function () {
  console.log("执行连接操作");
  return new Promise(async (resolve, reject) => {
    var res2 = await this.create();
    var res3 = await this.getService();
    this.getCharacter();
  });
};

// 启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值。
// 注意：必须设备的特征值支持 notify 或者 indicate 才可以成功调用。
// 另外，必须先启用 notifyBLECharacteristicValueChange 才能监听到设备 characteristicValueChange 事件
mh.prototype.notify = function () {
  return new Promise((resolve, reject) => {
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: this.did,
      serviceId: this.sid,
      characteristicId: this.nid,
      success: (res) => {
        console.log("notify success", res);
        resolve();
      },
      fail: (e) => {
        this.status = 0;
        this.msg = "启用notify失败....";
        reject(e);
      },
      complete: (e) => {},
    });
  });
};

//建立蓝牙连接
mh.prototype.create = function () {
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: this.did,
      success: (res) => {
        console.log("createBLEConnection成功");
        resolve(res);
      },
      fail: (e) => {
        this.setStatus(0, "连接失败，请在车辆附近重试");
        reject(e);
      },
      complete: (e) => {},
    });
  });
};

//获取蓝牙服务
mh.prototype.getService = function () {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId: this.did,
      success: (res) => {
        console.log("getService成功...", res);
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.sid = res.services[i].uuid;
            resolve(res.services[i]);
            return;
          }
        }
      },
      fail: (e) => {
        console.log("getService失败...", res);
        this.setStatus(0, "连接失败，请在车辆附近重试");
      },
      complete: (e) => {},
    });
  });
};

//获取蓝牙服务特征
mh.prototype.getCharacter = function () {
  wx.getBLEDeviceCharacteristics({
    deviceId: this.did,
    serviceId: this.sid,
    success: (res) => {
      console.log("getBLEDeviceCharacteristics success", res.characteristics);
      console.log("this.passwd", this.passwd.toString());
      console.log("this.key", this.key);
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i];
        if (item.properties.write) {
          this.cid = item.uuid;
        }

        if (item.properties.notify || item.properties.indicate) {
          this.nid = item.uuid;
          wx.notifyBLECharacteristicValueChange({
            deviceId: this.did,
            serviceId: this.sid,
            characteristicId: item.uuid,
            state: true,
          });
        }
      }
      this.cid2 = this.cid.replace(/6E400\d{3}/, "6E400002");

      wx.writeBLECharacteristicValue({
        deviceId: this.did,
        serviceId: this.sid,
        characteristicId: this.cid,
        value: this.passwd,
        complete: (res) => {
          console.log("write", res);
        },
      });
    },
    fail(res) {
      console.error("getBLEDeviceCharacteristics", res);
    },
  });
  // 操作之前先监听，保证第一时间获取数据
  console.log("开启特征值变化监听");
  wx.onBLECharacteristicValueChange((res) => {
    console.log("changed", res);
    console.log(
      `characteristic ${res.characteristicId} has changed, now is ${res.value}`
    );
    console.log(ab2hex(res.value));

    if (res.value) {
      var encryptedHexStr = CryptoJS.enc.Hex.parse(ab2hex(res.value)); //密文转16进制
      var encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);

      console.log("解密后的值：", this.decrypt(encryptedBase64Str));
      this.answer(this.decrypt(encryptedBase64Str));
    }
  });
};

//启动蓝牙连接
mh.prototype.start = async function () {
  if (this.status === 1) {
    this.setStatus(1, "正在连接");
    return false;
  }
  if (this.status === 2) {
    this.setStatus(2, "已连接");
    return false;
  }
  this.setStatus(1, "连接中");
  this.commandType = 999;

  wx.onBluetoothAdapterStateChange((res) => {
    console.log("监听适配器变化", res);
    if (!res.available) {
      this.setStatus(0, "连接已断开");
    }
  });

  wx.onBLEConnectionStateChange((res) => {
    if (!res.connected) {
      this.setStatus(0, "连接已断开");
    }
    if (res.connected) {
      this.setStatus(2, "连接成功");
    }
    console.log("监听连接状态变化", res.connected, this.status);
  });

  var res = await this.openBlue().catch(() => {
    this.status = 0;
    this.msg = "请先打开蓝牙,并允许微信使用蓝牙";
  });

  console.log("res", res);
  if (res == undefined) {
    return false;
  }
  await this.wait(500);

  if (this.did) {
    await this.connect();
  } else {
    wx.onBluetoothDeviceFound(async (res) => {
      console.log("检测倒新设备....", res);
      await this.getBlue();
    });

    var res1 = await this.startDiscovery();
  }
};

mh.prototype.close = function () {
  this.stopDiscovery();
  this.commandType = 998;
  if (this.did) {
    wx.closeBLEConnection({
      deviceId: this.did,
      success(res) {
        console.log("关闭蓝牙连接success", res);
      },
    });
  }
  wx.closeBluetoothAdapter({
    success(res) {
      console.log("关闭蓝牙适配器success", res);
    },
  });
};

export default mh;
