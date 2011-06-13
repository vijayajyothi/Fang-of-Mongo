function fom_init_coll_list() {
  Fom_coll_list = $.extend({}, $.ui.fom_plugin.prototype, {
    _init: function(){
      $.ui.fom_plugin.prototype._init.call(this); // call the original function
      var this_obj = this;
      $('#mongo_ui_header_tools_bus').fom_bus('add_listener', this);
      $('#mongo_ui_collection_list').fom_ui_list({
        'title':'Collections',
        'div_id': 'mongo_ui_collection_list',
        'position':['left', 420],
        disabled: true,
      });

      $('#mongo_ui_collection_list').bind('search', function(e, query){ this_obj.search(query); });
      $('#mongo_ui_collection_list').bind('fom_item_selected', function(e, collname){
        this_obj.options['collection'] = collname;
        $('#mongo_ui_header_tools_bus').fom_bus('signal', 'collection_selected', this, {'collection': collname } );
      });
      $('#mongo_ui_collection_list').fom_ui_list('get_ui_element', 'search_input').focus(function() {
        $('#mongo_ui_header_tools_bus').fom_bus('signal', 'help_needed', this_obj, { book:'fom_collection_list', topic:'search_collection_list'  } );
      });
      $('#mongo_ui_collection_list').bind('close', function(){
        $('#mongo_ui_collection_list_menu_btn').attr('checked',false);
        $('#mongo_ui_collection_list_menu_btn').button('refresh');
      });
      $('#mongo_ui_collection_list').fom_ui_list('get_ui_element','toolbox')
        .html(
          $('<button>+</button>').addClass('fom_ui_list_toolbox_btn').addClass('new_db').click(function(){
            //new collection
            $('<div />').html(
              $('<span>New collection name:</span>')
              .add(
                $('<input type="text"/>').keyup(function(event){
                  if (event.keyCode == 13) {
                    $(this).parent().dialog('widget').find('button').first().trigger('click');
                  }
                })
              )
            )
            .dialog({
              autoOpen: true,
              height: 150,
              width: 350,
              modal: true,
              closeOnEscape: true,
              title: 'Create collection',
              buttons: {
                'Create': function(){
                  //create new collection
                  collname = $(this).find('input').val().trim();
                  if (collname == '') {
                     alert('You have to type a name for new collection');
                     return;
                  };
                  $('#mongo_ajax').fom_object_mongo_ajax('operation', {
                    operation:   'create_collection',
                    subject:    'database',
                    database: ''+this_obj.options['database'],
                    collection_name: collname,
                    context: this_obj,
                    callback: function(data){
                      if ( 'error' in data ) { alert('error: ' + data['error']); return; }
                      $('#mongo_ui_collection_list').fom_ui_list('get_ui_element', 'search_btn').click();
                    },
                  });
                  $(this).dialog('close');
                },
                'Cancel': function(){
                  $(this).dialog('close');
                },
              },
            })
            .find('input')
            .focus()

          })
          .add($('<button>-</button>').addClass('fom_ui_list_toolbox_btn').addClass('del_db').click(function(){
            //remove collection
            if (!$('#mongo_ui_collection_list').fom_ui_list('has_selected')) {
              alert('There is no collection selected.');
              return;
            }
            $('<div />').html(
              $('<span>Are you sure you want to drop collection ' + this_obj.options['collection']  + ' from database ' + this_obj.options['database'] + ' ?</span>')
            )
            .dialog({
              autoOpen: true,
              height: 150,
              width: 350,
              modal: true,
              closeOnEscape: true,
              title: 'Drop collection',
              buttons: {
                'Drop': function(){
                  //drop collection
                  $('#mongo_ajax').fom_object_mongo_ajax('operation', {
                    operation:   'drop_collection',
                    subject:    'database',
                    database: ''+this_obj.options['database'],

                    collection_name: ''+this_obj.options['collection'], //HACK: without ''+ hack, jquery sends collname as array (collection_name[0]: first letter of name - and so on)
                    context: this_obj,
                    callback: function(data){
                      if ( 'error' in data ) { alert('error: ' + data['error']); return; }
                      $('#mongo_ui_collection_list').fom_ui_list('get_ui_element', 'search_btn').click();
                    },

                  });
                  $(this).dialog('close');
                },
                'Cancel': function(){
                  $(this).dialog('close');
                },
              },

            });

          }))
        );



    },

     signal: function(signal_name, signal_source, signal_data ) {
      //alert('colls received signal' + signal_name);
      if (signal_name == 'database_selected')
      {
        this.enable();
        this.options['database'] = signal_data['database'];
        $('#mongo_ajax').fom_object_mongo_ajax('get_collection_list','','')
      } else
      if (signal_name == 'no_database_selected')
      {
        $('#mongo_ui_collection_list').fom_ui_list('clear');
        this.options['database'] = null;
        this.disable();
      } else
      if ( signal_name == 'collection_list_received')
      {
        $('#mongo_ui_collection_list').fom_ui_list('set_list', signal_data['data'], signal_data['search'], signal_data['method']);
      }

    },

     enable: function() {
       $.ui.fom_plugin.prototype.enable.call(this); // call the original function
       $('#mongo_ui_collection_list').fom_ui_list('enable');
     },

     disable: function() {
       $.ui.fom_plugin.prototype.enable.call(this); // call the original function
       $('#mongo_ui_collection_list').fom_ui_list('disable');
     },


     search: function(query){
       $('#mongo_ajax').fom_object_mongo_ajax('get_collection_list',query,'');
     },

  });
  $.widget("ui.fom_plugin_colls", Fom_coll_list);

  //init collection list
  $('#mongo_ui_header_tools').after('<span id="mongo_ui_header_tools_coll_list"></span>');
  $(window).load( function() { $('#mongo_ui_header_tools_coll_list').fom_plugin_colls({disabled: true}); });

  //end of collection list
}
