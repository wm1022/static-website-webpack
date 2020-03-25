/*
 * carousel v1.0.5
 */
;(function(factory){if(typeof define==='function'&&define.amd){define(['jquery'],factory)}else{factory(jQuery)}}(function($,undefined){

	// DEFAULTS
	var pluginName = 'carousel'
      , defaults = {
			// 默认显示第几项
			start: 0
		    // 是否显示prev next按钮
		  , control: true
		    // 是否显示编号
		  , indicators: true
			// 可视区域内显示的数量
		  , display: 1
		  , responsive: null
		    // 是否自动播放
		  , auto: true
		    // 自动播放间隔时间
		  , interval: 3000
		    // 每次播放持续时间
		  , duration: 200
		  	// 每次播放开始callback
		  , onmovestart: null
		    // 每次播放结束callback
		  , onmoveend: null
			// destroy
		  , destroy: false
        }

	// CLASS DEFINITION
    function Plugin (element,options) {
        this.$element = $(element)
        this.options = $.extend( {}, defaults, options)
        this._defaults = defaults
        this._name = pluginName
        this.init()
    }

	// init
    Plugin.prototype.init = function () {
		var _this = this

		// destroy
		if (this.options.destroy) return this.destroy()

		//+ 2015.6.1
		this.$element.css('visibility', 'hidden')

		// elements
		this.$viewport = this.$element.find('.g-carousel-viewport')
		this.$inner = this.$element.find('.g-carousel-inner')
		this.$items = this.$inner.children()
		this.$control = this.$element.find('.g-carousel-control')
		this.$indicators = this.$element.find('.g-carousel-indicators')

		// collection
		this.o = {}

		// active index
		this.active = 0
		// auto() timeout
		this.timer = false
		// resize timeout
		this.timerresize = false
		// is moving
		this.moving = false
		// is pausing
		this.pausing = false

		// bind events
		this.bindEvents()
	}
	
	// 更新
    Plugin.prototype.update = function () {
		var _this = this
		  , remainder  = this.$items.length % this.o.display
		  , i
		  , item_fill

		// fill item
		if (!!remainder) {
			item_fill = ['<', this.$items[0].tagName, ' class="', this.$items[0].className, ' fill', '"></', this.$items[0].tagName, '>'].join('')
			for (i = 0; i < this.o.display - remainder; i++) {
				this.$inner.append(item_fill)
			}
			this.$items = this.$inner.children()
		}
		
		// clone item
		for (i = 0; i < this.o.display; i++) {
			this.$items.eq(i).clone(true).addClass('clone').appendTo(this.$inner)
			this.$items.eq(-i - 1).clone(true).addClass('clone').prependTo(this.$inner)
		}
		
		// reset this.$items (contain fill item and clone item)
		this.$items = this.$inner.children()

		// update size
		this.$items.css({
			'width': this.o.calibration
		})
		this.$inner.css({
			'width': this.o.calibration * this.$items.length
		})

		// initialize control
		this.o.control ? this.$control.removeAttr('style') : this.$control.hide()
		
		// add indicators's items
		if (this.o.indicators && this.$indicators.length && !this.$indicators.children().length) {
			for (i = 0; i < this.o.steps; i++) {
				this.$indicators.append('<li><i></i></li>')
			}
		}
		
		// initialize indicators active
		this.o.indicators ? this.$indicators.removeAttr('style').children().removeClass('active').eq(this.active).addClass('active') : this.$indicators.hide()
		
		// move to start
		this.move(this.options.start, true, true)
    }

	// 绑定事件
    Plugin.prototype.bindEvents = function () {
		var _this = this
		  , eid = this.$element.attr('id')
		  , win = $(window)
		
		// window resize
		win.on('resize.carousel.' + eid, function () {
			_this.timerresize && clearTimeout(_this.timerresize)
			_this.timerresize = setTimeout(function () {
				if (!_this.$element.data('plugin_' + pluginName)) return

				// remove html & styles
				_this.$inner.find('.clone').remove()
				_this.$inner.find('.fill').remove()
				_this.$inner.removeAttr('style')
				_this.$items.removeAttr('style')
				_this.$indicators.html('')

				// reset this.$items
				_this.$items = _this.$inner.children()

				// get collection
				if (!_this.options.responsive) {
					_this.o.display = _this.options.display
				} else {
					$.each(_this.options.responsive, function (i, n) {
						if (win.width() >= i) _this.o.display = n
					})
				}
				_this.o.steps = Math.max(1, Math.ceil(_this.$items.length / _this.o.display))
				_this.o.calibration = Math.ceil(_this.$viewport.outerWidth() / _this.o.display)
				_this.o.dividing = _this.o.calibration * _this.o.display
				_this.o.control = _this.o.steps === 1 ? false : _this.options.control
				_this.o.indicators = _this.o.steps === 1 ? false : _this.options.indicators
				_this.o.auto = _this.o.steps === 1 ? false : _this.options.auto

				// update
				_this.update()
			}, 200)
		}).triggerHandler('resize.carousel.' + eid)

		// viewport
		if ('ontouchend' in document) {	// touch
			this.$viewport
				.on('touchstart.carousel', function (e) {
					return _this.touchstart(e)
				})
				.on('touchmove.carousel', function (e) {
					return _this.touchmove(e)
				})
				.on('touchend.carousel', function (e) {
					return _this.touchend(e)
				})
		} else {	// mouseenter/mouseleave
			this.$viewport
				.on('mouseenter.carousel', function () {
					_this.pause()
				})
				.on('mouseleave.carousel', function () {
					_this.pausing = false
					_this.options.auto && _this.auto()
				})
		}
		
		// prev/next button
		if (this.options.control && this.$control.length) {
			this.$element
				.on('click', '.g-carousel-prev a', function (e) {
					e.preventDefault()
					if (_this.moving) return
					_this.move(-1)
				})
				.on('click', '.g-carousel-next a', function (e) {
					e.preventDefault()
					if (_this.moving) return
					_this.move(1)
				})
		}
		
		// indicators
		if (this.options.indicators && this.$indicators.length) {
			this.$indicators.on('click.carousel', 'li', function () {
				if (_this.moving) return
				_this.move($(this).index(), true)
			})
		}
	}
	
	// 事件: touch start
    Plugin.prototype.touchstart = function(e) {
		var _this = this
		  , touches = e.originalEvent.touches[0]
		
		this.touchtimer = Number(new Date())
		this.touchstartx = touches.pageX
		this.touchstarty = touches.pageY
		this.innerPosL = this.$inner.position().left
		
		// pause
		this.pause()
		
		return e.stopPropagation()
    }
	
	// 事件: touch move
    Plugin.prototype.touchmove = function(e) {
		var _this = this
		  , touches = e.originalEvent.touches[0]
		
		if (Math.abs(touches.pageY - this.touchstarty) < Math.abs(touches.pageX - this.touchstartx)) {
			e.preventDefault()
			this.$inner.css('left', (this.innerPosL + touches.pageX - this.touchstartx) + 'px')
		}
		
		return e.stopPropagation()
    }
	
	// 事件: touch end
    Plugin.prototype.touchend = function(e) {
		var _this = this
		  , posL = this.$inner.position().left
		  , half = Math.abs(posL - this.innerPosL) > this.o.calibration * 0.5 || Math.abs(posL - this.innerPosL) > this.o.calibration * 0.1 && (Number(new Date()) - this.touchtimer < 250)
		
		// swipe right
		if (posL > this.innerPosL) {
			half ? this.move(-1) : this.move(this.active, true)
		}
		// swipe left
		if (posL < this.innerPosL) {
			half ? this.move(1) : this.move(this.active, true)
		}
		
		// restart
		this.pausing = false
		this.o.auto && this.auto()
		
		return e.stopPropagation()
    }

	// 自动播放
    Plugin.prototype.auto = function () {
		var _this = this

		// is pausing, return
		if (this.pausing) return
		
		// setTimeout
		this.timer && clearTimeout(this.timer)
		this.timer = setTimeout(function () {
			_this.move(1)
		}, this.options.interval)
	}
	
	// 暂停
    Plugin.prototype.pause = function () {
		this.pausing = true
		this.timer = clearTimeout(this.timer)
	}
	
	// 每次播放结束
    Plugin.prototype.end = function (next) {
		var _this = this
		
		// set new active
		this.active = next
		
		// moving: false
		this.moving = false
		
		// styles & auto()
		this.o.indicators && this.$indicators.children().removeClass('active').eq(this.active).addClass('active')
		if (this.active === 0) this.$inner.css('left', -((this.active + 1) * this.o.dividing))
		if (this.active === this.o.steps - 1) this.$inner.css('left', -(this.o.steps * this.o.dividing))
		this.o.auto && this.auto()
	}

	// 播放
    // 播放
	Plugin.prototype.move = function (n, p, i) {
		var _this = this
		  , next = p ? n : this.active += n
		  , position = {}

		// clearTimeout
		this.timer && clearTimeout(this.timer)

		// moving: true
		this.moving = true
				
		// set position[left/top] & next
		position['left'] = -((next + 1) * this.o.dividing)
		if (next >= this.o.steps) next = 0
		if (next < 0) next = this.o.steps - 1

		// callback	: on move end
		if (typeof _this.options.onmovestart == 'function') _this.options.onmovestart.call(_this, next)	

		// animate
		this.$inner.animate(position, {
			queue: false
		  , duration: _this.options.duration
		  , complete: function () {
				//+ 2015.6.1
				i && _this.$element.css({
					'visibility': 'visible'
				  , 'background': 'none'
				})
			  
				// callback	: on move end
				if (typeof _this.options.onmoveend == 'function') _this.options.onmoveend.call(_this, next)			  
			  	// end
				_this.end(next)
			}
		})
	}
	
	// Destroy plugin
    Plugin.prototype.destroy = function () {
		var _this = this.$element.data('plugin_' + pluginName)

		// no data, return
		if (!_this) return

		// stop animate
		_this.$inner.stop(true)
		
		// clearTimeout
		clearTimeout(_this.timer)
		clearTimeout(_this.timerresize)

		// off event
		$(window).off('.carousel.' + _this.$element.attr('id'))
		_this.$viewport.off('.carousel')
		_this.$element.off('.carousel')
		_this.$indicators.children().off('.carousel')
		
		// remove html & styles
		_this.$inner.find('.clone').remove()
		_this.$inner.find('.fill').remove()
		_this.$inner.removeAttr('style')
		_this.$items.removeAttr('style')
		_this.$indicators.html('')
		
		// remove data
		_this.$element.removeData('plugin_' + pluginName)
		
		// clear _this
		_this = null
	}

    return $.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!!options && !!options.destroy) {
				return new Plugin(this, options)
			}
			if (!$(this).data('plugin_' + pluginName)) {
				return $(this).data('plugin_' + pluginName, new Plugin(this, options))
			}
		})
    }
}));
