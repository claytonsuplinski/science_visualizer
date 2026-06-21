Object.assign( JL.webgl.load.groups, {
	"Chemistry Molecules": {
		steps : [
			{
				init : function(callback){
					var self = this;

					JL.webgl.functions.create_background({
						name             : 'grid',
						graphics_objects : [{
							type       : 'sphere',
							segs       : 12,
							radius     : 99999,
							properties : { effects : [ '_no_fog', '_plain', '_texture_repeat', ],  },
							textures   : [{ filename : './assets/textures/grid_background.jpg' }],
							attr       : { frags_float : { texture_repeat : 32, } },
						}],
					});

					var smiles = JL.webgl.hashlinks.get_val( 'item' );

					JL.chemistry.parse_smiles({ smiles, callback : function( molecule ){
						var instanced_vals = {
							pos   : { x : [], y : [], z : [] },
							color : { r : [], g : [], b : [] },
						};

						var min_x = Infinity; var max_x = -Infinity;
						var min_y = Infinity; var max_y = -Infinity;
						var min_z = Infinity; var max_z = -Infinity;
						for( var atom of molecule.atoms ){
							if( atom.x > max_x ) max_x = atom.x;
							if( atom.x < min_x ) min_x = atom.x;
							if( atom.y > max_y ) max_y = atom.y;
							if( atom.y < min_y ) min_y = atom.y;
							if( atom.z > max_z ) max_z = atom.z;
							if( atom.z < min_z ) min_z = atom.z;
						}

						var new_center = {
							x : ( min_x + max_x ) / 2,
							y : ( min_y + max_y ) / 2,
							z : ( min_z + max_z ) / 2,
						};

						molecule.size = Math.max(
							max_x - min_x,
							max_y - min_y,
							max_z - min_z,
						);

						for( var atom of molecule.atoms ){
							atom.x -= new_center.x;
							atom.y -= new_center.y;
							atom.z -= new_center.z;
						}

						JL.webgl.environments.chemistry.molecules.molecule = molecule;

						for( var atom of molecule.atoms ){
							instanced_vals.pos.x.push( atom.x );
							instanced_vals.pos.y.push( atom.y );
							instanced_vals.pos.z.push( atom.z );

							var color = JL.functions.hex_to_rgb( atom.config.color );
							instanced_vals.color.r.push( color[0] );
							instanced_vals.color.g.push( color[1] );
							instanced_vals.color.b.push( color[2] );
						}

						JL.webgl.load.graphics_objects_list( self, [
							{
								label  : [ 'molecule' ],
								type   : 'sphere',
								params : {
									radius     : 0.25,
									properties : {
										effects : [ "_instanced_pos", "_instanced_color", "_inverted_normals", ],
									},
									attr       : { num_instances : molecule.atoms.length, },
									instanced_vals,
								},
							},
						]);

						JL.webgl.load.graphics_objects_list( self, [
							{ keys : [ 'double_bond' ], type : 'cube', params : { properties : { effects : [ '_plain' ], color : '0.7, 1.0, 0.7, 1.0' }, x : 1, y : 1, z : 1, transforms : [{ type : 'translate', y : 3 },{ type : 'copies', copies : [{ transforms : [{ type : 'translate', y : -6 }] }] },] } },
							{ keys : [ 'triple_bond' ], type : 'cube', params : { properties : { effects : [ '_plain' ], color : '1.0, 0.7, 0.7, 1.0' }, x : 1, y : 1, z : 1, transforms : [{ type : 'copies', copies : [{ transforms : [{ type : 'translate', y : -6 }] },{ transforms : [{ type : 'translate', y : 6 }] }] },] } },
						]);

						var font_texture = JL.functions.font_to_canvas({
							font_family   : 'Open Sans',
							font_size     : 60,
							color         : '#fff',
							outline_color : '#000',
							outline_width : 5,
						});

						var char_offset = 0;
						var s = 0.5;
						JL.webgl.load.graphics_objects_list( self, [{
							label  : [ 'atom_names' ],
							type   : 'square',
							params : {
								textures : [
									{ type : 'font'        , filename : font_texture },
									{ type : 'encoded_text', filename : JL.webgl.functions.encode_text_to_pixels({ text : molecule.atoms.map(function( atom ){ return atom.config.symbol; }).join('') }) },
								],
								properties      : { effects : [ '_plain', '_instanced_text', '_instanced_pos', '_instanced_size', '_instanced_impostor_xyz' ] },
								dynamic_buffers : [ "pos", "size" ],
								clamp_textures  : true,
								transforms      : [{ type : 'scale', x : 8 * s, y : 0.5 * s, z : 8 * s },],
								custom_init     : function(){
									this.num_instances = molecule.atoms.length;

									molecule.atoms.forEach(function( atom ){
										this.pos.push( atom.x, atom.y, atom.z );
										this.size.push( 1 );
										this.char_offset.push( char_offset );
										this.str_len.push(     atom.symbol.length );
										char_offset         += atom.symbol.length;
									}, this);
								}
							},
						}] );

						callback();
					} });
				}
			},
		],
		scripts : [
			"./assets/js/environments/chemistry/molecules/ui/chemistry_molecule.js",

			// "./assets/js/environments/main/space_object/bowling_game.js",
		]
	},
} );
