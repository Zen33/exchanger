/* http://github.com/Zen33/dropDownList */
(function ($) {
    $.dropDownList = function (el, options) {
        var that = this,
            mark,
            seed;
        that.$el = $(el);
        that.el = el;
        if (that.$el.is('[multiple]')) return false;
        if (typeof that.$el.attr('id') !== 'undefined' && that.$el.attr('id') !== false) {
            mark = that.el.getAttribute('id');
        } else {
            seed = new Date();
            mark = 'select_' + seed.valueOf();
            that.$el.attr('id', mark);
        }
        //that.$el.data('dropDownList', that);
        if (that.options && that.options.icon === false && that.$el.data('existedIcon')) that.$el.removeData('existedIcon');
        that.rebuild = function () { // 重置select
            if (that.$el.next().is('.dropDownListInput')) {
                that.$el.next().remove();
                $('.dropDownListWrapper[rel="' + mark + '"]').remove();
            }
            //that.$el.prop('selectedIndex', 0);
        };
        that.assign = function (text, val) { // 更新select value
            if (that.$el.find('option:selected').text() !== text) {
                $('option', that.el).filter(function () {
                    return $(this).text() == text;
                }).prop('selected', true).trigger('change').trigger('blur'); // .change()
                if (that.options.func && typeof that.options.func === 'function') that.options.func(that.el, text, val);
            }
        };
        that.init = function () { // 初始化配置项
            var dropDownListContent,
                dropDownListWrapper,
                dropDownListInput,
                dropDownListBorder,
                dropDownListItem;

            that.options = $.extend({}, $.dropDownList.defaultOptions, options);
            //that.el.style.display = 'none';
            that.$el.data('dropDownList', that.$el.data);
            that.$el.css({
                'position': 'absolute',
                'height': '1px',
                'visibility': 'hidden',
                'opacity': 0
            });
            //that.el.style.visibility = 'hidden';
            if (that.options.update) {
                that.$el.empty();
                that.rebuild();
                $.each(that.options.update, function (i) { // 重构当前select元素
                    that.$el.append('<option value="' + i + '">' + that.options.update[i] + '</option>');
                });
            }
            if (that.options.reset || that.$el.next().is('.dropDownListInput')) that.rebuild();
            dropDownListContent = '<div class="dropDownListWrapper" rel="' + mark + '" style="position:absolute;"><ul class="dropDownList">';
            if (that.options.icon || that.$el.data('existedIcon')) {
                that.$el.find('option').each(function () {
                    dropDownListContent += '<li rel="' + this.value + '"><i class="' + this.value + '"></i><a href="javascript:;">' + this.innerHTML + '</a></li>';
                });
                that.$el.data('existedIcon', true);
            } else {
                that.$el.find('option').each(function () {
                    dropDownListContent += '<li rel="' + this.value + '"><a href="javascript:;">' + this.innerHTML + '</a></li>';
                });
            }
            dropDownListContent += '</ul></div>';
            that.$el.after('<input class="dropDownListInput ' + mark + '_dropDownList" type="text" name="' + mark + '_dropDownList" style="width:' + that.$el.width() + 'px;" />');
            $('body').append(dropDownListContent);
            dropDownListWrapper = $('.dropDownListWrapper[rel="' + mark + '"]');
            dropDownListWrapper.width(that.$el.width());
            dropDownListInput = that.$el.next();
            if (!that.options.editable) dropDownListInput.prop('readOnly', true).css({
                'cursor': 'pointer',
                'opacity': '0.99'
            });
            dropDownListInput.val(that.$el.find('option:selected').text());
            dropDownListBorder = dropDownListWrapper.find('.dropDownList');
            dropDownListItem = dropDownListBorder.find('li');
            dropDownListInput.on('click keyup', function (e) {
                if (e.type === 'click') {
                    e.stopPropagation();
                    dropDownListWrapper.css({
                        'top': (dropDownListInput.offset().top + dropDownListInput.outerHeight(true)) + 'px',
                        'width': dropDownListInput.width() + 'px',
                        'left': dropDownListInput.offset().left + 'px',
                        'zIndex': 9999
                    });
                    $('.dropDownList').not(dropDownListBorder).hide();
                    setTimeout(function () {
                        dropDownListBorder.toggle();
                    }, 100);
                } else if (e.type === 'keyup') {
                    var key = this.value.toLowerCase();

                    if ($.trim(key) === '') {
                        dropDownListItem.show();
                    } else if (!this.readOnly) { //!that.options.editable
                        dropDownListItem.hide();
                        dropDownListItem.each(function () {
                            if (this.innerHTML.toLowerCase().indexOf(key) > -1) {
                                $(this).show();
                            }
                        });
                    }
                }
            });
            dropDownListItem.click(function () {
                dropDownListInput.val($('a', this).text());
                dropDownListBorder.hide();
                that.assign(dropDownListInput.val(), this.getAttribute('rel'));
            });
            that.$el.change(function () {
                dropDownListInput.val(that.$el.find('option:selected').text());
            });
        };
        if (options && typeof options.destroy != 'undefined') {
            that.rebuild();
            that.$el.removeAttr('style');
        } else {
            that.init();
        }
    };
    $.dropDownList.defaultOptions = {
        icon: null, // 显示图标：true；默认不显示：null
        update: null, // 更新select中的option元素 {'key1': 'value1', 'key2': 'value2'...}
        reset: false, // 重新渲染当前select标签
        editable: false, //开启编辑/查找模式：true；默认不支持：false
        func: false, // 选中子项执行函数：true；默认不支持：false
        destroy: false // 取消当前渲染，默认不支持：false
    };
    $.fn.dropDownList = function (options) {
        var inParent = !!(parent.location == window.location);
        $(document).click(function () { // 点击非Drop down list区域隐藏
            if ($('.dropDownList').length) $('.dropDownList').hide();
        });

        if (this.closest('.accordion-group').length && !inParent) {
            $(parent.document).off('scroll.ddl mousewheel.ddl DOMMouseScroll.ddl').on('scroll.ddl mousewheel.ddl DOMMouseScroll.ddl', function () {
                $('.dropDownList').hide();
            });
        }
        return this.each(function () {
            (new $.dropDownList(this, options));
        });
    };
}(window.jQuery));
