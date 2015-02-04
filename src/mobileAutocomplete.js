/**
 * Mobile Autocomplete
 * 轻量级（压缩后1.71KB）、适配移动设备的autocomplete插件
 * @version 0.0.1
 */
define("page/raider/strategy/mobileAutocomplete", function(require, exports, module){

	/**
	 * autocomplete中的input、ul对象
	 */
	var $el = null, $ul = null;

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

	/**
	 * 初始化入口函数
	 */
	function init(el, options) {
		$.extend(defaults, options);
		$el = $(el);
		$ul = $(defaults.ulTemplate);
		setupSettings();
        setupEvents();
	}

	/**
     * Micro-templating utility
     * @param  {string} template Template string with mustache-style curly braces
     * @param  {object} vars     Contains values to interpolate with
     * @return {string}          Interpolated string
     */
    function template(template, vars) {
        return template.replace(/{{\s*[\w]+\s*}}/g, function(v) {
            return vars[v.substr(2, v.length - 4)];
        });
    }

    /**
     * Debounce function from http://davidwalsh.name/javascript-debounce-function
     * @param  {function} func       function to execute
     * @param  {number}   wait       delay in milliseconds
     * @param  {boolean}  immediate  whether to fire on trailing or leading
     * @return {function}            debounced function
     */
    function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this,
				args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);	
				}
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(context, args);
			}
		};
    }

    /**
     * 初始化配置
     */
    function setupSettings() {
        if (defaults.keyboardDelay) {
            request = debounce(request, defaults.keyboardDelay);
        }
        if (this.settings.scrollOnFocus) {
            $el.on('focus', function() {
                var h = $(this).offset().top;
                setTimeout(function() {
                    window.scrollTo(0, h);
                }, 0);
            });
        }
    }

    /**
     * 初始化事件
     */
    function setupEvents() {
    	//监控input输入行为
    	$el.on('input', onInput);
    	//监控选中选项行为
    	$(defaults.parent).on('click', $(defaults.itemTemplate).get(0).tagName, onClickItem);
    }

    /**
     * 发送服务端请求
     */
    function request(val) {
    	defaults.source({term: val}, response);
    }

	/**
     * 接受服务端请求
     */
    function response(content) {
    	//生成下拉列表
    	renderItemsFlat(content);
    	//点击空白地方关闭整个ul下拉列表
    	$('html').one('click', closeList);
    }

	/**
     * 生成下拉列表
     */
    function renderItemsFlat(content) {
        $ul.remove();
        $ul = $(defaults.ulTemplate);
        var v = $el.val();
        for (var i = 0; i < content.length && i < defaults.maxItems; i++) {
            $ul.append(template(defaults.itemTemplate, content[i]));
        }
        $(defaults.parent).append($ul);
    }

    /**
     * input的值修改时触发
     */
    function onInput() {
    	if ($el.val().length >= defaults.minChars) {
            request($el.val());
        }
        if ($el.val() == '') {
            closeList();
        }
    }

    /**
     * 移除下拉列表ul
     */
    function closeList() {
        $('html').off('click');
        $ul.remove();
    }

    /**
     * 监控选项被点击
     */
    function onClickItem(e) {
        defaults.onSelect($(e.currentTarget));
        if (defaults.closeOnSelect) {
            closeList();
        }
    }

    module.exports = {
    	init: init
    }

});