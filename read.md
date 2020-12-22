### 先引入vm.js，得到一个构造函数，接收4个参数
1. 设备的mac地址
2. 加密用的key
3. bookingId
4. 执行命令后的回调函数
#### 其中回调函数接收两个参数：
1. 第一个参数.蓝牙的连接状态 -1：未连接 0：连接失败 1：连接中 2：连接成功
2. 第二个参数分两种类型，[object String]:表示返回的信息，如开锁成功等  [object Array]:表示车辆的状态信息

### 车辆指令
1. start:'启动蓝牙并连接tbox设备'
2. close:'关闭蓝牙适配器'
3. lock: "上锁"
4. unlock: "解锁"
5. roseWindow: "一键升窗"
6. dropWindow: "一键降窗"
7. check: "查看车辆信息"
8. trunklock: "后备箱上锁"
9. trunkUnlock: "后备箱开锁"
10. flash：'闪灯'
11. flashAndHonking: "闪灯鸣笛"

### 指令的回调(返回一个promise对象)
#### 初始化执行vm.start(),指令解锁指令后，如vm.unlock.then(res=>{})  
#### res:'success'表示指令执行成功 'fail'表示指令执行失败