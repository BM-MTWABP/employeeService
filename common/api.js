// common/api.js
import wepy from 'wepy'
import G from './global'

/**
 * code 置换登录态 session 接口
 */
function login(code) {
  return wepy.request({
    url: G.apiUrl + '/api/user/login',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      code: code
    }
  })
}

/**
 * 封装 request 方法，在第一次登录态失效后自动登录并转换 session 后重发请求
 */
function request(data, tryagain) {
  return new Promise((resolve, reject) => {
    wepy.request(data).then(res => {
      wepy.hideLoading()
      if (res.data.code === 403) { // 登录态验证失败
        console.log('session 无效')
        if (tryagain) {
          return reject(res) // code 置换 session 后依然返回登录态验证失败
        }
        return wepy.login() // 可能是session过期等原因，获取最新 code
          .then(loginRes => { // 使用最新code置换 session
            return login(loginRes.code)
              .then(sessionData => {
                console.log('重新获取session')
                var session = sessionData.data.data.sessionKey
                wepy.setStorageSync('session', session)
                data.header.sessionKey = session
                console.log('重新发起请求')
                request(data, true)// 重发请求
                  .then(res => resolve(res))
                  .catch(res => reject(res))
              }).catch(reject)
          }).catch(reject)
      } else {
        if (res.data.code !== 0 && res.data.result !== true && !res.data.sltPath && res.data.status !== '1' &&res.data.success!==true) {
          reject(res)
          wx.showModal({
            content: res.data.msg ? res.data.msg : '网络出问题啦',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
              }
            }
          })
        } else {
          resolve(res)
        }
      }
    }).catch(res => {
      wepy.hideLoading()
      reject(res)
      wx.showModal({
        content: '网络出问题啦',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
  })
}

/**
 * 封装 uploadFile 方法，在第一次登录态失效后自动登录并转换 session 后重发请求
 */
function uploadFile(data, tryagain, type) {
  return new Promise(function(resolve, reject) {
    wepy.uploadFile(data)
    .progress(res => {
      wx.showLoading({
        title:res.progress+"%"
      })
    }).then(function(res) {
      wepy.hideLoading()
      if (res.data.code === 403) {
        // 登录态验证失败
        console.log('session 无效')
        if (tryagain) {
          return reject(res) // code 置换 session 后依然返回登录态验证失败
        }
        return wepy.login() // 可能是session过期等原因，获取最新 code
          .then(function(loginRes) {
            // 使用最新code置换 session
            return login(loginRes.code).then(function(sessionData) {
              console.log('重新获取session')
              var session = sessionData.data.data.sessionKey
              wepy.setStorageSync('session', session)
              data.header.sessionKey = session
              console.log('重新发起请求')
              request(data, true) // 重发请求
                .then(function(res) {
                  return resolve(res)
                }).catch(function(res) {
                return reject(res)
              })
            }).catch(reject)
          }).catch(reject)
      } else {
        console.log(res.data)
        if (res.statusCode !== 200) {
          reject(res)
          wx.showModal({
            content: '网络出问题啦',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
              }
            }
          })
        } else {
          resolve(res)
        }
      }
    }).catch(function (res) {
      wepy.hideLoading();
      reject(res);
      wx.showModal({
        content: '网络出问题啦',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
          }
        }
      })
    });
  });
}

export default {
  /**
   * code 置换登录态 session 接口
   */
  login(code) {
    return wepy.request({
      url: G.apiUrl + '/api/user/login',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        code: code
      }
    })
  },
  /**
   * 封装 request 方法，在第一次登录态失效后自动登录并转换 session 后重发请求
   */



}
