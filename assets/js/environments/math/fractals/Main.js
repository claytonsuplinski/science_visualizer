JL.webgl.functions.init_environment( [ 'math', 'fractals' ], {
	background  : 'grid',
	lights      : [{ ambient : 0.2, color : [ 1, 1, 1 ], position : [ 100, 100, -100 ], }],
	load_groups : [ 'Shared', 'Math Fractals' ],
});

JL.webgl.environments.math.fractals.load = function(){
	var self = this;

	// var smiles = JL.webgl.hashlinks.get_val( 'item' );

	this.add_space_object({
		graphics_objects : [ JL.webgl.graphics_objects.fractal ],
		camera_config    : {
			lat : 0, lon : 180, rad : 10,
			// zoom_max : function(){ return Math.max( 20, 2 * self.fractal.size ); },
		},
		draw_xyz         : true,
		// ui_elements      : [ 'math_fractals' ],
		select           : true,
		// ui_info          : { math_fractal : { smiles, }, },
	});
};
