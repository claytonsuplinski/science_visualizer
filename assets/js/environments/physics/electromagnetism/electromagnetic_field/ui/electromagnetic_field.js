JL.webgl.ui.item.electromagnetic_field = function( p ){
	this.init( p );
};

JL.webgl.ui.item.electromagnetic_field.css = `
	.ui-electromagnetic_field{
		position:fixed;
		top:0;
		left:0;
		width :240px;
		height:100vh;
		background:linear-gradient( 90deg, rgba(0,0,0,0.5), transparent 75% );
		padding:5px 5px 20px;
		text-align:left;
		overflow-y:auto;
		box-sizing:border-box;
	}

	.ui-electromagnetic_field .option{
		background:#333;
		width:100px;
		margin-top :10px;
		margin-left:30px;
		padding:7px 10px;
		text-align:center;
		color:#ddd;
		border:1px solid rgba(255,255,255,0.25);
		cursor:pointer;
	}

	.ui-electromagnetic_field .option:hover{
		background:#2e5373;
	}

	.ui-electromagnetic_field .jl-json-edit td.lbl{
		width:100px;
	}

	.ui-electromagnetic_field .jl-json-edit td.val{
		padding:0;
	}

	.ui-electromagnetic_field .jl-json-edit td.val *{
		font-size:10px;
	}

	.ui-electromagnetic_field .jl-json-edit .add-value{
		padding:1px 0;
	}
`;

JL.webgl.ui.item.electromagnetic_field.update_url = function(){
	JL.webgl.hashlinks.add({ config : JL.webgl.variables.electromagnetic_field_options });
};

JL.webgl.ui.item.electromagnetic_field.ui_framework = function(){
	return '<div class="ui-electromagnetic_field no-highlight jl-mouse-ignore">' + 
		'<div id="electromagnetic_field-settings"></div>' +
		'<div class="option" onclick="JL.webgl.ui.item.electromagnetic_field.update_url();">Update</div>' +
	'</div>';
};

JL.webgl.ui.item.electromagnetic_field.ui_onselect = function(){
        if( !JL.webgl.variables.electromagnetic_field_options ){
		JL.webgl.variables.electromagnetic_field_options = JL.webgl.hashlinks.get_val( 'config' ) || {};
	}

	new JL.json_edit({
		parent    : { id : '#electromagnetic_field-settings' },
		value     : JL.webgl.variables.electromagnetic_field_options,
		structure : [
			{ key : 'cfg', label : 'Config', type : 'obj', no_label : true, structure : [
				{ key : 'rad' , label : 'Field Radius'    , type : 'float', default : 20, },
				{ key : 'spc' , label : 'Vector Spacing'  , type : 'float', default :  1, },
				{ key : 'loop', label : 'Vector Anim Loop', type : 'float', default :  5, },
			] },
			{ key : 'sources', type : 'arr', no_label : true, structure : [
				{ key : 't' , label : 'Type'            , type : 'dropdown', default_first : true, options : [ 'point_charge', 'magnetic_dipole', 'infinite_wire', ] },
				{ key : 'ch' , label : 'Charge'         , type : 'float' },
				{ key : 'pos', label : 'Position'       , type : 'arr'  , length : 3, structure : { type : 'float', default : 0, no_label : true, }, },
				// TODO : Still need to implement
				// { key : 'cur', label : 'Current'        , type : 'float', condition_obj : { t : [ 'infinite_wire'   ] }, },
				// { key : 'vel', label : 'Velocity'       , type : 'arr'  , condition_obj : { t : [ 'point_charge'    ] }, length : 3, structure : { type : 'float', default : 0, no_label : true, }, optional : 1, },
				// { key : 'dir', label : 'Direction'      , type : 'arr'  , condition_obj : { t : [ 'infinite_wire'   ] }, length : 3, structure : { type : 'float', default : 0, no_label : true, }, },
				// { key : 'mm' , label : 'Magnetic Moment', type : 'arr'  , condition_obj : { t : [ 'magnetic_dipole' ] }, length : 3, structure : { type : 'float', default : 0, no_label : true, }, },
			] },
		],
	});
};
