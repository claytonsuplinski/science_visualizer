JL.webgl.functions.init_environment( [ 'math', 'patterns', 'fractals' ], {
	background  : 'grid',
	lights      : [{ ambient : 0.2, color : [ 1, 1, 1 ], position : [ 100, 100, -100 ], }],
	load_groups : [ 'Shared', 'Math Fractals' ],
});

JL.webgl.environments.math.patterns.fractals.load = function(){
	var self = this;

	this.add_space_object({
		graphics_objects : [ JL.webgl.graphics_objects.fractal ],
		camera_config    : { lat : 0, lon : 180, rad : 10, },
		draw_xyz         : true,
		ui_elements      : [ 'math_fractals' ],
		select           : true,
	});
};
