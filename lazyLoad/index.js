Component({
  externalClasses: ['border-radius'], // 用于在组件外部控制图片的圆角的class
  data: {
    url: '',
  },
  properties: {
    // 图片显示模式
    mode: {
      type: String,
      value: 'scaleToFill',
    },
    // 图片的真实url
    src: {
      type: String,
      value: '',
      observer: function(newVal) {
        if (newVal && this.alreadyShow) {
          this.setData({
            url: newVal,
          });
        }
      },
    },
    // 图片的宽，单位rpx
    width: {
      type: Number,
      value: 200,
    },
    // 图片的高，单位rpx
    height: {
      type: Number,
      value: 200,
    },
    // 节点布局区域的下边界的距离
    bottom: {
      type: Number,
      value: 100,
    },
  },
  ready: function() {
    this.alreadyShow = false; // 用于标记图片是否已经出现在屏幕中

    // observer的元素必须有高度 不然不会触发回调
    this.createIntersectionObserver()
      .relativeToViewport({ bottom: this.properties.bottom })
      .observe('.lazy-load', (rect) => {
        // 如果图片进入可见区域，但还是第一次出现
        if (!this.alreadyShow) {
          this.alreadyShow = true;
          this.setData({
            url: rect.dataset.src,
          });
        }
      });
  },
  methods: {
    imageLoad: function(e) {
      // 触发lazy-load的load事件
      this.triggerEvent('load', e);
    },
    handleTap: function(e) {
      // 触发bindlazytap自定义事件
      this.triggerEvent('lazytap', e);
    },
    // 图片加载失败后，显示一张默认的图片
    handleError: function(e) {
      // this.setData({
      //   url: '默认图片地址',
      // });
      this.triggerEvent('error', e);
    },
  },
});