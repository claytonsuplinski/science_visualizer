JL.webgl.ui.item.chemistry_molecule = function( p ){
	this.init( p );
};

JL.webgl.ui.item.chemistry_molecule.css = `
	.ui-chemistry-molecule{
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

	.ui-chemistry-molecule *{ color:#fff; }

	.ui-chemistry-molecule .btn,
	.ui-chemistry-molecule input,
	.ui-chemistry-molecule select{
		background:rgba(16, 16, 38, 0.85);
		border:1px solid rgba(255,255,255,0.3);
		padding:2px 5px;
		margin-right:10px;
	}

	.ui-chemistry-molecule select{
		text-align:center;

		-webkit-appearance: none;
		   -moz-appearance: none;
		        appearance: none; 
	}

	.ui-chemistry-molecule #ui-chemistry-molecule-def{
		text-align:left;
	}

	.ui-chemistry-molecule .btn{
		display:inline-block;
		border-radius:100px;
		padding:4px 15px;
		font-size:14px;
		cursor:pointer;
	}

	.ui-chemistry-molecule .btn:hover{
		background:#4551d0;
	}
`;

JL.webgl.ui.item.chemistry_molecule.update_url = function(){
	JL.webgl.hashlinks.add({ item : $( '#ui-chemistry-molecule-def' ).val() });
};

JL.webgl.ui.item.chemistry_molecule.ui_framework = function(){
	var ui_info = this.ui_info.chemistry_molecule;

	return '<div class="ui-chemistry-molecule">' + 
		'<select id="ui-chemistry-molecule-name" onchange="$(\'#ui-chemistry-molecule-def\').val( this.value ); JL.webgl.ui.item.chemistry_molecule.update_url();">' +
			'<option value="O"></option>' +
			JL.chemistry.molecules.map(function( ele ){
				return '<option ' + ( ele.smiles == ui_info.smiles ? 'selected' : '' ) + ' value="' + ele.smiles + '">' +
					ele.name +
				'</option>';
			}).join('') +
		'</select>' +
		'<input id="ui-chemistry-molecule-def"></input>' +
		'<div class="btn" onclick="JL.webgl.ui.item.chemistry_molecule.update_url();"><i class="fa fa-refresh"></i></div>' +
	'</div>';
};

JL.webgl.ui.item.chemistry_molecule.ui_onselect = function(){
        var _this = JL.webgl.ui.item.chemistry_molecule;

	var ui_info = this.ui_info.chemistry_molecule;

	if( ui_info.smiles ) $( '#ui-chemistry-molecule-def' ).val( ui_info.smiles );
	
};
