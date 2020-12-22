import weima from "../../utils/vm.js";

Page({
  data: {
    vm: null,
    macId: "E2:79:5C:5D:93:37",
    // macId:'F0:29:4E:C9:F1:77', //车上
    key:'41ddf6dbd16c67fd34664cead63e04dd',
    passwd:'35c93f9609c9cd8fddef7f2b763ea481',
    status:-1,//-1 未连接,0 连接失败 1 连接中。。。 2 连接成功
    msg:'',
    carInfo:[]
  },

  hideInfo(){
    this.setData({
      showInfo:false
    })
  },

  show(){
    this.setData({
      showInfo:true
    })
    this.check()
  },

  callBack(str,msg) {
    this.setData({
      status:str,
      msg,
      showInfo:false
    })
    if(Object.prototype.toString.call(msg)==='[object String]'){
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      })
    }
    else{
      this.setData({
        carInfo:msg
      })
    }
  },

  start() {
    this.data.vm.start();
  },

  close() {
    this.data.vm.close();
  },

  handleCommand(res,str){
    if(res.status=='success' || res.status=='complete'){
      wx.showToast({
        title: str,
        icon: 'none',
        duration: 2000
      })
    }
  },

  flash() {
    this.data.vm.flash().then(res=>{
      this.handleCommand(res,'闪灯成功')
    });
  },

  flashAndHonking() {
    this.data.vm.flashAndHonking().then(res=>{
      console.log('闪灯鸣笛',res)
      this.handleCommand(res,'闪灯成功')
      // if(res.status=='success' || res.status=='complete'){
      //   wx.showToast({
      //     title: '闪灯鸣笛',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  lock() {
    this.data.vm.lock().then(res=>{
      console.log('上锁',res)
      this.handleCommand(res,'上锁成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '上锁成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  unlock() {
    this.data.vm.unlock().then(res=>{
      console.log('解锁',res)
      this.handleCommand(res,'解锁成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '解锁成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  roseWindow() {
    this.data.vm.roseWindow().then(res=>{
      console.log('升窗',res)
      this.handleCommand(res,'升窗成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '升窗成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  dropWindow() {
    this.data.vm.dropWindow().then(res=>{
      console.log('降窗',res)
      this.handleCommand(res,'降窗成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '降窗成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  trunkUnlock() {
    this.data.vm.trunkUnlock().then(res=>{
      console.log('后备箱打开',res)
      this.handleCommand(res,'后备箱打开成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '后备箱打开成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  trunklock() {
    this.data.vm.trunklock().then(res=>{
      console.log('后备箱关闭',res)
      this.handleCommand(res,'后备箱关闭成功')
      // if(res.status=='success'){
      //   wx.showToast({
      //     title: '后备箱关闭成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    });
  },

  openMainWindow() {
    this.data.vm.openMainWindow();
  },

  closeMainWindow() {
    this.data.vm.closeMainWindow();
  },

  openTopWindow() {
    this.data.vm.openTopWindow();
  },

  closeTopWindow() {
    this.data.vm.closeTopWindow().then(res=>{
      console.log('closeTopWindow',res)
    });
  },

  check(){
    this.data.vm.check().then(res=>{
      console.log('检查',res)
      if(res.status=='info'){
        this.setData({
          carInfo:res.content
        })
      }
    });
  },

  onShow: function () {
    this.setData({
      vm: new weima(this.data.macId, this.data.key,this.data.passwd, this.callBack),
    });
  },
});
