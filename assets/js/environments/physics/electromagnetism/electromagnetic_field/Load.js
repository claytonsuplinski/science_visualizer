Object.assign( JL.webgl.load.groups, {
	"Electromagnetic Field": {
		steps : [
			{
				init : function(callback){
					var config = JL.webgl.hashlinks.get_val( 'config' ) || {};
					if( !config.cfg ) config.cfg = {};

					try     { var sources = config.sources || []; }
					catch(e){ var sources = []; }

					var instanced_vals = {
						pos                         : { x : [], y : [], z : [] },
						pos_vector                  : { x : [], y : [], z : [] },
						color                       : { r : [], g : [], b : [] },
						rot                         : { roll : [], pitch : [], yaw : [] },
						size                        : { size : [] },
						pos_loop_dur                : { val  : [] },
						pos_loop_time_offset        : { val  : [] },
						alpha_mult_loop_dur         : { val  : [] },
						alpha_mult_loop_time_offset : { val  : [] },
					};

					var field_rad = config.cfg.rad  || 20;
					var field_del = config.cfg.spc  ||  1; 
					var loop_dur  = config.cfg.loop ||  5;

					var vector_field = [];
					
					if( sources.length ){
						var max_E = 0;
						for                ( var x = -field_rad; x <= field_rad; x += field_del ){
							for        ( var y = -field_rad; y <= field_rad; y += field_del ){
								for( var z = -field_rad; z <= field_rad; z += field_del ){
									var v = JL.physics.calculate_electromagnetic_field( [ x, y, z ], sources );
									var dir = v.E;
									var  mag_E = JL.functions.get_magnitude( dir );
									if( !mag_E ) continue;
									if(  mag_E > max_E ) max_E = mag_E;

									var vec = JL.functions.normalize( v.E );

									var pos_x = x;
									var pos_y = y;
									var pos_z = z;
									if( v.color_E[2] > 0.5 ){
										pos_x -= vec[0];
										pos_y -= vec[1];
										pos_z -= vec[2];
									}

									vector_field.push({
										pos         : [ pos_x, pos_y, pos_z ],
										size        : mag_E,
										color       : v.color_E,
										time_offset : JL.functions.random_number( 0, loop_dur ),
										vec, loop_dur,
									});
								}
							}
						}

						for( var v of vector_field ){
							v.size /= max_E;
							v.size = Math.sqrt( v.size );

							var a = Math.sqrt( v.size );

							v.color[0] = JL.functions.interpolate( 0.5, v.color[0], a );
							v.color[1] = JL.functions.interpolate( 0.5, v.color[1], a );
							v.color[2] = JL.functions.interpolate( 0.5, v.color[2], a );
						}
					}

					JL.webgl.load.graphics_objects_list( this, [
						{
							label  : [ 'electromagnetic_field' ],
							keys   : [ 'pointer' ],
							params : {
								properties : { effects : [ "_plain", ], },
								advanced   : { vector_field, },
							},
						},
					]);

					var instanced_point_charges = {
						pos   : { x : [], y : [], z : [] },
						color : { r : [], g : [], b : [] },
					};

					var labels = [];

					for( var source of sources ){
						if( source.t == 'point_charge' ){
							instanced_point_charges.pos.x.push( source.pos[0] );
							instanced_point_charges.pos.y.push( source.pos[1] );
							instanced_point_charges.pos.z.push( source.pos[2] );

							var color = undefined;
							if     ( source.ch > 0 ){ color = [ 1, 0, 0 ]; labels.push( Object.assign({ name : '+' }, { pos : source.pos, } ) ); } 
							else if( source.ch < 0 ){ color = [ 0, 0, 1 ]; labels.push( Object.assign({ name : '-' }, { pos : source.pos, } ) ); }
							else                    { color = [ 0.5, 0.5, 0.5 ]; }

							instanced_point_charges.color.r.push( color[0] );
							instanced_point_charges.color.g.push( color[1] );
							instanced_point_charges.color.b.push( color[2] );
						}
					}

					JL.webgl.load.graphics_objects_list( this, [
						{
							label  : [ 'point_charges' ],
							type   : 'sphere',
							params : {
								radius     : 0.2,
								properties : {
									effects : [ "_instanced_pos", "_instanced_color", "_inverted_normals", ],
								},
								attr       : { num_instances : instanced_point_charges.pos.x.length, },
								instanced_vals : instanced_point_charges,
							},
						},
					]);

					var font_texture = JL.functions.font_to_canvas({
						font_family   : 'Open Sans',
						font_size     : 60,
						color         : '#fff',
						outline_color : '#000',
						outline_width : 5,
					});

					var char_offset = 0;
					var s = 0.75;
					JL.webgl.load.graphics_objects_list( this, [{
						label  : [ 'sources_names' ],
						type   : 'square',
						params : {
							textures : [
								{ type : 'font'        , filename : font_texture },
								{ type : 'encoded_text', filename : JL.webgl.functions.encode_text_to_pixels({ text : labels.map(function( l ){ return l.name; }).join('') }) },
							],
							properties      : { effects : [ '_plain', '_instanced_text', '_instanced_pos', '_instanced_impostor_xyz' ] },
							dynamic_buffers : [ "pos" ],
							clamp_textures  : true,
							transforms      : [{ type : 'scale', x : 8 * s, y : 0.5 * s, z : 8 * s },],
							custom_init     : function(){
								labels.forEach(function( l ){
									this.pos.push( ...l.pos );
									this.char_offset.push( char_offset );
									this.str_len.push(     l.name.length );
									char_offset         += l.name.length;
								}, this);

								this.num_instances = labels.length;
							}
						},
					}] );

					callback();
				}
			},
		],
		scripts : [
			"./assets/js/environments/physics/electromagnetism/electromagnetic_field/ui/electromagnetic_field.js",
		]
	},
} );
