JL.webgl.ui.item.chemistry_element = function( p ){
	this.init( p );
};

JL.webgl.ui.item.chemistry_element.css = `
	.ui-chemistry-element{
		position:fixed;
		top  :0px;
		left :0px;
		width:100vw;
		background:rgba(51, 51, 136, 0.6);
		padding:5px;
		box-sizing:border-box;
		text-align:left;
		overflow:auto;
	}

	.ui-chemistry-element *{ color:#fff; }

	.ui-chemistry-element select{
		background:rgba(16, 16, 38, 0.85);
		border:1px solid rgba(255,255,255,0.3);
		padding:2px 5px;
		text-align:center;

		-webkit-appearance: none;
		   -moz-appearance: none;
		        appearance: none; 
	}

	.ui-chemistry-element .orbitals,
	.ui-chemistry-element .orbitals *{
		color:rgba(255,255,255,0.5);
		font-style:italic;
		font-size:12px;
	}

	.ui-chemistry-element .orbitals{
		display:inline-block;
		margin-left:10px;
	}
`;

JL.webgl.ui.item.chemistry_element.ui_framework = function(){
	var ui_info = this.ui_info.chemistry_element;

	return '<div class="ui-chemistry-element">' + 
		'<select id="ui-chemistry-element-name" onchange="JL.webgl.hashlinks.add({ item : this.value });">' +
			JL.chemistry.elements.map(function( ele ){
				return '<option ' + ( ele.name == ui_info.name ? 'selected' : '' ) + '>' +
					ele.name +
				'</option>';
			}).join('') +
		'</select>' +
		'<div class="orbitals">' +
			JL.chemistry.get_electron_configuration( ui_info.electrons !== undefined ? ui_info.electrons : ui_info.number ).map(function( c ){
				return c.level + c.orbital + '<sup>' + c.electrons + '</sup>';
			}).join(' ') +
		'</div>' +
	'</div>';
};
