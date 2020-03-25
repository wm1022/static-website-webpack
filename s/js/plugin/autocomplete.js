/*
 * Autocomplete 2017.09.15
 * 1. 增加token，token来自meta[name="csrf-token"]
 * 2. 修正dataType无效的bug
 * 3. 返回的数据格式有改动：
 * {
 *   "error": 0,
 *   "data": [ ... ]
 * }
 */

;(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory)
	} else {
		factory(jQuery)
	}
}(function($, undefined) {

	// DEFAULTS
	var pluginName = 'autocomplete',
		defaults = {
			// 数据来源
			source: null,
			// ajax请求的数据格式
			dataType: 'json',
			// 至少输入的字符数
			minChars: 1,
			// 击键后的延迟时间
			delay: 200,
			// 结果中的每一行都会调用这个函数，返回值将用LI元素包含，显示在下拉列表中。参数(name, data): 高亮之后的name、每一条的所有数据
			formatItem: function(name, data) {
				return name
			},
			// 下拉框的宽度，default: input's width
			width: 0,
			// 选定之后的callback: function(el, data) {}
			select: null
		}

	// CLASS DEFINITION
	function Plugin(element, options) {
		this.$element = $(element)
		this.options = $.extend({}, defaults, options)
		this._defaults = defaults
		this._name = pluginName
		this.init()
	}

	// init
	Plugin.prototype.init = function() {
		var _this = this

		var isIE8 = document.all && !document.addEventListener

		// 获取token
		this._token = $('meta[name="csrf-token"]').attr('content')

		// input attr autocomplete off
		this.$element.attr('autocomplete', 'off')

		// render menu	
		this.$menu = $('<div/>')
			.addClass('g-autocomplete ' + this.$element.attr('id'))
			.hide()
			.appendTo(document.body)

		// render list	
		this.$list = $('<ul/>')
			.appendTo(this.$menu)
			.on('mouseenter', 'li', function(e) {
				$(this)
					.addClass('active')
					.siblings().removeClass('active')
			})
			.on('mouseleave', function(e) {
				$(this).find('li').removeClass('active')
			})
			.on('mousedown', function() {
				_this.mouseDownOnSelect = true
			})
			.on('mouseup', function() {
				_this.mouseDownOnSelect = false
			})
			.on('click', 'li', function(e) {
				_this.selectOpt()
				_this.$element.focus()
				return false
			})

		// 确保item mousedown的时候，menu不会隐藏
		this.mouseDownOnSelect = false
			// 存储临时数据，每次ajax获取的数据，都存入此变量
		this.tempDate = {}
			// active item index
		this.active = -1
			// 键盘输入timeout
		this.timer = false
			// 记录上一次的关键词
		this.previous = ''
			// 判断input是否获得焦点
		this.hasFocus = 0

		// bind events
		var KEY = {
			UP: 38,
			DOWN: 40,
			RETURN: 13,
			ESC: 27
		}
		this.$element
			.on('keydown.autocomplete', function(e) {
				_this.hasFocus = 1
				switch (e.which) {

					case KEY.UP:
						if (_this.$menu.is(':visible')) {
							e.preventDefault()
							_this.move(-1)
						}
						break

					case KEY.DOWN:
						if (_this.$menu.is(':visible')) {
							e.preventDefault()
							_this.move(1)
						}
						break

					case KEY.RETURN:
						if (_this.selectOpt()) {
							e.preventDefault()
							return false
						}
						break

					case KEY.ESC:
						_this.hide()
						break

					default:
						if (isIE8) _this.timer = setTimeout(function() {
							_this.change()
						}, _this.options.delay)
						break
				}
			})
			.on('input.autocomplete', function() {
				if (!isIE8) _this.timer = setTimeout(function() {
					_this.change()
				}, _this.options.delay)
			})
			.on('blur', function() {
				_this.hasFocus = 0;
				!_this.mouseDownOnSelect && _this.hide()
			})
			.on('click', function() {
				if (!_this.$menu.is(':visible')) {
					_this.change()
				}
			})
	}

	Plugin.prototype.change = function() {
		var current = $.trim(this.$element.val())

		// 如果关键词与上一次的相同，返回
		if (current == this.previous) return

		// set previous
		this.previous = current

		// 达到最小字数，获取数据
		if (current.length >= this.options.minChars) return this.request(current.toLowerCase())

		// 小于最小字数，隐藏
		this.hide()
	}

	// 获取数据
	Plugin.prototype.request = function(q) {
		var _this = this,
			datas = {}

		// 读取tempData数据
		if (_this.tempDate[q]) {
			_this.response(q, _this.tempDate[q])
		}
		// ajax获取数据
		else if ((typeof _this.options.source == 'string') && (_this.options.source.length > 0)) {
			datas['q'] = q
			if (_this._token) datas['_token'] = _this._token

			// 如果上一个ajax为加载未完成，取消
			if (_this.xhr) _this.xhr.abort()
			// ajax get
			_this.xhr = $.ajax({
				url: _this.options.source,
				data: datas,
				dataType: _this.options.dataType || 'json',
				cache: false,
				success: function(data) {
					if (data.error === 0) {
						var parsed = parse(data.data)
						_this.tempDate[q] = parsed
						_this.response(q, parsed)
					}
				}
			})
		}
		// 失效
		else {
			_this.$list.empty()
			_this.hide()
		}

		// 解析数据
		function parse(data) {
			var parsed = [],
				v
			for (var i = 0; i < data.length; i++) {
				v = data[i]
				if (!v) return
				parsed[parsed.length] = {
					value: v['name'],
					result: v
				}
			}
			return parsed
		}
	}

	// 响应
	Plugin.prototype.response = function(q, data) {
		// 如果数据不为空，且input有焦点，渲染且显示
		if (data && data.length && this.hasFocus) {
			this.renderItems(q, data)
			this.show()
			return
		}

		// 否则，隐藏
		this.hide()
	}

	// 渲染items
	Plugin.prototype.renderItems = function(q, data) {
		var _this = this,
			datai = [],
			formatted = '',
			li

		// 清空list
		this.$list.empty()

		// items appendTo list
		for (var i = 0; i < data.length; i++) {
			datai = data[i]
			if (!datai) continue

			// formatted
			formatted = this.options.formatItem(this.highlight(q, datai.value), datai.result)
			if (formatted === false) continue

			// appendTo
			li = $('<li/>').html(formatted).appendTo(this.$list)

			// set data
			li.data('autocomplete_data', datai)
		}

		// set items
		this.$items = this.$list.find('li')
	}

	// 高亮数据
	Plugin.prototype.highlight = function(q, value) {
		return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + q.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), '<b>$1</b>')
	}

	// 显示menu
	Plugin.prototype.show = function() {
		var offset = this.$element.offset()

		this.$menu.css({
			'display': 'block',
			'width': this.options.width ? this.options.width : this.$element.outerWidth(),
			'top': offset.top + this.$element.outerHeight() - parseInt(this.$element.css('border-bottom-width')),
			'left': offset.left
		})
	}

	// 隐藏menu
	Plugin.prototype.hide = function() {
		clearTimeout(this.timer)
		this.$menu.hide();
		!!this.$items && this.$items.removeClass('active')
		this.active = -1
	}

	// 上下移动
	Plugin.prototype.move = function(n) {
		// set active item
		this.$items.removeClass('active')
		this.active += n
		if (this.active < 0) {
			this.active = this.$items.length - 1
		} else if (this.active >= this.$items.length) {
			this.active = 0
		}
		this.$items.slice(this.active, this.active + 1).addClass('active')

		// change input value
		this.$element.val(this.$items.filter('.active').data('autocomplete_data').value)
	}

	// 选取
	Plugin.prototype.selectOpt = function(q, data) {
		var selectedItem = this.$list.find('.active'),
			selectedData = selectedItem.data('autocomplete_data')

		// remove class
		selectedItem.removeClass('active')

		// no data, return false
		if (!selectedData) return false

		// set previous
		this.previous = selectedData.value

		// change input value
		this.$element.val(selectedData.value)

		// 隐藏
		this.hide()

		// callback: select
		if (typeof this.options.select == 'function') this.options.select.call(this, selectedItem, selectedData.result)

		// return true
		return true
	}

	return $.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$(this).data('plugin_' + pluginName)) {
				return $(this).data('plugin_' + pluginName, new Plugin(this, options))
			}
		})
	}

}));