//status 0:关，1:开
let door = [{
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

let windowInfo = [{
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

let fail = [{
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
let disconnect = [{
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

export {
  door,
  windowInfo,
  fail,
  disconnect
}