// 对表单类处理的封装
import toast from '../g/g-toast.js'
import validator from '../plugin/validator.js'

var digitonly = function (el) {
  el.on('keyup', function () {
    $(this).val(function (i, val) {
      return val.replace(/\D+/g, '')
    })
  }).on('blur', function () {
    $(this).val(function (i, val) {
      return val.replace(/\D+/g, '')
    })
  })
}

function formPost(id) {
  var form = $(id),
      input_mobile = form.find(id + '-tel')
  // 表单验证
  form.validator({
    isShowSuccessToast: false,
    success: function(param, msg) {
      if (msg.error === 0) {
        toast.show('提交成功，我们的老师将尽快与您联系')
      } else {
        toast.show('提交失败，请重新提交')
      }
    }
  })
  // 获取归属地
  $(input_mobile).bind('input propertychange', function () {
    var tel = input_mobile.val(),
      prev

    if(tel.length == 11 && tel != prev) {
      $.ajax({
        url: "https://tcc.taobao.com/cc/json/mobile_tel_segment.htm",
        type: "get",
        dataType: "jsonp",
        data: {
          'tel': tel,
        },
        success: function (data) {
          $('input[name="province"]').val(data.province)
        }
      })
    }

    prev = tel
  })
  // 限数字字符
  digitonly(input_mobile)
}

export default formPost
