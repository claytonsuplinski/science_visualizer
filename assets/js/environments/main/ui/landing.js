JL.webgl.ui.item.landing = function( p ){
	this.init( p );
};

JL.webgl.ui.item.landing.css = `
	.ui-landing{
		position:fixed;
		top:0;
		left:0;
		width :100vw;
		height:100vh;
		background:linear-gradient( 90deg, #000, transparent 50% );
		padding:20px;
		box-sizing:border-box;
		text-align:left;
		overflow:auto;
	}

	.ui-landing .group{
		width:50%;
		font-size:12px;
		color:#ccc;
		margin-bottom:15px;
	}

	.ui-landing .group-header hr{
		border:0;
		border-top:1px solid rgba(255,255,255,0.4);
		width:100px;
		margin-left:0;
	}

	.ui-landing .jl-collapsible-fields .jl-collapsible-field{
		margin-top:0;
	}

	.ui-landing .jl-collapsible-fields .jl-collapsible-field .head{
		background:#338;
	}

	.ui-landing .jl-collapsible-fields .jl-collapsible-field a{
		background:#000;
		color:#eee;
		border:1px solid rgba(255,255,255,0.25);
		padding:2px 5px;
		cursor:pointer;
		width:100%;
		display:inline-block;
		box-sizing:border-box;
	}

	.ui-landing .jl-collapsible-fields .jl-collapsible-field a:nth-child(n+2){
		border-top-width:0;
	}

	.ui-landing .jl-collapsible-fields .jl-collapsible-field a:hover{
		background:#272;
	}
`;

JL.webgl.ui.item.landing.ui_framework = function(){
	return '<div class="ui-landing">' + 
		'<div id="landing-settings"></div>' +
		// '<div class="option" onclick="JL.webgl.functions.load_and_select_environment({ keys : [ JL.webgl.variables.options.ride ] });">Start</div>' +
	'</div>';
};

JL.webgl.ui.item.landing.ui_onselect = function(){
        var _this = JL.webgl.ui.item.landing;

        if( !JL.webgl.variables.options ) JL.webgl.variables.options = {};

	for( var g of _this.menu.contents ){
		$( '#landing-settings' ).append(
			'<div class="group">' +
				'<div class="group-header">' + g.name + '<hr></div>' +
				'<div id="landing-settings-' + JL.functions.str_to_id( g.name ) + '"></div>' +
			'</div>'
		);
	}

	for( var g of _this.menu.contents ){
		new JL.collapsible_fields({
			parent   : { id : '#landing-settings-' + JL.functions.str_to_id( g.name ) },
			contents : ( g.children || [] ).map(function( c ){
				if( !c.children ) c.children = [];

				switch( c.custom ){
					case 'molecules':
						var items = JL.functions.deep_copy( JL.chemistry.molecules );
						for( var x of items ) x.item = x.smiles;
						c.children = c.children.concat( items );
						break;
					case 'elements':
						var items = JL.functions.deep_copy( JL.chemistry.elements );
						for( var x of items ) x.item = x.name;
						c.children = c.children.concat( items );
						break;
				}

				return {
					head : c.name,
					body : c.children.map(function( c_2 ){
						var include = {
							environment : [ g.name, c.name ].map( x => JL.functions.str_to_id( x ) ).join(','),
						};
						if( c_2.item !== undefined ) include.item = c_2.item;

						return '<a href="' + JL.webgl.hashlinks.get_url({ include, }) + '">' + c_2.name + '</a>';
					}).join(''),
				};
			}),
			all_collapsed : true,
		})
	}
};
