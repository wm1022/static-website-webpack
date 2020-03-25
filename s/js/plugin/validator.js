/* 
 * validator v1.09
 */
;
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory)
	} else {
		factory(jQuery)
	}
}(function($, undefined) {

	// DEFAULTS
	var pluginName = 'validator',
		defaults = {
			// form action url
			actionUrl: null,

			// ajax post success
			// param: 提交的数据
			// msg: 响应的数据
			success: function(param, msg) {},

			// 是否显示成功Toast
			isShowSuccessToast: true,

			// 请求为同步/异步，设置为false后，ajax提交表单请求后，window.open()不会被浏览器拦截
			async: true,

			// 是否避免重复提交
			// true：检查前一次提交的数据与这一次是否相同，如果相同，不会发起ajax请求
			isAvoidRepeatPost: true
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
		var _this = this,
			toast = this.appendToast()

		// 记录上一条提交的数据（用于避免重复提交）
		this.prevData = {}

		// 记录上一条toast（用于避免重复提交）
		this.prevToast = ''

		// 记录上一条返回的数据（用于避免重复提交）
		this.prevMsg = {}

		// 设置form action url
		this.actionUrl = !!this.options.actionUrl ? this.options.actionUrl : this.$element.attr('data-action')

		// 获取token
		this._token = $('meta[name="csrf-token"]').attr('content')

		// 绑定事件
		$('#' + this.$element.attr('id') + '-submit').on('click.' + this.$element.attr('id'), function() {
			var ispassed = true

			// blur
			$(this).blur()

			// 清空待提交的数据
			_this.jsonData = {}
			if (_this._token) _this.jsonData['_token'] = _this._token

			// 清空错误提示
			toast.addClass('g-hidden').html('')

			// 获取collection
			_this.setCollection()

			// 验证
			$.each(_this.collection, function(i, n) {
				// 如果有一项未通过验证，停止
				if (!ispassed) return
					// value为空
				if (!n.value) {
					// 非必填项
					if (!n.required) return _this.jsonData[i] = n.value
						// 必填项
					ispassed = false
					return _this.showToast(n.msg)
				}
				// value非空，判断格式
				if (!_this.checkValFormat(n.type, n.value)) {
					ispassed = false
					return _this.showToast(n.type === 'tel' ? '手机号码格式有误' : '')
				}
				// 通过，生成数据
				return _this.jsonData[i] = n.value
			})

			// ajax提交数据 or 显示错误提示
			ispassed && _this.postJsonData()
		})

	}

	// 获取inputs
	Plugin.prototype.getInputs = function() {
		return this.$element.find(':input')
	}

	// 获取input value
	Plugin.prototype.getValue = function(el) {
		var _this = this,
			$el = $(el),
			value = null,
			get_radio_val = function() {
				return $.trim(_this.getInputs().filter('[name = ' + $el.attr('name') + ']:radio:checked').val())
			},
			get_checkbox_val = function() {
				var v = []
				$.each(_this.getInputs().filter('[name = ' + $el.attr('name') + ']:checkbox:checked'), function(i, n) {
					v[i] = $.trim($(this).val())
				})
				return v
			}

		// 判断类型
		switch (el.type) {
			case 'select-one':
				value = $.trim($el.find('option:selected').val())
				break;
			case 'radio':
				value = get_radio_val()
				break;
			case 'checkbox':
				value = get_checkbox_val().length == 0 ? '' : get_checkbox_val()
				break;
			default:
				value = $el.attr('placeholder') == $.trim($el.val()) ? '' : $.trim($el.val())
				break;
		}
		return value
	}

	// 生成collection
	Plugin.prototype.setCollection = function() {
		var _this = this

		this.collection = {}

		$.each(_this.getInputs(), function(i, el) {
			var $el = $(el),
				name = $el.attr('name')

			// inpuet无name属性，不加入验证
			if (!name) return

			// 生成
			_this.collection[name] = {
				type: this.type,
				required: !!$el.attr('required'),
				msg: $el.attr('data-validator-msg'),
				value: _this.getValue(el)
			}
		})

		return this.collection
	}

	// 判断数据格式
	Plugin.prototype.checkValFormat = function(type, value) {

		var _this = this,
			s = true,
			type = /^[a-zA-Z]+/.exec(type)[0]

		// 手机号码格式
		if ((type === 'tel') && (!(/^1[0-9]{10}$/.test(value)))) {
			s = false
		}

		return s
	}

	// 插入toast
	Plugin.prototype.appendToast = function() {
		var el

		// append
		if (!!$('#J-g-toast').length) {
			el = $('#J-g-toast')
		} else {
			el = $('<div id="J-g-toast" class="g-toast g-hidden"></div>')
			$('body').append(el)
		}

		return el
	}

	// 显示toast
	Plugin.prototype.showToast = function(text) {
		var el = this.appendToast()

		// IE6 alert
		if (document.all && !window.XMLHttpRequest) return alert(text)

		// 插入文字
		el.html('<span>' + text + '</span>')

		// 动画
		el.removeClass('g-hidden')
		setTimeout(function() {
			el.addClass('g-toast--showing')
		}, 20)
		setTimeout(function() {
			el.removeClass('g-toast--showing')
		}, 2000)
		setTimeout(function() {
			el.addClass('g-hidden')
		}, 2100)
	}

	// 判断上一条提交的数据与这条提交的数据是否相同
	Plugin.prototype.isDataRepeat = function() {
		var _this = this,
			isRepeat = true

		// 判断是否重复
		$.each(this.jsonData, function(i, v) {
			if (_this.prevData[i] != v) {
				isRepeat = false
				return
			}
		})

		return isRepeat
	}

	// 提交数据
	Plugin.prototype.postJsonData = function() {
		var _this = this,
			btn_smt = $('#' + this.$element.attr('id') + '-submit')

		// 设置提交按钮
		btn_smt.addClass('g-btn-disabled')

		// 如果提交的数据重复，返回
		if (this.options.isAvoidRepeatPost && this.isDataRepeat()) {
			// 重置提交按钮
			btn_smt.removeClass('g-btn-disabled')
				// 显示提示
				!!this.options.isShowSuccessToast && this.showToast(this.prevToast)
				// callback - success
			if (typeof this.options.success == 'function') this.options.success.call(this, this.jsonData, this.prevMsg)

			return
		}

		// ajax post
		$.ajax({
			url: _this.actionUrl,
			data: _this.jsonData,
			type: 'post',
			dataType: 'json',
			cache: false,
			async: _this.options.async,
			success: function(msg) {
				// 重置提交按钮
				btn_smt.removeClass('g-btn-disabled')
				// 显示成功提示
				if (!!_this.options.isShowSuccessToast && msg.error === 0) _this.showToast('提交成功！')
				// 显示错误提示
				if (msg.code !== 0 && msg.message) _this.showToast(msg.message)
				// callback - success
				if (typeof _this.options.success == 'function') _this.options.success.call(_this, _this.jsonData, msg)
				// 重置this.prevData
				_this.prevData = _this.jsonData
				// 重置this.prevToast
				_this.prevToast = _this.appendToast().children().html()
				_this.prevMsg = msg
				// clear msg
				msg = null
			},
			error: function() {
				// 重置提交按钮
				btn_smt.removeClass('g-btn-disabled')
					// 显示提示
				_this.showToast('提交失败，请重试！')
					// callback - error
				if (typeof _this.options.error == 'function') _this.options.error.call(_this)
			}
		})
	}

	return $.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$(this).data('plugin_' + pluginName)) {
				return $(this).data('plugin_' + pluginName, new Plugin(this, options))
			}
		})
	}
}));