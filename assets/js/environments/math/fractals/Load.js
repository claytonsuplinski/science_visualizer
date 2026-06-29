Object.assign( JL.webgl.load.groups, {
	"Math Fractals": {
		steps : [
			{
				init : function(callback){
					var self = this;

					var instanced_vals = {
						pos  : { x : [], y : [], z : [] },
						size : { size : [] },
					};

					// -----------
					var points = JL.fractals.custom_blob_3d( 100 );
					var size_factor = 0.5;
					// -----------
					// var points = JL.fractals.mandelbulb_3d( 50, 6 );
					// var size_factor = 0.5;
					// -----------
					// var points = JL.fractals.pyramid_3d( 6 );
					// var size_factor = 0.6;
					// -----------
					// var points = JL.fractals.cubes_3d( 4 );
					// var size_factor = 0.504;
					// -----------
					// var points = JL.fractals.fern_3d( 5000 );
					// -----------

					var sizes = {};

					var x_min = Infinity; var x_max = -Infinity;
					var y_min = Infinity; var y_max = -Infinity;
					var z_min = Infinity; var z_max = -Infinity;
					for( var pt of points ){
						instanced_vals.pos.x.push( pt.pos[0] );
						instanced_vals.pos.y.push( pt.pos[1] );
						instanced_vals.pos.z.push( pt.pos[2] );

						instanced_vals.size.size.push( pt.size * size_factor );

						if( pt.pos[0] < x_min ) x_min = pt.pos[0];
						if( pt.pos[0] > x_max ) x_max = pt.pos[0];
						if( pt.pos[1] < y_min ) y_min = pt.pos[1];
						if( pt.pos[1] > y_max ) y_max = pt.pos[1];
						if( pt.pos[2] < z_min ) z_min = pt.pos[2];
						if( pt.pos[2] > z_max ) z_max = pt.pos[2];
					}

					var x_offset = ( x_max + x_min ) / 2;
					var y_offset = ( y_max + y_min ) / 2;
					var z_offset = ( z_max + z_min ) / 2;

					for( var i = 0; i < instanced_vals.pos.x.length; i++ ){
						instanced_vals.pos.x[ i ] -= x_offset;
						instanced_vals.pos.y[ i ] -= y_offset;
						instanced_vals.pos.z[ i ] -= z_offset;
					}

					JL.webgl.load.graphics_objects_list( this, [
						{
							label  : [ 'fractal' ],
							type   : 'cube',
							type   : 'sphere',
							params : {
								textures   : [{ filename : './assets/textures/fractal.jpg', }],
								properties : {
									effects : [ "_instanced_pos", "_instanced_size", ],
								},
								attr       : { num_instances : instanced_vals.pos.x.length, },
								instanced_vals,
							},
						},
					]);

					callback();
				}
			},
		],
		scripts : [
			// "./assets/js/environments/math/fractals/ui/math_fractals.js",

			// "./assets/js/environments/main/space_object/bowling_game.js",
		]
	},
} );
