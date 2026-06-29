JL.webgl.functions.init_environment( [ 'chemistry', 'molecules' ], {
	background  : 'grid',
	lights      : [{ ambient : 0.1, color : [ 0.8, 0.8, 0.8 ], follow_camera : true, }],
	load_groups : [ 'Shared', 'Chemistry Molecules' ],
});

JL.webgl.environments.chemistry.molecules.load = function(){
	var self = this;

	var smiles = JL.webgl.hashlinks.get_val( 'item' );

	for( var bond of this.molecule.bonds ){
		var a1 = this.molecule.atoms[ bond.from - 1 ];
		var a2 = this.molecule.atoms[ bond.to   - 1 ];

		var dir = JL.functions.scalar_multiply( 0.25, JL.functions.normalize([
			a2.x - a1.x,
			a2.y - a1.y,
			a2.z - a1.z,
		]) );

		var start = { x : a1.x + dir[0], y : a1.y + dir[1], z : a1.z + dir[2], };
		var end   = { x : a2.x - dir[0], y : a2.y - dir[1], z : a2.z - dir[2], };

		var g_o = undefined;
		switch( bond.order ){
			case 2 : g_o = JL.webgl.graphics_objects.   double_bond; break;
			case 3 : g_o = JL.webgl.graphics_objects.   triple_bond; break;
			case 4 : g_o = JL.webgl.graphics_objects.quadruple_bond; break;
		}
		this.add_space_object({ start, end, line_width : 0.01, g_o, }, JL.webgl.space_object._line );
	}

	this.add_space_object({
		graphics_objects : [ JL.webgl.graphics_objects.atom_names ],
		z_index          : 1,
	});

	this.add_space_object({
		graphics_objects    : [ JL.webgl.graphics_objects.molecule ],
		camera_config       : {
			lat : 0, lon : 180,
			rad      : Math.max( 10,  1.5 * this.molecule.size ),
			zoom_max : function(){ return Math.max( 20, 2 * self.molecule.size ); },
		},
		draw_xyz            : true,
		gl_filters          : [{ name : 'cull_face', front : true, }],
		ui_elements         : [ 'chemistry_molecule' ],
		select              : true,
		ui_info             : { chemistry_molecule : { smiles, }, },
	});
};
