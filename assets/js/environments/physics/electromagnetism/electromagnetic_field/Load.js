Object.assign( JL.webgl.load.groups, {
	"Electromagnetic Field": {
		steps : [
			{
				init : function(callback){
					var config = JL.webgl.hashlinks.get_val( 'config' ) || {};
					if( !config.cfg ) config.cfg = {};

					try     { var sources = config.sources || []; }
					catch(e){ var sources = []; }
					// var sources = JL.webgl.environments.physics.electromagnetism.sources = [
					// 	{
					// 	// A stationary point charge (e.g., an electron)
					// 		t   : 'point_charge',
					// 		pos : [0,0,0],
					// 		ch  : -1
					// 	},
					// 	{
					// 		t: 'point_charge',
					// 		pos : [3,0,0],
					// 		ch  : 1
					// 	},
					// 	// {
					// 	// // A moving proton
					// 	// 	t: 'point_charge',
					// 	// 	pos : [1,0,0],
					// 	// 	ch  : 1.602e-19,
					// 	// 	vel : [ 0, 1000, 0 ] // m/s
					// 	// },
					// 	// {
					// 	// // A permanent magnet modeled as a dipole
					// 	// 	t   : 'magnetic_dipole',
					// 	// 	pos : [-1,0,0],
					// 	// 	mm  : [0,0.1,0] // magnetic moment (in A*m^2)
					// 	// },
					// 	// {
					// 	// // A straight wire/inductor approximation
					// 	// 	t: 'infinite_wire',
					// 	// 	pos : [0,0,-1], // Any point the wire passes through
					// 	// 	dir : [1,0,0], // Wire runs along the X axis
					// 	// 	cur : 5, // Amperes
					// 	// }
					// ];

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

					var E_mags = [];

					var field_rad = config.cfg.rad  || 20;
					var field_del = config.cfg.spc  ||  1; 
					var loop_dur  = config.cfg.loop ||  5;
					
					// TODO : Turn the following into s_o._vector_field class.
					var max_E = 0;
					for                ( var x = -field_rad; x <= field_rad; x += field_del ){
						for        ( var y = -field_rad; y <= field_rad; y += field_del ){
							for( var z = -field_rad; z <= field_rad; z += field_del ){
								var v = JL.physics.calculate_electromagnetic_field( [ x, y, z ], sources );
								var dir = v.E;
								var mag_E = JL.functions.get_magnitude( dir );
								if( mag_E > max_E ) max_E = mag_E;
								E_mags.push( mag_E );
								var vec = [0,1,0];

								var roll = 0; var pitch = 0; var yaw = 0;

								var pitch = JL.functions.get_angle_between_2d({ center : [0,0], v1 : [vec[1],vec[2]], v2 : [ dir[1], dir[2] ] });
								vec = JL.functions.vector_rotate_3d( vec, 'x', pitch );

								var yaw = JL.functions.get_angle_between_2d({ center : [0,0], v1 : [vec[0],vec[2]], v2 : [ dir[0], dir[2] ] });
								vec = JL.functions.vector_rotate_3d( vec, 'y', yaw );

								var roll  = JL.functions.get_angle_between_2d({ center : [0,0], v1 : [vec[0],vec[1]], v2 : [ dir[0], dir[1] ] });

								vec = JL.functions.vector_rotate_3d( vec, 'z', roll );

								var pos_x = x;
								var pos_y = y;
								var pos_z = z;
								if( v.color_E[2] > 0.5 ){
									pos_x -= vec[0];
									pos_y -= vec[1];
									pos_z -= vec[2];
								}

								instanced_vals.pos.x.push( pos_x );
								instanced_vals.pos.y.push( pos_y );
								instanced_vals.pos.z.push( pos_z );

								instanced_vals.rot.roll .push( roll  * JL.functions.constants.to_radians );
								instanced_vals.rot.pitch.push( pitch * JL.functions.constants.to_radians );
								instanced_vals.rot.yaw  .push( yaw   * JL.functions.constants.to_radians );

								instanced_vals.color.r.push( v.color_E[0] );
								instanced_vals.color.g.push( v.color_E[1] );
								instanced_vals.color.b.push( v.color_E[2] );

								instanced_vals.size.size.push( mag_E );

								instanced_vals.pos_vector.x.push( vec[0] );
								instanced_vals.pos_vector.y.push( vec[1] );
								instanced_vals.pos_vector.z.push( vec[2] );

								var time_offset = JL.functions.random_number( 0, loop_dur );

								instanced_vals.pos_loop_dur.val.push( loop_dur );

								instanced_vals.pos_loop_time_offset.val.push( time_offset );

								instanced_vals.alpha_mult_loop_dur.val.push( loop_dur );

								instanced_vals.alpha_mult_loop_time_offset.val.push( time_offset );
							}
						}
					}

					for( var i = 0; i < instanced_vals.size.size.length; i++ ){
						instanced_vals.size.size[ i ] /= max_E;
						instanced_vals.size.size[ i ] = Math.sqrt( instanced_vals.size.size[ i ] );

						var a = Math.sqrt( instanced_vals.size.size[i] );

						instanced_vals.color.r[ i ] = ( JL.functions.interpolate( 0.5, instanced_vals.color.r[ i ], a ) );
						instanced_vals.color.g[ i ] = ( JL.functions.interpolate( 0.5, instanced_vals.color.g[ i ], a ) );
						instanced_vals.color.b[ i ] = ( JL.functions.interpolate( 0.5, instanced_vals.color.b[ i ], a ) );
					}

					JL.webgl.load.graphics_objects_list( this, [
						{
							label  : [ 'electromagnetic_field' ],
							keys   : [ 'pointer' ],
							params : {
								properties : {
									effects : [ "_plain", "_instanced_pos", "_instanced_color", "_instanced_rot", "_instanced_size", "_instanced_pos_vector_loop", "_instanced_alpha_mult_loop", ],
								},
								attr       : { num_instances : instanced_vals.pos.x.length, },
								instanced_vals,
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
