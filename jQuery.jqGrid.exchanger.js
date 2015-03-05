/* http://github.com/Zen33
 *  jqGridExchanger  By T.Z 150304
 *  使用说明
 *  参数：
 *  默认参数为空则渲染标签；
 *  getLeftData：获取左侧jqgrid table的当前数据；
 *  getRightData：获取右侧jqgrid table的当前数据；
 *  getData：获取两侧当前数据属性left/right；
 *  delLeftData：删除左侧全部数据；
 *  delRightData：删除右侧全部数据；
 *  delLeftSelectedData：删除左侧选中数据；
 *  delRightSelectedData：删除右侧选中数据；
 *  addLeftData：追加右侧选中数据；
 *  addRightData：追加右侧选中数据；
 *  debugger：debug模式。
 */
(function($) {
    // 'use strict';
    $.fn.jqGridExchanger = function(options) {
        var $this = this,
            $left = $this.find('.ui-jqgrid:eq(0) .ui-jqgrid-bdiv table'),
            $right = $this.find('.ui-jqgrid:eq(1) .ui-jqgrid-bdiv table'),
            _exchange = function($origin, $aim) {
                if ($origin.find('.exchanger-sel :checked').length) {
                    $origin.find('.exchanger-sel :checked').each(function() {
                        var ids = $aim.getDataIDs(),
                            records = ids.length ? parseInt($aim.getDataIDs().pop()) + 1 : 1,
                            id = $(this).closest('tr').attr('id');
                        $aim.addRowData(records, $origin.getRowData(id));
                        $origin.delRowData(id);
                    });
                    _check($aim);
                }
            },
            _add = function($section, data) {
                if (!$.isEmptyObject(data)) {
                    var ids = $section.getDataIDs(),
                        records = ids.length ? parseInt($section.getDataIDs().pop()) + 1 : 1;
                    $section.addRowData(records, data);
                }
                _check($section);
            },
            _del = function($section, mark) {
                var mark = ' ' + mark || '';
                if ($section.find('.exchanger-sel' + mark).length) {
                    $section.find('.exchanger-sel' + mark).each(function() {
                        var id = $(this).closest('tr').attr('id');
                        $section.delRowData(id);
                    });
                }
                _check($section);
            },
            _check = function($section) {
                var $chkAll = $section.closest('.ui-jqgrid').find('.exchanger-all');
                if ($section.find('.exchanger-sel :checked').length === $section.find('.exchanger-sel').length) {
                    $chkAll.prop('checked', true);
                } else {
                    $chkAll.prop('checked', false);
                }
            };
        if ($this.find('.ui-jqgrid').length === 2) {
            if ($this.hasClass('ui-exchanger')) {
                var cases = {
                    'getLeftData': function() {
                        return $left.getRowData();
                    },
                    'getRightData': function() {
                        return $right.getRowData();
                    },
                    'getData': function() {
                        return {
                            'left': this.getLeftData(),
                            'right': this.getRightData()
                        };
                    },
                    'addLeftData': function(data) {
                        _add($left, data);
                    },
                    'addRightData': function(data) {
                        _add($right, data);
                    },
                    'delLeftSelectedData': function() {
                        _del($left, ':checked');
                    },
                    'delRightSelectedData': function() {
                        _del($right, ':checked');
                    },
                    'delLeftData': function() {
                        _del($left);
                    },
                    'delRightData': function() {
                        _del($right);
                    }
                };
                if (cases[arguments[0]]) return cases[arguments[0]](arguments[1]);
            } else {
                if (typeof $left.addColumn !== 'function') {
                    if (options.indexOf('debugger') > -1) {
                        $this.prepend('<h3>Please include jQuery.jqGrid.addColumn.js file.</h3>');
                    }
                    return false;
                }
                var $jqGridTables = [];
                if (typeof exchangerCHK !== 'function') window.exchangerCHK = new Function('e', 'var e=e||event;e.stopPropagation?e.stopPropagation():e.cancelBubble=true;$(e.target).parent().removeClass("ui-jqgrid-sortable");$(e.target).closest(".ui-jqgrid-view").find(".ui-jqgrid-bdiv td.exchanger-sel :checkbox").prop("checked",e.target.checked?true:false);');
                $this.find('.ui-jqgrid').each(function() {
                    var $that = $('.ui-jqgrid-bdiv table', this);
                    if (typeof $that.getDataIDs === 'function') {
                        var col = {},
                            // ids = $that.jqGrid('getDataIDs');
                            ids = $that.getDataIDs();
                        if (ids.length) {
                            $.each(ids, function() {
                                col[this] = false;
                            });
                        }
                        $that.jqGrid('addColumn', {
                            cm: {
                                name: 'chk',
                                label: '<input type="checkbox" class="exchanger-all" onclick="exchangerCHK(event)" />',
                                width: 30,
                                formatter: 'checkbox',
                                formatoptions: {
                                    disabled: false
                                },
                                align: 'center',
                                cellattr: function(rowId, tv, rawObject, cm, rdata) {
                                    return 'class="exchanger-sel"';
                                    // return 'title=""';
                                }
                            },
                            insertWithColumnIndex: 0,
                            data: col
                        });
                        $jqGridTables.push($that);
                    }
                });
                $this.find('.ui-jqgrid:eq(0)').after('<div class="exchanger-action"><button class="exchanger-right">&#62;&#62;</button><button class="exchanger-left">&#60;&#60;</button></div>');
                $this.on('click.exchanger', '.exchanger-action button, .exchanger-sel', function(e) {
                    if (e.target.className.indexOf('left') > -1) {
                        _exchange($jqGridTables[1], $jqGridTables[0]);
                    } else if (e.target.className.indexOf('right') > -1) {
                        _exchange($jqGridTables[0], $jqGridTables[1]);
                    } else {
                        _check($(this).closest('table'));
                    }
                });
                $this.on('click.exchanger', '')
                $this.addClass('ui-exchanger');
            }
        }
    };
}(window.jQuery));