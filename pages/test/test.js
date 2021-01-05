import weima from "../../utils/new/vm.min.js";

Page({
  data: {
    vm: null,
    // macId: "E2:79:5C:5D:93:37",
    // macId:'F0:29:4E:C9:F1:77', //车上
    // macId:'77F1C94E29F0',
    // key:'e884c14cdde82c2f1828d7fc7670980b',
    // passwd:'a20a71b4e27beca154cb62e831c15b1d',
    // macId: "DA9BC3E719CF",
    // key: "87a79e583ac8636eed3415368774652b",
    // passwd: "f07f95ae1aa1a7b0d8a9a2f30ce5cf2b",
    // macId: "A47C660F17DE",
    // key: "c9155909fd81eb6a3b23ffedc96c5832",
    // passwd: "91e443e598ff0964b57aa8bf7965f5e9",
    macId: "",
    key: "",
    passwd: "",

    // 薛总145437
    // macId: "E653B4F50DCB",
    // key: "02635c276de714909374c7417769f49e",
    // passwd: "9a576f5be10bf74a6e2bedc519eb3dd5",

    // 薛总145306
    // macId: "0CF84D62C6FB",
    // key: "556bc12342cf9799f2d8189fa0a923f5",
    // passwd: "bc41e9838d135be31a8cdb405512e4a9",

    // 薛总145392
    // macId: "D06181FECACF",
    // key: "48c71f96c935a8b2c34619a961fdc763",
    // passwd: "c08a72b36a11c8b6b7b9edf6f98f0209",

    // 薛总145348
    // macId: "CC79DEDE54EF",
    // key: "6362ee6ba1e70ad4232ff59d55c268b1",
    // passwd: "4a38fffabd0949f050905ab9f107dfb4",

    status: -1, //-1 未连接,0 连接失败 1 连接中。。。 2 连接成功
    msg: "",
    carInfo: [],
    showInfo: false,
  },

  bindMacId: function (e) {
    this.setData({
      macId: e.detail.value,
    });
  },
  bindKey: function (e) {
    this.setData({
      key: e.detail.value,
    });
  },
  bindPass: function (e) {
    this.setData({
      passwd: e.detail.value,
    });
  },
  hideInfo(e) {
    this.setData({
      showInfo: false,
    });
  },
  check() {
    var result = this.checkStatus();
    if (!result) {
      return false;
    }
    this.setData({
      showInfo: true,
    });
    this.data.vm.check().then((res) => {
      if (res.status == "info") {
        this.setData({
          carInfo: res.content,
        });
      }
    });
  },

  callBack(str, msg) {
    this.setData({
      status: str,
      msg,
    });
    wx.showToast({
      title: msg,
      icon: "none",
      duration: 2000,
    });
  },

  start() {
    if (this.data.macId == "") {
      wx.showToast({
        title: "请输入macId",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    if (this.data.key == "") {
      wx.showToast({
        title: "请输入key",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    if (this.data.passwd == "") {
      wx.showToast({
        title: "请输入passwd",
        icon: "none",
        duration: 2000,
      });
      return false;
    }

    if (this.data.status === 1) {
      wx.showToast({
        title: "连接中",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    if (this.data.status === 2) {
      wx.showToast({
        title: "已连接",
        icon: "none",
        duration: 2000,
      });
      return false;
    }

    this.setData({
      vm: new weima(
        this.data.macId,
        this.data.key,
        this.data.passwd,
        this.callBack
      ),
    });
    this.data.vm.start();
  },
  close() {
    if (this.data.status != 2) {
      wx.showToast({
        title: "蓝牙已断开",
        icon: "none",
        duration: 2000,
      });
    }
    this.setData({
      status: -1,
    });
    if (this.data.vm) {
      this.data.vm.close();
    }
  },

  doCommand(e) {
    var result = this.checkStatus()
    if(!result){
      return false
    }
    const that  = this
    var command = e.target.dataset.type;
    var name = e.target.dataset.name;
    console.log("command", command);
    switch (command) {
      case "flash":
        this.data.vm.flash().then((res) => {
          console.log("res", res);
          that.handleCommand(res, name);
        });
        break;
      case "flashAndHonking":
        this.data.vm.flashAndHonking().then((res) => {
          console.log("res", res);
          that.handleCommand(res, name);
        });
        break;
      case "lock":
        this.data.vm.lock().then((res) => {
          that.handleCommand(res, name);
        });
        break;
      case "unlock":
        this.data.vm.unlock().then((res) => {
          that.handleCommand(res, name);
        });
        break;
      case "roseWindow":
        this.data.vm.roseWindow().then((res) => {
          that.handleCommand(res, name);
        });
        break;
      case "dropWindow":
        this.data.vm.dropWindow().then((res) => {
          that.handleCommand(res, name);
        });
        break;
      case "trunkUnlock":
        this.data.vm.trunkUnlock().then((res) => {
          that.handleCommand(res, name);
        });
        break;
      case "trunklock":
        this.data.vm.trunklock().then((res) => {
          that.handleCommand(res, name);
        });
        break;
    }
  },

  checkStatus() {
    var result = true;
    if (this.data.status === 1) {
      wx.showToast({
        title: "连接中，请稍后",
        icon: "none",
        duration: 2000,
      });
      result = false;
    }
    if (this.data.status === -1) {
      wx.showToast({
        title: "蓝牙未连接",
        icon: "none",
        duration: 2000,
      });
      result = false;
    }
    if (this.data.status === 0) {
      wx.showToast({
        title: "蓝牙连接失败",
        icon: "none",
        duration: 2000,
      });
      result = false;
    }
    return result;
  },

  handleCommand(res, str) {
    if (res.status == "success" || res.status == "complete") {
      wx.showToast({
        title: str,
        icon: "none",
        duration: 2000,
      });
    } else if (res.status == "fail") {
      wx.showToast({
        title: res.content,
        icon: "none",
        duration: 2000,
      });
    }
  },
});
