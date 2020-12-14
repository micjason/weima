const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
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

import mh from '../../utils/mh/mh'
import { encrypt, decrypt } from '../../utils/entype.js';

let a = encrypt("测试")
			console.log(a)            //g

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    status: false,
    createStatus: false,
    writeStatus: 1
  },
  useVm(){
    let o = new mh()
    o.start()
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        this.setData({
          status: true
        })
        console.log('openBluetoothAdapter success', res)
        // this.startBluetoothDevicesDiscovery()
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
    // const deviceId ='E2:79:5C:5D:93:37'
     const deviceId = 'F0:29:4E:C9:F1:77' 
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
            console.log('this._characteristicId',item.uuid,item.uuid.replace(/6E400\d{3}/,'6E400002'))
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
        console.log('this._characteristicId',this._characteristicId)
        this._characteristicId2 = this._characteristicId.replace(/6E400\d{3}/,'6E400002')
        this.writeBLECharacteristicValue()
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      this.setData(data)
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
      complete:res=>{
        console.log('write',res)
      }
    }),
    this.setData({
      writeStatus: 2
    })

    wx.onBLEConnectionStateChange(function(res) {
      console.log('执行了状态变化',res)
      that.setData({
        writeStatus: 3
      })
    })
  },
  writeBLECharacteristicValue2() {
    let buffer = new ArrayBuffer(14)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, 0x01)
    dataView.setUint8(1, 0x01)
    dataView.setUint8(2, 0x11)
    dataView.setUint8(3, 0x22)
    dataView.setUint8(4, 0x22)
    dataView.setUint8(5, 0x11)
    dataView.setUint8(6, 0)
    dataView.setUint8(7, 0)
    dataView.setUint8(8, 0)
    dataView.setUint8(9, 0)
    dataView.setUint8(10, 0)
    dataView.setUint8(11, 0)
    dataView.setUint8(12, 0)
    dataView.setUint8(13, 0)

    console.log('this._characteristicId2',this._characteristicId2)

    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId2,
      value: buffer,
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