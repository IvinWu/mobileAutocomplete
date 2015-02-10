/**
 * Mobile Autocomplete
 * 轻量级、适配移动设备的autocomplete插件
 * https://github.com/IvinWu/mobileAutocomplete
 * @version 0.0.1
 */
(function(window, $) {

	function MobileAutocomplete(el, options) {
		/**
		 * autocomplete中的input、ul对象
		 */
		this.$el = $(el);
		this.$ul = null;
		this.options = options;
	}
	
	MobileAutocomplete.prototype = {
		/**
		 * 默认配置
		 */
		config: {
			//当输入字符达minChars时，开始触发autocomplete
			minChars: 2,
	        //数据源配置
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
		},
		/**
		 * 初始化入口函数
		 */
		init: function() {
			this.config = $.extend(this.config, this.options);
			this.$ul = $(this.config.ulTemplate);
			this.setupSettings();
	        this.setupEvents();
	        return this;
		},
		/**
	     * 初始化配置
	     */
    	setupSettings: function() {
    		//如果配置source为数组，则request定义为对本地数组的筛选器
    		if ($.isArray(this.config.source)) {
    			this.request = function(val) {
    				this.response(this.filter(this.config.source, val));
    			}
    		//如果source为远程请求且配置keyboardDelay不为0，则添加延迟触发请求
    		} else if (this.config.keyboardDelay) {
	            this.request = this.debounce(this.request, this.config.keyboardDelay);
	        }
	        //如果配置scrollOnFocus为true，则当输入框focus时，自动将输入框滚动到页面顶部（防止键盘阻挡）
	        if (this.config.scrollOnFocus) {
	        	var that = this;
	            this.$el.on('focus', function() {
	                var h = that.$el.offset().top;
	                setTimeout(function() {
	                    window.scrollTo(0, h);
	                }, 0);
	            });
	        }
	    },
		/**
	     * 初始化事件
	     */
	    setupEvents: function() {
	    	//监控input输入行为
	    	this.$el.on('input', $.proxy(this.onInput, this));
	    	//监控选中选项行为
	    	$(this.config.parent).on('click', $(this.config.itemTemplate).get(0).tagName, $.proxy(this.onClickItem, this));
	    },
	    /**
	     * 发送服务端请求
	     */
	    request: function(val) {
	    	this.config.source({term: val}, $.proxy(this.response, this));
	    },
	    /**
	     * 接受服务端请求
	     */
	    response: function(content) {
	    	//生成下拉列表
	    	this.renderItemsFlat(content);
	    	//点击空白地方关闭整个ul下拉列表
	    	$('html').one('click', $.proxy(this.closeList, this));
	    },
	    /**
	     * 生成下拉列表
	     */
	    renderItemsFlat: function(content) {
	        this.$ul.remove();
	        this.$ul = $(this.config.ulTemplate);
	        var v = this.$el.val();
	        for (var i = 0; i < content.length && i < this.config.maxItems; i++) {
	            this.$ul.append(this.template(this.config.itemTemplate, content[i]));
	        }
	        $(this.config.parent).append(this.$ul);
	    },
	    /**
	     * input的值修改时触发
	     */
	    onInput: function() {
	    	if (this.$el.val().length >= this.config.minChars) {
	            this.request(this.$el.val());
	        }
	        if (this.$el.val() == '') {
	            this.closeList();
	        }
	    },
	    /**
	     * 移除下拉列表ul
	     */
	    closeList: function() {
	        $('html').off('click');
	        this.$ul.remove();
	    },
	    /**
	     * 监控选项被点击
	     */
	    onClickItem: function(e) {
	        this.config.onSelect($(e.currentTarget));
	        if (this.config.closeOnSelect) {
	            this.closeList();
	        }
	    },
	    /**
	     * 借用$.ui.autocomplete的方法，用于匹配数据源为数组的情况
	     */
	    escapeRegex: function( value ) {
			return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
		},
	    filter: function(array, term) {
			var matcher = new RegExp( this.escapeRegex( term ), "i" );
			return $.grep( array, function( value ) {
				return matcher.test( value );
			});
		},
	    /**
	     * Micro-templating utility
	     * @param  {string} template Template string with mustache-style curly braces
	     * @param  {object} vars     Contains values to interpolate with
	     * @return {string}          Interpolated string
	     */
	    template: function(template, vars) {
	        return template.replace(/{{\s*[\w]+\s*}}/g, function(v) {
	            return vars[v.substr(2, v.length - 4)] || vars;
	        });
	    },
	    /**
	     * Debounce function from http://davidwalsh.name/javascript-debounce-function
	     * @param  {function} func       function to execute
	     * @param  {number}   wait       delay in milliseconds
	     * @param  {boolean}  immediate  whether to fire on trailing or leading
	     * @return {function}            debounced function
	     */
	    debounce: function(func, wait, immediate) {
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
	}

    $.fn.mAutocomplete = function(options) {
    	return this.each(function(){
    		if(this.mAutocomplete) {
    			$.extend(this.mAutocomplete.config, options);
                return this;
    		}
    		var d = new MobileAutocomplete(this, options).init();
    		this.mAutocomplete = {
    			config: d.config
    		}
    	});
    };

})(window, $);