import weima from "../../utils/new/vm";

Page({
  data: {
    vm: null,
    macId: "",
    key: "",
    passwd: "",

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
