/*! domx-repeat - v0.3.1 - 2015-03-17
* http://esha.github.io/domx-repeat/
* Copyright (c) 2015 ESHA Research; Licensed MIT, GPL */

(function(D) {
    "use strict";

    // shortcuts
    var X = D.x,
        _ = X._;

var R = _.repeat = {
    id: 'x-repeat-id',
    each: 'x-repeat-each',
    context: 'html,[x-repeat-init]',
    count: 0,
    initAll: function() {
        D.queryAll(R.context).each(function(context) {
            var init = context.getAttribute('x-repeat-init') || 'DOMContentLoaded',
                listener = function() {
                    D.removeEventListener(init, listener);
                    context.queryAll('[x-repeat]')
                           .not('['+R.id+']')
                           .each(R.init);
                };
            if (init !== 'true') {
                context.setAttribute('x-repeat-init', 'true');
                D.addEventListener(init, listener);
            }
        });
    },
    init: function(el, keep) {
        var selector = el.getAttribute('x-repeat'),
            id = R.count++,
            content = selector && D.query(selector).cloneNode(true) || el,
            anchor = D.createElement('x-repeat');
        content.setAttribute(R.id, id);
        anchor.setAttribute(R.id, id);
        for (var i=0,m=el.attributes.length; i<m; i++) {
            var attr = el.attributes[i];
            if (attr.name === 'x-repeat-none') {
                anchor.value = attr.value || el.innerHTML;
            }
            anchor.setAttribute(attr.name, attr.value);
        }
        R.parent(el).insertBefore(anchor, el.nextSibling);
        _.defprop(anchor, 'content', R[id] = content);
        if (keep !== true) {
            el.remove();
        }
        return id;
    },
    parent: function(el) {
        if (!el.parentNode) {
            D.createDocumentFragment().appendChild(el);
        }
        return el.parentNode;
    },
    repeat: function(parent, anchor, content, val) {
        var repeat = content.cloneNode(true);
        if (val !== undefined && val !== null) {
            repeat.xValue = val;
        }
        parent.insertBefore(repeat, anchor);
        if (repeat.hasAttribute(R.each)) {
            repeat.getAttribute(R.each)
                .split(',')
                .forEach(function(call) {
                    _.resolve(call, window, [repeat, val]);
                });
        }
        return repeat;
    },
    style: D.head.append('style')
};

X.add('repeat', function repeat(val) {
    var parent = R.parent(this),
        id = this.getAttribute(R.id) || R.init(this, true),
        selector = '['+R.id+'="'+id+'"]',
        selectAll = selector+':not(x-repeat)';
    if (val === false) {
        return parent.queryAll(selectAll).remove();
    }
    var anchor = parent.query('x-repeat'+selector),
        content = anchor.content || R[id];
    if (anchor.hasAttribute('x-repeat-first')) {
        anchor = parent.query(selector+'[x-index]') || anchor;
    }
    var ret = Array.isArray(val) ?
        val.map(function(v){ return R.repeat(parent, anchor, content, v); }) :
        R.repeat(parent, anchor, content, val);
    parent.queryAll(selectAll).each('setAttribute', 'x-index', '${i}');
    return ret;
}, [Element]);

R.style.textContent = '[x-repeat] { display: none }';
R.initAll();//early availability
D.addEventListener('DOMContentLoaded', function() {
    R.initAll();//eventual consistency
    R.style.textContent = "\nx-repeat { display: none }"+
                          "\nx-repeat[x-repeat-none] { display: inline-block; }"+
                          "\n["+R.id+"] + x-repeat[x-repeat-none] { display: none; }";
});


})(document);
