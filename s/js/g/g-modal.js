/*
 * 共用-modal
 */
define(['jquery', 'g/g-overlay'], function($, gOverlay) {
	var overlayer = gOverlay.appendTo('body');

	function modal(type, text, title, callbackOk, callbackCancel) {
		var _title, _callbackOk, _callbackCancel, el;


		// 判断第二个参数
		if (typeof arguments[2] == 'function' || !arguments[2]) {
			_title = '提示';
			_callbackOk = arguments[2];
			_callbackCancel = arguments[3];
		} else {
			_title = title;
			_callbackOk = callbackOk;
			_callbackCancel = callbackCancel;
		}

		if (type == 'alert') {
			el = $('<div class="g-modal g-hidden">' +
				'<div class="title"><h6>' + _title + '</h6><a class="close J-g-modal-close" href="javascript:;" title="关闭">&times;</a></div>' +
				'<div class="text">' + text + '</div>' +
				'<div class="action"><button type="button" class="ok">确定</button></div>' +
				'</div>');
		} else {
			el = $('<div class="g-modal g-hidden">' +
				'<div class="title"><h6>' + _title + '</h6><a class="close J-g-modal-close" href="javascript:;" title="关闭">&times;</a></div>' +
				'<div class="text">' + text + '</div>' +
				'<div class="action"><button type="button" class="cancel">取消</button><button type="button" class="ok">确定</button></div>' +
				'</div>');
		}

		// append to body
		$('body').append(el);

		// 显示
		overlayer.removeClass('g-hidden');
		el.removeClass('g-hidden');
		setTimeout(function() {
			overlayer.addClass('g-overlay--showing');
			el.addClass('g-modal-showing');
		}, 20);

		// 绑定确定按钮的事件
		el.find('.action .ok').on('click', function() {
			// 隐藏
			overlayer.removeClass('g-overlay--showing');
			el.removeClass('g-modal-showing');
			setTimeout(function() {
				overlayer.addClass('g-hidden');
				el.remove();
			}, 400);

			// 确定按钮 callback
			if (typeof _callbackOk == 'function') {
				_callbackOk();
			}
		});

		//绑定取消按钮事件
		el.find('.action .cancel').on('click', function() {
			overlayer.removeClass('g-overlay--showing');
			el.removeClass('g-modal-showing');
			setTimeout(function() {
				overlayer.addClass('g-hidden');
				el.remove();
			}, 400);

			//取消按钮callback
			if (typeof _callbackCancel == 'function') {
				_callbackCancel();
			}
		});
	}


	// init
	function init() {
		$(document).on('click', '.J-g-modal-close', function(e) {
			var el = $(this).parents('.g-modal').eq(0);
			e.preventDefault();

			if (!el.length) return;

			// 隐藏
			overlayer.addClass('g-hidden');
			el.removeClass('g-modal-showing');
			setTimeout(function() {
				el.remove();
			}, 400);
		});
	}

	return {
		alert: function(text, title, callbackOk) {
			modal('alert', text, title, callbackOk);
		},
		confirm: function(text, title, callbackOk, callbackCancel) {
			modal('confirm', text, title, callbackOk, callbackCancel);
		},
		initialize: function() {
			init();
		}
	};
});