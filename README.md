# mobileAutocomplete

传统autocomplete插件多数基于PC端，依赖jquery，体积庞大；本插件基于移动设备特性制作，跟DOM元素基本解耦（DOM及样式可完全自定义），拓展性强，压缩后体积只有2KB，非常适合移动应用使用（依赖zeptojs，当然jquery也是可以的）。

用户在输入框中输入内容的过程中，调用服务端接口，实时将匹配的内容返回并显示出下拉列表，提供给用户选择，提高用户的输入效率，在移动端打字不方便的背景下，该功能的需求非常庞大。


----------


###展示效果

![展示效果][1]


----------

###DEMO
手机扫二维码：

![二维码][2]

或手机访问：

http://ivinjs.com/demo/mobileAutocomplete/


###如何使用
HTML代码：
```html
<input id="city" />
```
Javascript代码：
```javascript
$('#city').mAutocomplete({
	source: function(request, response) {
		$.ajax({
			url: 'http://gd.geobytes.com/AutoCompleteCity',
			data: {
				q: request.term
			},
			type: 'get',
			dataType: 'jsonp',
			success: function(data) {
				//由于接口返回的是数组[aa,bb,cc]，因此对其进行对象组装
				var array = [];
				for(var i = 0; i < data.length; i ++) {
					array.push({
						value: data[i],
						title: data[i]
					})
				}
				//将处理好的数组用response进行回调，此时数组格式为[{value:1,title:aa},{...}]
				response(array);
			}
		})
	},
	onSelect: function(el) {
		alert(el.text());
	}
})
```
###可配置项：
```javascript
/**
 * 默认配置
 */
var defaults = {
	//当输入字符达minChars时，开始触发autocomplete
	minChars: 2,
	//请求配置函数
	source: null,
	//选择选项后触发事件
	onSelect: null,
	//当input聚焦时，是否自动将input滚动到页面顶部（防止移动设备弹出键盘挡住）
	scrollOnFocus: true,
	//最多显示maxItems条匹配记录
	maxItems: 10,
	//input改变后keyboardDelay毫秒后触发服务器请求，防止过于频繁的请求
	keyboardDelay: 300,
	//选择选项后，列表是否自动消失
	closeOnSelect: true,
	//ul的模板
	ulTemplate: '<ul class="autocomplete-list"></ul>',
	//单独一个选项的模板
	itemTemplate: '<li class="autocomplete-item">{{title}}</li>',
	//整个ul将插入到parent这个DOM中
	parent: 'body'
}
```

####关于配置项parent的说明
parent默认值是body，即默认生成的下拉列表是会append到页面的body下的，如有其他特殊需求，如DOM结构是这样的
```html
<div id="autocompleteUl">
	<ul class="search-list">
		<li class="keyword">XXXX</li>
		<li class="keyword">XXXX</li>
		...
	</ul>
</div>
```
则可以在初始化的时候设定parent的值为 “#autocompleteUl”

####关于配置项ulTemplate和itemTemplate的说明
ulTemplate的默认值是`<ul class="autocomplete-list"></ul>`，itemTemplate的默认值是`<li class="autocomplete-item">{{title}}</li>`，如有其他需求，如需上面举例的DOM结构，则可在初始化时候设定
```javascript
{
    ulTemplate: '<ul class="search-list"></ul>',
    itemTemplate: '<li class="keyword">{{title}}</li>'
}
```
####关于配置项onSelect的说明
该配置项为函数，指定了用户点击了某个下拉列表后会触发的事件，其中带有一个参数el为用户点击项的DOM对象，可通过往列表DOM中的属性种入各种自定义值，并在onSelect触发时从DOM属性中取出使用。如
```javascript
onSelect: function(el) {
	//打印被选中的选项的value属性
	console.log(el.attr('value'))
}
```
####关于配置项source的说明
该配置项为函数，确定了与服务器之前的接口。该配置参照了JqueryUI中的Autocomplete，有两个参数`request`和`response`，其中`request.term`中装载着当前input的值，而返回的结果需要用`response`进行回调。
```javascript
    source: function(request, response) {
        $.ajax({
            url: 'http://gd.geobytes.com/AutoCompleteCity',
            data: {
                q: request.term
            },
            type: 'get',
            dataType: 'jsonp',
            success: function(data) {
                //由于接口返回的是数组[aa,bb,cc]，因此对其进行对象组装
                var array = [];
                for(var i = 0; i < data.length; i ++) {
                    array.push({
                        value: data[i],
                        title: data[i]
                    })
                }
                //将处理好的数组用response进行回调，此时数组格式为[{value:aa,title:aa},{...}]
                response(array);
            }
        })
    }
```
###Q&A
#### 1. 服务端返回的数据结构跟插件要求的不匹配怎么办？ ####
答：在source配置项中，接受到服务端返回的数据后，可自行对其进行重新组装，在组装好后再将其作为参数调用response即可。注意response的参数必须是数组，且数组的每一项皆为对象，如：`[{value:1,title:aa},{...}]`，此时，在配置项`itemTemplate`中就可以很方便地用`{{value}}`或`{{title}}`进行值的调用从而生成列表。

#### 2. 我的数据不需要服务器返回，是静态的存于本地的，怎么使用这个插件？ ####
答：为了保持代码的简洁性，本版本暂不支持该功能哈，考虑后续增加。


  [1]: http://ivinjs.com/demo/mobileAutocomplete/demo.png
  [2]: http://ivinjs.com/demo/mobileAutocomplete/code.png
