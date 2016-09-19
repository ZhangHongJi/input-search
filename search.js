(function(b){
    var $ = b , Search   
    Search = function(a,option) {
        if( ! a.length  )
        {
          return ;
        }
        this.input = a,this.url = option.hasOwnProperty('url') ?option.url: null,this.result = '',this.search_key = '',
        this.width = this.input.outerWidth(true),
        this.top = this.input.offset().top,this.left=this.input.offset().left,
        this.height = this.input.outerHeight(true) ,this.search_key='',
        this.id =  ( this.input.attr('id') || option.id || 'search_'+parseInt(Math.random()*10000) ) +'_search'
        this.input.option = option ; 
        var default_val = option.hasOwnProperty('defaultVal')?option.defaultVal:'' ; 
        this.input.val(default_val);
        this.searchKeyFormat  =  option.hasOwnProperty('searchKeyFormat')?option.searchKeyFormat:null ;
        var parent = this.input;
        //找到当前对象的最外层的父级
        while( parent.parent().offset().top )
        {
            parent = parent.parent() ; 
        }
        parent =  parent.parent() ; 
        $(this.input).attr({'autocomplete':'off'}); 
        // console.log(parent);
        this.$result = $('<div/>',{class:'search-drop',id:this.id,width:this.width}) 
        this.$result.css({top:-9999,left:-9999})
        // this.$result.hide()
        this.search_results = $('<ul />',{class:'search-results',id:this.id+"_result",width:this.width}); 
        parent.append(this.$result);
        this.$result.append(this.search_results);

        this.maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
        this.$result.css({'max-height':this.maxHeight+1})
        this.search_results.hide()
        this.input.css({'marginBottom':0})
        this.dataFormat =  option.hasOwnProperty('dataFormat')?option.dataFormat:null; 
        this.searchResult = option.hasOwnProperty('searchResult')?option.searchResult:null; 
        this.initData = option.hasOwnProperty('initData')?option.initData:null;
        this.initUrl  = option.hasOwnProperty('initUrl')?option.initUrl:null;
        this.result = {} 
        this.results_showing = false  
        this.region_event()
        this.searchModel = 'open'  
        if( this.initData != null && typeof this.initData  == 'object' )
        {
            this.result = this.initData 
            this.searchModel = 'init' 
            this.result_to_option()
            this.results_hide()
        }
        if( this.initUrl  != null && typeof this.initUrl  == 'string' )
        {
            mysearch = this 
            $.ajax({
                type:'post',
                url:this.initUrl, 
                async:false,
                success:function(r)
                {
                    mysearch.result  =  eval('('+r+')') || {} 
                    mysearch.initData = mysearch.result
                    mysearch.result_to_option() 
                    mysearch.results_hide()
                }
            }); 
            this.searchModel = 'init'            
        }
    } 
    Search.prototype.region_event = function() {
        var mysearch = this 
        this.input.on('focus.Search',function(e){
            mysearch.results_show() 
        })
        this.input.on('blur.Search',function(e){
            mysearch.results_hide()  
        })
        this.input.on('keydown.Search',function(e){
            mysearch.keydown_checker(e);
        })
        this.input.on('keyup.Search',function(e){
            mysearch.keyup_checker(e);
        })
        this.input.on('update.Search',function(e){
            mysearch.update_search(e);
        })
        this.input.on('destroy.Search',function(e){
            mysearch.destroy_search(e);
        })
        this.search_results.on('mousedown.Search', function(e) {
            mysearch.search_results_mouseup(e);
        });
        this.search_results.on('mouseover.Search', function(e) {
            mysearch.search_results_mouseover(e);
        });
        this.search_results.on('mousewheel.Search DOMMouseScroll.Search', function(e) {
            mysearch.search_results_mousewheel(e);
        });
        window.onresize = function ()
        {
            mysearch.results_hide();
        } 
    }
    Search.prototype.keyup_checker = function(evt) {
      var stroke, _ref;
      stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
      switch (stroke) {
        case 8:
           return this.begin_search(evt);
          break;
        case 13:
          evt.preventDefault();
          if (this.results_showing) {
            return this.result_select(evt);
          }
          break;
        case 27:
          if (this.results_showing) {
            this.results_hide();
          }
          return true;
        case 9:
        case 38:
        case 40:
        case 16:
        case 91:
        case 17:
          break;
        default:
          return this.begin_search(evt);
      }
    };
    Search.prototype.destroy_search = function(evt){
        $('#'+this.id).remove(); 
        this.length = 0 ;
        return this
    }
    Search.prototype.keydown_checker = function(evt) {
      var stroke, _ref1;

      stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
      switch (stroke) {
        case 9:
          this.results_hide();
          break;
        case 13:
          evt.preventDefault();
          break;
        case 38:
          evt.preventDefault();
          this.keyup_arrow();
          break;
        case 40:
          evt.preventDefault();
          this.keydown_arrow();
          break;
      }
    };
    Search.prototype.keyup_arrow = function() {
      var prev_sibs;
      if( this.results_showing ){
        prev_sibs = this.result_highlight.prevAll("li.active-result");
        if(prev_sibs.first().length < 0)
        {
            return this.result_do_highlight(this.result_highlight);
        }
        return this.result_do_highlight(prev_sibs.first());
      }
      else 
      {
          return this.results_show();
      }
    };
    Search.prototype.keydown_arrow = function() {
      var next_sib;
      if( this.results_showing ){
        next_sib = this.result_highlight.nextAll("li.active-result");
        if(next_sib.first().length < 0)
        {
            return this.result_do_highlight(this.result_highlight);
        }
        return this.result_do_highlight(next_sib.first());
      }
      else 
      {
        return this.results_show()
      }
       
    };

    Search.prototype.search_results_mousewheel = function(evt) {
      var delta, _ref1, _ref2;

      delta = -((_ref1 = evt.originalEvent) != null ? _ref1.wheelDelta : void 0) || ((_ref2 = evt.originialEvent) != null ? _ref2.detail : void 0);
      if (delta != null) {
        evt.preventDefault();
        if (evt.type === 'DOMMouseScroll') {
          delta = delta * 40;
        }
        return this.search_results.scrollTop(delta + this.search_results.scrollTop());
      }
    };
    Search.prototype.update_search = function(evt){

        this.width = this.input.outerWidth(true),
        this.top   = this.input.offset().top,
        this.left  =this.input.offset().left,
        this.height = this.input.outerHeight(true)
    }
    Search.prototype.results_hide = function() 
    {
        this.search_results.hide()
        this.$result.hide()
        this.results_showing = false 
        $(this.input).trigger('Depart:Search');//离开搜索
    }
    Search.prototype.results_show = function() 
    {
        if( this.result.length > 0  ){
          this.search_results.show()
          this.$result.show()
          this.search_results.css({width:(this.width-5)})
          this.$result.css({width:(this.width)})
          if( this.input.offset().top + this.input.outerHeight(true) + this.maxHeight  > $(window).height() ){
             var minHeight =  this.search_results.outerHeight(true)>=this.maxHeight?this.maxHeight:this.search_results.outerHeight(true)
             this.$result.css({top:(this.top- minHeight),left:this.left,zIndex:9999});
          }
          else{
              this.$result.css({top:(this.input.offset().top+this.input.outerHeight(true)),left:this.input.offset().left-1});
              // console.log(this.input.offset().top+this.input.outerHeight(true));
          }
          this.results_showing = true 
        }
    }

    Search.prototype.result_do_highlight = function(el) {
      var high_bottom, high_top, maxHeight, visible_bottom, visible_top;

      if (el.length) {
        this.result_clear_highlight();
        this.result_highlight = el;
        this.result_highlight.addClass("highlighted");
        this.input.trigger('Select.Search',this.result_highlight); 
        maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
        visible_top = this.search_results.scrollTop();
        visible_bottom = maxHeight + visible_top;
        high_top = this.result_highlight.position().top + this.search_results.scrollTop();
        high_bottom = high_top + this.result_highlight.outerHeight();
        if (high_bottom >= visible_bottom) {
          return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
        } else if (high_top < visible_top) {
          return this.search_results.scrollTop(high_top);
        }
      }
    };

    Search.prototype.result_clear_highlight = function() {
      if (this.result_highlight) {
        this.result_highlight.removeClass("highlighted");
      }
      return this.result_highlight = null;
    };
    Search.prototype.search_results_mouseup = function(evt) {
      this.result_select(evt);
      return this.input.focus(); 
    };

    Search.prototype.search_results_mouseover = function(evt) {
      var target;

      target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
      if (target) {
        return this.result_do_highlight(target);
      }
    };

    // Search.prototype.search_results_mouseout = function(evt) {
    //   if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
    //     return this.result_clear_highlight();
    //   }
    // };
    

    Search.prototype.result_clear_highlight = function() {
      if (this.result_highlight) {
        this.result_highlight.removeClass("highlighted");
      }
      return this.result_highlight = null;
    };
    Search.prototype.result_select = function(evt) {
      var high, item, selected_index;
      var target;
      target = $(evt.target).hasClass("active-result") ? $(evt.target) : this.$result.find('.highlighted').first();
      $(this.input).val(target.text()); 
      $(this.input).data(target.data()); 
      this.input.data = target.data();
      if( this.searchResult != null && typeof this.searchResult == 'function' )
      { 
          this.searchResult.call(target.data())
          $(this.input).trigger('change')
      }
      this.results_hide()
    };
    Search.prototype.begin_search = function(e){
        if(  this.input.val().trim() == ""  )
        {
            var data = $(this.input).data(); 
            for(var i in data)
            {
                data[i] = undefined ; 
            }
            $(this.input).data(data);
            this.input.data = {};
        }// 做下清空 
        var new_val =  "" ; 
        if(this.searchKeyFormat != null )
        {
           var search_obj = {} ; 
           for (var i  in  this.searchKeyFormat) {
              search_obj[i] = this.searchKeyFormat[i].val();  
           } 
           new_val = JSON.stringify(search_obj); 
        }
        else 
        {
           new_val = this.input.val(); 
        }
        if( this.searchModel  == 'open' ){

            if( new_val != this.search_key ){

              this.search_key  = new_val   
              var search_key = {key:this.search_key}
              this.ajax(search_key)
            }
        }
        else if( this.searchModel == 'init')
        {
            new_val  = this.input.val()   
            this.result  = this.initData; 
            this.result_to_option()
        }
    }
    Search.prototype.ajax = function(search_key){
         var mysearch = this 
         if(this.url != null &&  typeof this.url == "string") {
              $.ajax({
                type:'post',
                data:search_key,
                url:mysearch.url, 
                // async:false,
                success:function(r)
                {
                    mysearch.result  =  eval('('+r+')') || {} 
                    mysearch.result_to_option() 
                }
              }); 
         }
    };
    Search.prototype.result_to_option = function (){
        var  r = []
        $.extend(true,r, this.result)
        this.search_results.html('');
        for(var i in r )
        {   
            var search_key = this.input.val().trim();
            var begin,length = search_key.length 
            if(this.dataFormat != null && typeof this.dataFormat == "object")
            { 
                begin = r[i][this.dataFormat.text].trim().indexOf(search_key)
                if( begin == -1  )
                {
                    continue ; 
                }
                r[i][this.dataFormat.text] = r[i][this.dataFormat.text].substr(0,begin)+"<b>"+r[i][this.dataFormat.text].substr(begin,length)+"</b>"+r[i][this.dataFormat.text].substr(begin+length)  
            }
            else {
                begin = r[i].indexOf(search_key) 
                if(begin >= 0 ){
                  r[i] = r[i].substr(0,begin)+"<b>"+r[i].substr(begin,length)+"</b>"+r[i].substr(begin+length)  
                }
            }
            
            if(this.dataFormat != null && typeof this.dataFormat == "object")
            {
               var data_key = {} 
               for (var keys in  this.dataFormat.key){
                  data_key[this.dataFormat.key[keys]] =  r[i][this.dataFormat.key[keys]]
               }
               this.search_results.append($('<li />',{class:'active-result'}).html(r[i][this.dataFormat.text]).data(data_key))
            }
            else { //defualt 
              this.search_results.append($('<li />',{key:i,class:'active-result'}).html(r[i]))
            }
        }
        this.result_highlight = this.search_results.find('li').first()
        this.result_highlight.addClass('highlighted')
        this.results_show();
    }
    $.fn.extend({
        search:function(option)
        {
          
            option = option || {}  
            new Search(this,option)
          
            return this
        }
    })
    
})($)
