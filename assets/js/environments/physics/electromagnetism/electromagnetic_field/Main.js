JL.webgl.functions.init_environment( [ 'physics', 'electromagnetism', 'electromagnetic_field' ], {
	background  : 'grid',
	lights      : [{ ambient : 0.2, color : [ 1, 1, 1 ], follow_camera : true, }],
	load_groups : [ 'Shared', 'Electromagnetic Field' ],
});

JL.webgl.environments.physics.electromagnetism.electromagnetic_field.load = function(){
	this.add_space_object({ graphics_objects : [ JL.webgl.graphics_objects.point_charges ], gl_filters : [{ name : 'cull_face', front : 1 }] });
	this.add_space_object({ graphics_objects : [ JL.webgl.graphics_objects.sources_names ], z_index : 10, });

	this.add_space_object({
		graphics_objects    : [ JL.webgl.graphics_objects.electromagnetic_field ],
		camera_config       : { lat : 0, lon : 180, rad : 10 },
		ui_elements         : [ 'electromagnetic_field' ],
		// ui_info             : { electromagnetic_field : {}, },
		z_index             : 5,
		select              : true,
	});
};
