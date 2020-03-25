/*
 * 共用-dialog
 * 按钮上的class name：J-g-dialog-open
 * 按钮上的data-*：data-dialog-open、data-dialog-close-on-click-overlay
 * 待打开的目标元素可以绑定3个自定义事件：open, opened, closed
 * 自定义事件open和opened传递了2个参数：元素id和元素data()
 */
import gOverlay from './g-overlay'
var overlayer = gOverlay.appendTo('body')
	, win = $(window)
	, transitionTime = document.all && !window.atob ? 0 : 300	// IE9- 过渡动画时间为0

function init() {
	// 绑定打开事件
	$(document).on('click.g-dialog-open', '.J-g-dialog-open', function (e) {
		var target = $($(this).attr('data-dialog-open')).eq(0)
			, elementId = $(this).attr('id')
			, elementData = $(this).data()
			, hasShowing = !!$('.g-dialog--showing').length

		e.preventDefault()

		if (!target.length) return

		// 如果已有打开的dialog，则需要先关闭
		if (hasShowing) {
			close(1)
			setTimeout(function () {
				open(target, elementId, elementData)
			}, transitionTime)
			return
		}

		// 直接打开
		open(target, elementId, elementData)
	})

	// 绑定关闭事件
	$(document).on('click.g-dialog-close', '.J-g-dialog-close', function (e) {
		e.preventDefault()
		close()
	})
}

// 打开
function open(target, elementId, elementData) {
	// 触发自定义的open事件
	target.triggerHandler('open', [elementId, elementData])

	// 显示overlay
	overlayer.removeClass('g-hidden')
	setTimeout(function () {
		overlayer.addClass('g-overlay--showing')
	}, 20)

	// 打开dialog
	target.removeClass('g-hidden')
	target.css('top', target.height() > win.height() ? 80 : (win.height() - target.height()) * 0.4)
	setTimeout(function () {
		target.addClass('g-dialog--showing')

		// overlay绑定事件
		overlayer.off('click.g-dialog')
		if (elementData.dialogCloseOnClickOverlay !== false) {
			overlayer.one('click.g-dialog', function(e) {
				close()
			})
		}

		// 触发自定义的opened事件
		target.triggerHandler('opened', [elementId, elementData])
	}, 10)
}

// 关闭
function close(isSeries) {
	var target = $('.g-dialog--showing')

	if (!target.length) return

	// 如果紧接着打开下一个dialog，不需要隐藏overlay
	if (!isSeries) {
		overlayer.removeClass('g-overlay--showing')
		setTimeout(function () {
			overlayer.addClass('g-hidden')
		}, transitionTime)
	}

	// overlay解绑事件
	overlayer.off('click.g-dialog')

	// 关闭dialog
	target.removeClass('g-dialog--showing')
	setTimeout(function () {
		target.addClass('g-hidden').css('top', '')

		// 触发自定义的closed事件
		target.triggerHandler('closed')
	}, transitionTime)
}

export default {
	initialize: function () {
		init()
	},
	close: function () {
		close()
	}
}
