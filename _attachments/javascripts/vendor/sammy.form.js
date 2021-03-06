(function($) {
  
  Sammy = Sammy || {};
  
  function getStringContent(object, content) {
    if (typeof content === 'undefined') {
      return '';
    } else if ($.isFunction(content)) {
      content = content.apply(object);
    } 
    return content.toString();
  };
  
  function simple_element(tag, attributes, content) {
    var html = "<";
    html += tag;
    if (typeof attributes != 'undefined') {
      $.each(attributes, function(key, value) {
        if (value != null) {
          html += " " + key + "='";
          html += getStringContent(attributes, value);
          html += "'";
        }
      });
    }
    if (content === false) {
      html += ">";
    } else if (typeof content != 'undefined') {
      html += ">";
      html += getStringContent(this, content);
      html += "</" + tag + ">";
    } else {
      html += " />";
    }
    return html;
  };
  
  Sammy.FormBuilder = function(name, object) {
    this.name   = name;
    this.object = object;
  };
  
  $.extend(Sammy.FormBuilder.prototype, {
    
    open: function(attributes) {
      return simple_element('form', $.extend({'method': 'post', 'action': '#/' + this.name + 's'}, attributes), false);
    },
    
    close: function() {
      return '</form>';
    },
    
    label: function(keypath, content, attributes) {
      var attrs = {'for': this.attributesForKeyPath(keypath).name};
      return simple_element('label', $.extend(attrs, attributes), content);
    },
        
    hidden: function(keypath, attributes) {
      attributes = $.extend({type: 'hidden'}, this.attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },
        
    text: function(keypath, attributes) {
      attributes = $.extend({type: 'text'}, this.attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },
    
    textarea: function(keypath, attributes) {
      var current;
      attributes = $.extend(this.attributesForKeyPath(keypath), attributes);
      current = attributes.value;
      delete attributes['value'];
      return simple_element('textarea', attributes, current);
    },
    
    password: function(keypath, attributes) {
      return this.text(keypath, $.extend({type: 'password'}, attributes));
    },
    
    select: function(keypath, options, attributes) {
      var option_html = "", selected;
      attributes = $.extend(this.attributesForKeyPath(keypath), attributes);
      selected = attributes.value;
      delete attributes['value'];
      $.each(options, function(i, option) {
        var value, text, option_attrs;
        if ($.isArray(option)) {
          value = option[1], text = option[0];
        } else {
          value = option, text = option;
        }
        option_attrs = {value: getStringContent(this.object, value)};
        // select the correct option
        if (value === selected) { option_attrs.selected = 'selected'; }
        option_html += simple_element('option', option_attrs, text);
      });
      return simple_element('select', attributes, option_html);
    },
    
    radio: function(keypath, value, attributes) {
      var selected;
      attributes = $.extend(this.attributesForKeyPath(keypath), attributes);
      selected = attributes.value;
      attributes.value = getStringContent(this.object, value);
      if (selected == attributes.value) {
        attributes.checked = 'checked';
      }
      return simple_element('input', $.extend({type:'radio'}, attributes));
    },
    
    checkbox: function(keypath, value, attributes) {
      var content = "";
      if (!attributes) { attributes = {}; }
      if (attributes.hidden_element !== false) {
        content += this.hidden(keypath, {'value': !value});
      }
      delete attributes['hidden_element'];
      content += this.radio(keypath, value, $.extend({type: 'checkbox'}, attributes));
      return content;
    },
    
    submit: function(attributes) {
      return simple_element('input', $.extend({'type': 'submit'}, attributes));
    },
    
    attributesForKeyPath: function(keypath) {
      var builder    = this,
          keys       = $.isArray(keypath) ? keypath : keypath.split(/\./), 
          name       = builder.name, 
          value      = builder.object,
          class_name = builder.name;
          
      $.each(keys, function(i, key) {
        if ((typeof value === 'undefined') || value == '') {
          value = ''
        } else if (typeof key == 'number' || key.match(/^\d+$/)) {
          value = value[parseInt(key, 10)];
        } else {
          value = value[key];
        }
        name += "[" + key + "]";
        class_name += "-" + key;
      });
      return {'name': name, 
              'value': getStringContent(builder.object, value), 
              'class': class_name};
    }
  });
  
  Sammy.Form = function(app) {
    
    app.helpers({
      simple_element: simple_element,
      
      formFor: function(name, object, content_callback) {
        var builder;
        // define a form with just a name
        if ($.isFunction(object)) {
          content_callback = object;
          object = this[name];
        }
        builder = new Sammy.FormBuilder(name, object),
        content_callback.apply(this, [builder]);
        return builder;
      }
    });
    
  };
  
})(jQuery);