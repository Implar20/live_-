Page({
	data: {
		liveShow: {},
		msg: '',
		msg_list: [],
		input_b: '',
		user_info: {},
		page_w: 0,
		page_h: 0,
		user_id: '',
		show: 'none',
		ws_url: 'wss://www.sycj.art/livesocket/',
		limit: 0
	},
	// input 位置
	focus(e) {
		let h = e.detail.height
		this.setData({
			input_b: h
		})
	},
	no_focus(e) {
		this.setData({
			input_b: ''
		})
	},
	inT(e) {
		this.setData({
			msg: e.detail.value
		})
	},
	sendMsg() {
		let that = this
		let arr = that.data.msg_list
		let cache = wx.getStorageSync('user_info')

		// wss data
		let send_obj = that.data.msg + ',' + cache.avatarUrl + ',' + cache.nickName + ',' + that.data.user_id

		wx.sendSocketMessage({
			data: send_obj
		})
		send_obj = send_obj.split(',')
		arr.push(send_obj)

		this.setData({
			msg_list: arr,
			msg: ''
		})
	},
	onLoad(options) {
		let that = this

		wx.request({
			url: 'https://www.sycj.art/live/getReadyRoom',
			success(res) {
				that.setData({
					liveShow: res.data[0]
				})
			}
		})

		wx.getSystemInfo({
			success(res) {
				let w = res.windowWidth
				let h = res.windowHeight
				that.setData({
					page_w: w,
					page_h: h
				})
			}
		})
		let cache = wx.getStorageSync('user_info')
		let user_id = wx.getStorageSync('user_id')
		that.setData({
			user_info: cache,
			user_id: user_id
		})

		wx.connectSocket({
			url: that.data.ws_url + options.id + '/' + that.data.user_id
		})
		wx.onSocketOpen(() => {
			console.log('WebSocket 连接打开')
			that.setData({
				show: 'block'
			})
			setTimeout(() => {
				that.setData({
					show: 'none'
				})
			}, 1500)
		})
		wx.onSocketError((res) => {
			let limit = that.data.limit
			if (limit > 2) return
			setTimeout(() => {
				wx.connectSocket({
					url: that.data.ws_url + options.id + '/' + that.data.user_id,
					fail() {
						limit++
						that.setData({
							limit: limit
						})
					}
				})
			}, 5000)
		})
		wx.onSocketClose((res) => {
			let limit = that.data.limit
			if (limit > 2) return
			setTimeout(() => {
				wx.connectSocket({
					url: that.data.ws_url + options.id + '/' + that.data.user_id,
					fail() {
						limit++
						that.setData({
							limit: limit
						})
					}
				})
			}, 5000)
		})
	},
	onShow() {
		let that = this
		wx.onSocketMessage((res) => {
			let msg = res.data.split(',')
			let arr = that.data.msg_list
			arr.push(msg)
			that.setData({
				msg_list: arr
			})
		})
	},
	onUnload() {
		wx.closeSocket({
			success() {
				console.log('关闭成功')
			}
		})
	}
})