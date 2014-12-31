/* http://github.com/Zen33/exchanger */
(function ($) {
    'use strict';
    $.fn.exchanger = function (options) {
        // 双向选择控件
        var $self = this,
            self = this[0],
            defaults = {
                'up': {
                    title: '向上',
                    btn: true // 为false则不可见
                },
                'down': {
                    title: '向下',
                    btn: true
                },
                'remove': {
                    title: '删除',
                    btn: true
                },
                'clear': {
                    title: '清空',
                    btn: true
                },
                'key': 'name',
                'mark': '@',
                'hotKeys': true // 为false则不支持键盘
            },
            contents = {
                struct: '<ul class="leftSection">',
                btns: '',
                origin: ''
            },
            opts = $.extend({}, defaults, (typeof options === 'string' ? {} : options)),
            iterate = function (data, key, mark, callback, prefix) { // 遍历数据
                var prefix = prefix || ''; // 前缀
                if (typeof data === 'object' && data !== null) {
                    $.each(data, function (k, v) {
                        if (k === key && typeof v !== 'object') {
                            callback(k, v, prefix);
                        }
                        iterate(v, key, mark, callback, (prefix === '') ? k : prefix + mark + k); //.
                    });
                }
            },
            exchange = function ($oriItem, $aimItem, data, mark, curData) {
                var $selected = $oriItem.find('li.selected');
                if ($selected.length) {
                    var tmpObj = $.extend({}, data),
                        $tmpEl;
                    curData.length = 0;
                    $selected.removeClass('selected');
                    if ($selected.hasClass('left')) {
                        $selected.removeClass('left').addClass('right');
                        $tmpEl = $aimItem;
                    } else {
                        $selected.removeClass('right').addClass('left');
                        $tmpEl = $oriItem;
                    }
                    $selected.prependTo($aimItem);
                    $tmpEl.find('li').each(function () {
                        var key = this.getAttribute('rel').split(mark).shift(),
                            obj = {};
                        obj[key] = tmpObj[key];
                        curData.push(obj);
                        $self.data('curData', curData);
                    });
                    $aimItem.scrollTop(0);
                }
                return curData;
            },
            curData = [],
            $leftSection,
            $rightSection,
            init = function () {
                $self.data({
                    'curData': curData,
                    'oriData': opts.data
                });
                iterate(opts.data, opts.key, opts.mark, function (key, value, prefix) {
                    contents.origin += '<li class="left" rel="' + prefix + '">' + value + '</li>';
                });
                contents.struct += contents.origin + '</ul><div class="middleSection"><button class="right">&#62;&#62;</button><button class="left">&#60;&#60;</button></div><ul class="rightSection"></ul>';
                for (var key in opts) {
                    if (opts[key].btn) {
                        contents.btns += '<button class="' + key + '">' + opts[key].title + '</button>';
                    }
                }
                if (contents.btns.length) {
                    contents.struct += '<div class="edgeSection">' + contents.btns + '</div>';
                }
                $self.addClass('exchanger').html(contents.struct);
                $leftSection = $self.find('.leftSection');
                $rightSection = $leftSection.next().next();
                if (opts.hotKeys) {
                    var hotKeys = {
                            16: false, //shift
                            37: false, //left
                            38: false, //up
                            39: false, //right
                            40: false //down
                        },
                        $nearbyEl = null;
                    $(document).off('keydown.exchanger keyup.exchanger mousedown.exchanger').on('keydown.exchanger keyup.exchanger mousedown.exchanger', function (e) {
                        if (e.type === 'mousedown') {
                            if (!$(e.target).is($nearbyEl)) {
                                $nearbyEl = null;
                            }
                        } else if (e.type === 'keydown') {
                            if (e.keyCode in hotKeys) {
                                hotKeys[e.keyCode] = true;
                                if (hotKeys[16] && hotKeys[38]) { // ctrl + up
                                    if ($leftSection.find('li:hover').length) {
                                        if ($nearbyEl) {
                                            var $prevItem;
                                            $prevItem = $nearbyEl.prev().is('li') ? $nearbyEl.prev() : $nearbyEl;
                                            $prevItem.addClass('selected');
                                            $nearbyEl = $prevItem;
                                            $leftSection.scrollTop($prevItem[0].offsetTop);
                                        } else {
                                            var $prevItem,
                                                $leftSelectedEl = $leftSection.find('li:hover');
                                            $leftSelectedEl.addClass('selected');
                                            $prevItem = $leftSelectedEl.prev().is('li') ? $leftSelectedEl.prev() : $leftSelectedEl;
                                            $prevItem.addClass('selected');
                                            $nearbyEl = $prevItem;
                                            $leftSection.scrollTop($prevItem[0].offsetTop);
                                        }
                                    } else if ($rightSection.find('li.selected').length) {
                                        if ($nearbyEl) {
                                            var $prevItem;
                                            $prevItem = $nearbyEl.prev().is('li') ? $nearbyEl.prev() : $nearbyEl;
                                            $self.find('button.up').trigger('click');
                                            $nearbyEl = $prevItem;
                                        } else {
                                            var $prevItem,
                                                $rightSelectedEl = $rightSection.find('li.selected');
                                            $prevItem = $rightSelectedEl.prev().is('li') ? $rightSelectedEl.prev() : $rightSelectedEl;
                                            $self.find('button.up').trigger('click');
                                            $nearbyEl = $prevItem;
                                        }
                                    }
                                } else if (hotKeys[16] && hotKeys[40]) { // ctrl + down
                                    if ($leftSection.find('li:hover').length) {
                                        if ($nearbyEl) {
                                            var $nextItem;
                                            $nextItem = $nearbyEl.next().is('li') ? $nearbyEl.next() : $nearbyEl;
                                            $nextItem.addClass('selected');
                                            $nearbyEl = $nextItem;
                                            $leftSection.scrollTop($nextItem[0].offsetTop);
                                        } else {
                                            var $nextItem,
                                                $leftSelectedEl = $leftSection.find('li:hover');
                                            $leftSelectedEl.addClass('selected');
                                            $nextItem = $leftSelectedEl.next().is('li') ? $leftSelectedEl.next() : $leftSelectedEl;
                                            $nextItem.addClass('selected');
                                            $nearbyEl = $nextItem;
                                            $leftSection.scrollTop($nextItem[0].offsetTop);
                                        }
                                    } else if ($rightSection.find('li.selected').length) {
                                        if ($nearbyEl) {
                                            var $nextItem;
                                            $nextItem = $nearbyEl.next().is('li') ? $nearbyEl.next() : $nearbyEl;
                                            $self.find('button.down').trigger('click');
                                            $nearbyEl = $nextItem;
                                        } else {
                                            var $nextItem,
                                                $rightSelectedEl = $rightSection.find('li.selected');
                                            $nextItem = $rightSelectedEl.next().is('li') ? $rightSelectedEl.next() : $rightSelectedEl;
                                            $self.find('button.down').trigger('click');
                                            $nearbyEl = $nextItem;
                                        }
                                    }
                                } else if (hotKeys[37]) { // left
                                    if ($rightSection.find('li.selected').length) {
                                        $self.find('button.left').trigger('click');
                                    } else if ($rightSection.find('li:hover').length) {
                                        $rightSection.find('li:hover').addClass('selected');
                                        $self.find('button.left').trigger('click');
                                    }
                                } else if (hotKeys[39]) { // right
                                    if ($leftSection.find('li.selected').length) {
                                        $self.find('button.right').trigger('click');
                                    } else if ($leftSection.find('li:hover').length) {
                                        $leftSection.find('li:hover').addClass('selected');
                                        $self.find('button.right').trigger('click');
                                    }
                                } else if (hotKeys[38]) { // up
                                    var $prevItem;
                                    if ($rightSection.find('li.selected').length) {
                                        var $rightSelectedEl = $rightSection.find('li.selected');
                                        $prevItem = $rightSelectedEl.prev().is('li') ? $rightSelectedEl.prev() : $rightSelectedEl;
                                        $prevItem.addClass('selected').siblings().removeClass('selected');
                                        $rightSection.scrollTop($prevItem[0].offsetTop);
                                    } else if ($rightSection.find('li:hover').length) {
                                        var $rightSelectedEl = $rightSection.find('li:hover');
                                        $prevItem = $rightSelectedEl.prev().is('li') ? $rightSelectedEl.prev() : $rightSelectedEl;
                                        $prevItem.addClass('selected').siblings().removeClass('selected');
                                        $rightSection.scrollTop($prevItem[0].offsetTop);
                                    }
                                } else if (hotKeys[40]) { // down
                                    var $nextItem;
                                    if ($rightSection.find('li.selected').length) {
                                        var $rightSelectedEl = $rightSection.find('li.selected');
                                        $nextItem = $rightSelectedEl.next().is('li') ? $rightSelectedEl.next() : $rightSelectedEl;
                                        $nextItem.addClass('selected').siblings().removeClass('selected');
                                        $rightSection.scrollTop($nextItem[0].offsetTop);
                                    } else if ($rightSection.find('li:hover').length) {
                                        var $rightSelectedEl = $rightSection.find('li:hover');
                                        $nextItem = $rightSelectedEl.next().is('li') ? $rightSelectedEl.next() : $rightSelectedEl;
                                        $nextItem.addClass('selected').siblings().removeClass('selected');
                                        $rightSection.scrollTop($nextItem[0].offsetTop);
                                    }
                                }
                            }
                        } else {
                            if (e.keyCode in hotKeys) {
                                hotKeys[e.keyCode] = false;
                            }
                        }
                    });
                }
                $self.off('click.exchanger dblclick.exchanger', 'li.left, li.right').on('click.exchanger dblclick.exchanger', 'li.left, li.right', function (e) { // 右侧双击不可全选，左右两侧不可同时selected
                    var itemClass = e.target.className;
                    if (e.type === 'click') {
                        if (itemClass.indexOf('left') !== -1) {
                            $(this).toggleClass('selected');
                            $rightSection.find('li.selected').removeClass('selected');
                        } else {
                            $(this).toggleClass('selected').siblings().removeClass('selected');
                            $leftSection.find('li.selected').removeClass('selected');
                        }
                    } else {
                        if (itemClass.indexOf('left') !== -1) {
                            $(this).siblings().andSelf().toggleClass('selected');
                            $rightSection.find('li.selected').removeClass('selected');
                        }
                    }
                });
                $self.off('click.exchanger', 'button').on('click.exchanger', 'button', function (e) {
                    var btnClass = e.target.className,
                        cases = {
                            'right': function () {
                                exchange($leftSection, $rightSection, opts.data, opts.mark, curData);
                            },
                            'left': function () {
                                exchange($rightSection, $leftSection, opts.data, opts.mark, curData);
                            },
                            'up': function () {
                                if ($rightSection.find('li.selected').length === 1) {
                                    var $curItem = $rightSection.find('li.selected'),
                                        index = $curItem.prevAll('li').length;
                                    if (index >= 0) {
                                        var $clone = $curItem.clone(),
                                            tmpData = curData[index];
                                        $curItem.prev().before($clone).end().remove();
                                        $rightSection.scrollTop($rightSection.find('li.selected')[0].offsetTop);
                                        curData.splice(index, 1);
                                        curData.splice(((index - 1) < 0 ? 0 : index - 1), 0, tmpData);
                                    }
                                }
                            },
                            'down': function () {
                                if ($rightSection.find('li.selected').length === 1) {
                                    var $curItem = $rightSection.find('li.selected'),
                                        index = $curItem.prevAll('li').length;
                                    if (index >= 0) {
                                        var $clone = $curItem.clone(),
                                            tmpData = curData[index];
                                        $curItem.next().after($clone).end().remove();
                                        $rightSection.scrollTop($rightSection.find('li.selected')[0].offsetTop);
                                        curData.splice(index, 1);
                                        curData.splice(index + 1, 0, tmpData);
                                    }
                                }
                            },
                            'remove': function () {
                                this['left']();
                            },
                            'clear': function () {
                                if ($rightSection.find('li').length) {
                                    $rightSection.children().remove();
                                    $leftSection.html(contents.origin);
                                    curData = [];
                                }
                            }
                        };
                    if (cases[btnClass]) {
                        cases[btnClass]();
                        $self.data('curData', curData);
                    }
                });
            };
        if ($self.find('.left').length) {
            if (['getData', 'get', 'data'].indexOf(options) !== -1) {
                return $self.data('curData');
            } else if (['reset', 'redo'].indexOf(options) !== -1) {
                $self.find('li.selected').removeClass('selected');
                $self.children().remove();
                opts.data = $self.data('oriData');
                init();
            }
        } else {
            if ($self.length) {
                init();
            }
        }
    };
}(window.jQuery));