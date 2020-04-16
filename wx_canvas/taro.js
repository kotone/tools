import Taro, { Component } from '@tarojs/taro'
import { Canvas } from '@tarojs/components'

export default class CanvasDraw extends Component {
	static options = {
		addGlobalClass: true
	}
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	componentWillReceiveProps (nextProps) {
		if (nextProps.data.views && !this.isPainting) {
			this.initPainting(nextProps.data)
		}
	}
	initPainting (painting) {
		const { views } = painting
		this.ctx = Taro.createCanvasContext('canvasdrawer', this.$scope)
		this.startPainting(views)
	}
	async startPainting (views) {
		if (!views.length) return
		for (let i = 0; i < views.length; i++) {
			if (views[i].type === 'image') {
				let url = await this.getImagesInfo(views[i])
				this.drawImage({
					...views[i],
					url
				})
			} else if (views[i].type === 'text') {
				this.drawText(views[i])
			} else if (views[i].type === 'rect') {
				this.drawRect(views[i])
			} else if (views[i].type === 'roundRect') {
				this.drawRoundRect(views[i])
			} else if (views[i].type === 'round') {
				this.drawRound(views[i])
			}
		}
		this.ctx.draw(false, () => {
			const system = Taro.getSystemInfoSync().system
			if (/ios/i.test(system)) {
				this.saveImageToLocal()
			} else {
				setTimeout(() => {
					this.saveImageToLocal()
				}, 800)
			}
		})
	}
	async getImagesInfo (view) {
		if (view.local) return view.url
		let res = await Taro.getImageInfo({src: view.url})
		return res.path
	}
	drawImage (params) {
		this.ctx.save()
		const { url, top = 0, left = 0, width = 0, height = 0 } = params
		this.ctx.drawImage(url, left, top, width, height)
		this.ctx.restore()
	}
	drawRound (params) {
		this.ctx.save()
		const { background, top:y = 0, left:x = 0, r = 2 } = params
		this.ctx.arc(x, y, r, 0, 2 * Math.PI)
		this.ctx.setFillStyle(background)
		this.ctx.fill()
		this.ctx.restore()
	}
	drawRect (params) {
		this.ctx.save()
		const { background, top = 0, left = 0, width = 0, height = 0 } = params
		this.ctx.setFillStyle(background)
		this.ctx.fillRect(left, top, width, height)
		this.ctx.restore()
	}
	drawRoundRect (params) {
		this.ctx.save()
		this.ctx.beginPath()
		const { background, top: y = 0, left: x = 0, width:w = 0, height:h = 0, radius:r = 10 } = params
		this.ctx.setFillStyle(background)
		 // 左上角
		this.ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
		// border-top
		this.ctx.moveTo(x + r, y)
		this.ctx.lineTo(x + w - r, y)
		this.ctx.lineTo(x + w, y + r)

		// 右上角
		this.ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
		 // border-right
		this.ctx.lineTo(x + w, y + h - r)
		this.ctx.lineTo(x + w - r, y + h)

		// 右下角
		this.ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
		// border-bottom
		this.ctx.lineTo(x + r, y + h)
		this.ctx.lineTo(x, y + h - r)

		// 左下角
		this.ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
		// border-left
		this.ctx.lineTo(x, y + r)
		this.ctx.lineTo(x + r, y)
		this.ctx.fill()
		this.ctx.closePath()
		this.ctx.clip()
		this.ctx.restore()
	}
	drawText (params) {
		const {
			color = 'black',
			content = '',
			fontSize = 16,
			top = 0,
			left = 0,
			textAlign = 'left',
			bold = false,
			letterSpacing
		  } = params
		this.ctx.save()
		this.ctx.beginPath()
		this.ctx.setTextBaseline('top')
		this.ctx.setTextAlign(textAlign)
		this.ctx.setFillStyle(color)
		if (bold) {
			this.ctx.font=`${fontSize}px bold`
		} else {
			this.ctx.setFontSize(fontSize)
		}
		if (!letterSpacing) {
			this.ctx.fillText(content, left, top)
		} else {
			for (let i = 0; i < content.length; i++) {
				let itemLeft = left + i * fontSize + letterSpacing
				this.ctx.fillText(content[i], itemLeft, top)
			}
		}
		this.ctx.restore()
	}
	saveImageToLocal () {
		const { width, height } = this.props.data
		Taro.canvasToTempFilePath({
			x: 0,
			y: 0,
			width,
			height,
			canvasId: 'canvasdrawer',
		}, this.$scope).then(res => {
			if (res.errMsg === 'canvasToTempFilePath:ok') {
				this.isPainting = true
				this.getImage(res.tempFilePath)
			} else {
				this.isPainting = false
			}
		}).catch(err => {
			console.log(err, '保存失败')
		})
	}
	getImage(tempFilePath) {
		this.props.onGetImage && this.props.onGetImage(tempFilePath)
	}
	render() {
		const { width, height} = this.props.data
		return (
			<Canvas className={this.props.className} style={{width: width + 'px', height: height + 'px'}} canvasId='canvasdrawer' />
		)
	}
}
