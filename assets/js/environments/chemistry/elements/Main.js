JL.webgl.functions.init_environment( [ 'chemistry', 'elements' ], {
	background  : [],
	lights      : [{ position : [ 100, 100, 100 ], ambient : 0.2, color : [ 0.8, 0.8, 0.8 ] }],
	load_groups : [ 'Chemistry Elements' ],
});

JL.webgl.environments.chemistry.elements.load = function(){
	var element = JL.chemistry.get_element({ name : JL.webgl.hashlinks.get_val( 'item' ), });

	var nucleus_rad_max = Math.max( element.number / 20, 1 );
	var nucleus_rad_min = nucleus_rad_max / 2;

	for( var i = 0; i < element.number; i++ ){
		this.add_space_object({
			graphics_objects    : [ JL.webgl.graphics_objects.proton ], draw_xyz : true,
			per_frame_functions : [function(){
				Object.assign( this, JL.functions.random_point_in_sphere({ rad_min : nucleus_rad_min, rad_max : nucleus_rad_max }) );
			}],
		});

		this.add_space_object({
			graphics_objects    : [ JL.webgl.graphics_objects.neutron ], draw_xyz : true,
			per_frame_functions : [function(){
				Object.assign( this, JL.functions.random_point_in_sphere({ rad_min : nucleus_rad_min, rad_max : nucleus_rad_max }) );
			}],
		});


	}

	var num_electrons = element.number;

	var base_orbital_radius = 2 * ( nucleus_rad_min + 1 );

	for( var i = 0; i < num_electrons; i++ ){
		var params = {
			graphics_objects : [ JL.webgl.graphics_objects.electron ],
			draw_xyz         : true,
		};

		var color_main = [ 0, 1, 0, 1 ];

		var per_frame_function = function(){};

		var orbital_center = { x : 0, y : 0, z : 0 };
		var rad_min        = base_orbital_radius;
		var rad_max        = base_orbital_radius;

		var orb = JL.chemistry.get_orbital_from_num_electrons( i + 1 );

		var l_factor = orb.level + 0.5 * ( orb.level - 1 );

		var rand_scl_x = 1;
		var rand_scl_y = 1;
		var rand_scl_z = 1;

		switch( orb.orbital ){
			case 's':
				rad_min = l_factor * base_orbital_radius - 0.2;
				rad_max = l_factor * base_orbital_radius;
				break;
			case 'p':
				if     ( orb.electrons == 1 ) orbital_center.x =  l_factor * base_orbital_radius;
				else if( orb.electrons == 2 ) orbital_center.x = -l_factor * base_orbital_radius;
				else if( orb.electrons == 3 ) orbital_center.y =  l_factor * base_orbital_radius;
				else if( orb.electrons == 4 ) orbital_center.y = -l_factor * base_orbital_radius;
				else if( orb.electrons == 5 ) orbital_center.z =  l_factor * base_orbital_radius;
				else if( orb.electrons == 6 ) orbital_center.z = -l_factor * base_orbital_radius;

				rad_min = l_factor * base_orbital_radius * 0.25 - 0.2;
				rad_max = l_factor * base_orbital_radius * 0.25;
				color_main = [ 1, 1, 0, 1 ];
				break;
			case 'd':
				var rad_scl = 0.25;

				var c_r = l_factor * base_orbital_radius;

				if     ( orb.electrons ==  1 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 0, 45, c_r ) );
				else if( orb.electrons ==  2 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 0,135, c_r ) );
				else if( orb.electrons ==  3 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 0,225, c_r ) );
				else if( orb.electrons ==  4 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 0,315, c_r ) );
				else if( orb.electrons ==  5 ) orbital_center.y =  c_r;
				else if( orb.electrons ==  6 ) orbital_center.y = -c_r;
				else if( orb.electrons ==  7 ){ rand_scl_y = 0.1; rad_scl = 1; }
				else if( orb.electrons ==  8 ) orbital_center.y =  c_r;
				else if( orb.electrons ==  9 ) orbital_center.y = -c_r;
				else if( orb.electrons == 10 ){ rand_scl_y = 0.1; rad_scl = 1; }

				rad_min = c_r * rad_scl - 0.2;
				rad_max = c_r * rad_scl;
				color_main = [ 1, 0.5, 0, 1 ];
				break;
			case 'f':
				var rad_scl = 0.25;

				var c_r = l_factor * base_orbital_radius;

				if     ( orb.electrons ==  1 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 45, 36, c_r ) );
				else if( orb.electrons ==  2 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 45,108, c_r ) );
				else if( orb.electrons ==  3 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 45,180, c_r ) );
				else if( orb.electrons ==  4 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 45,252, c_r ) );
				else if( orb.electrons ==  5 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian( 45,324, c_r ) );
				else if( orb.electrons ==  6 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian(-45, 36, c_r ) );
				else if( orb.electrons ==  7 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian(-45,108, c_r ) );
				else if( orb.electrons ==  8 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian(-45,180, c_r ) );
				else if( orb.electrons ==  9 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian(-45,252, c_r ) );
				else if( orb.electrons == 10 ) Object.assign( orbital_center, JL.functions.spherical_to_cartesian(-45,324, c_r ) );
				else if( orb.electrons == 11 ) orbital_center.y =  c_r;
				else if( orb.electrons == 12 ) orbital_center.y = -c_r;
				else if( orb.electrons == 13 ){ rand_scl_y = 0.1; rad_scl = 1; orbital_center.y =  c_r / 2; }
				else if( orb.electrons == 14 ){ rand_scl_y = 0.1; rad_scl = 1; orbital_center.y = -c_r / 2; }

				rad_min = c_r * rad_scl - 0.1;
				rad_max = c_r * rad_scl;
				color_main = [ 1, 0.7, 1, 1 ];
				break;
		}

		params.attr                = { frags_vec4 : { color_main, }, rad_min, rad_max, orbital_center, rand_scl_x, rand_scl_y, rand_scl_z };
		params.per_frame_functions = [function(){
			var rand_point = JL.functions.random_point_in_sphere({
				rad_min : this.rad_min,
				rad_max : this.rad_max,
			});

			this.x = this.orbital_center.x + ( this.rand_scl_x * rand_point.x );
			this.y = this.orbital_center.y + ( this.rand_scl_y * rand_point.y );
			this.z = this.orbital_center.z + ( this.rand_scl_z * rand_point.z );

			var camera_dist = JL.functions.distance( this, JL.webgl.active_camera ) / 12;
			var s           = Math.max( ( camera_dist ), 1 );
			this.scale      = [s,s,s];
		}];

		this.add_space_object( params );
	}

	this.add_space_object({
		camera_config    : { lat : 20, rad : nucleus_rad_max * 10 },
		attr             : { radius : element.number * 2 },
		ui_elements      : [ 'chemistry_element' ],
		select           : true,
		ui_info          : { chemistry_element : element, },
	});
};
