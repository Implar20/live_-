Page({
    data: {
        live: [],
        display: 'none'
    },
    toLive(e) {
        let index = e.currentTarget.dataset.index
        console.log(e.currentTarget)
        wx.navigateTo({
            url: '../live/live?id=' + index,
        })
    },
    onGotUserInfo(e) {
        console.log(e.detail.userInfo)
        let user_info = e.detail.userInfo
        wx.setStorageSync('user_info', user_info)
        this.setData({
            display: 'none'
        })
    },
    onLoad() {
        let that = this
        let cache = wx.getStorageSync('user_info') || []
        if (!cache.nickName) {
            that.setData({
                display: 'block'
            })
        }
        wx.login({
            success(res) {
                wx.setStorageSync('user_id', res.code)
            }
        })
        wx.request({
            url: 'https://www.sycj.art/live/getReadyRoom',
            success(res) {
                that.setData({
                    live: res.data
                })
            }
        })
    }
})