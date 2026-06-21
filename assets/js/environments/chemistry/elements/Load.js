Object.assign( JL.webgl.load.groups, {
	"Chemistry Elements": {
		steps : [
			{
				init : function(callback){
					JL.webgl.load.graphics_objects_list( this, [
						{ label : [ 'proton'   ], type : 'sphere', params : { radius : 0.8, properties : { "effects" : [ "_plain" ], color : '0.3,0.2,0.6,1.0' } } },
						{ label : [ 'neutron'  ], type : 'sphere', params : { radius : 0.8, properties : { "effects" : [ "_plain" ], color : '0.5,0.5,0.5,1.0' } } },
						{ label : [ 'electron' ], type : 'sphere', params : { radius : 0.1, properties : { "effects" : [ "_plain", "_dynamic_color" ] } } },
					]);
					callback();
				}
			},
		],
		scripts : [
			"./assets/js/environments/chemistry/elements/ui/chemistry_element.js",
		]
	},
} );
