// import autocomplete from '../plugin/autocomplete.js'

let mod = $('#J-g-header')
let select = mod.find('#J-g-header-select')
let opt = select.find('option')
let input = mod.find('#J-g-header-input')
let btn = mod.find('#J-g-header-search-btn')
let slctVal = select.val()
// let url = ''
let target = ''

// 根据select获取url, target
function getTargetUrl () {
  slctVal = select.val()
  let arr = Array.prototype.slice.call(opt)
  for (let i in arr) {
    if ($(arr[i]).attr('value') === slctVal) {
      // url = $(arr[i]).attr('data-autocomplete-url')
      target = $(arr[i]).attr('data-target-href')
    }
  }
}

getTargetUrl()

// 模糊搜索
// input.autocomplete({
//   source: url
// })

// select change
// select.on('change', function () {
//   getTargetUrl()
//   // 模糊搜索
//   input.autocomplete({
//     source: url
//   })
// })

// 搜索
btn.on('click', function () {
  getTargetUrl()
  location.href = target + input.val()
})