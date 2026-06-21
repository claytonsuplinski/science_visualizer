JL.webgl.init({
	attr : {
		load : {
			groups : {
				"Shared": {
					steps : [
						{
							init : function(callback){
								$.ajax({
									url      : './assets/data/menu.json',
									dataType : 'json',
									success  : function( data ){
										JL.webgl.ui.item.landing.menu = data;

										callback();
									},
								});
							}
						},
					],
					scripts : [
						"./assets/js/environments/main/ui/landing.js",
					],
				}
			},
		},
		variables : {
			default_background   : '_default',
			default_key_bindings : [ 'mouse', 'reset' ],
		},
	},
	controllers : {},
	hashlinks   : {
		params : {
			item : {},
		},
	},
	keyboard    : {
		bindings : {
			// gold_character : [
			// 	{ name : "A", controllers : { ps4 : 'Control Pad Left'  }, down : function(){ JL.webgl.active_camera.target.turn(-1); } },
			// 	{ name : "D", controllers : { ps4 : 'Control Pad Right' }, down : function(){ JL.webgl.active_camera.target.turn( 1); } },
			// 	{ name : "W", controllers : { ps4 : 'Control Pad Up'    }, hold : function(){ JL.webgl.active_camera.target.walk( 1); } },
			// 	{ name : "S", controllers : { ps4 : 'Control Pad Down'  }, hold : function(){ JL.webgl.active_camera.target.walk(-1); } },
			// ],
		},
	},
	mouse       : {},
	environment : {
		custom_functions : {
			on_load : function(){
				try{ JL.webgl.device.options.vr.loading_background.hide(); } catch(e){}
			},
			pre_instantiate : function(){
				this.on_pause = function(){
					JL.webgl.ui.key_bindings.disable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.disable();
				};

				this.on_resume = function(){
					JL.webgl.ui.key_bindings.enable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.enable();
				};
			},
		}
	},
	load : {
		custom_functions : {
			assets_on_start : function( p ){
				try{ JL.webgl.device.options.vr.loading_background.show(); } catch(e){}
				JL.webgl.ui.intermediate_loading.show();
				p.callback();
			},
			assets_on_finish : function(){
				JL.webgl.ui.intermediate_loading.hide();
			},
		},
	},
});

window.onhashchange = function(){ JL.webgl.hashlinks.start(); window.location.reload(); };
// window.onload       = function(){ JL.webgl.hashlinks.start(); };
