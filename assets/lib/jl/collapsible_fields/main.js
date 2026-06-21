try{ JL = JL; } catch(e){ JL = {}; }

JL.collapsible_fields = function( p ){
	var self = this;

	if( JL.collapsible_fields.add_css ) JL.collapsible_fields.add_css();

	this.contents = p.contents;

	this.contents.forEach(function( c, i ){ c.index = i; });

	if( p.all_collapsed ){
		for( var c of this.contents ) c.collapsed = true;
	}

	this.set_parent({ id : 'body' });

	[ 'parent' ].forEach(function( k ){
		if( p[ k ] ) this[ 'set_' + k ]( p[ k ] );
	}, this);

	this.html_element = $( '<div class="jl-collapsible-fields"></div>' );

	this.html_element.data( 'self', this );

	$( this.parent.id ).html( this.html_element );

	this.draw();
};

JL.collapsible_fields.add_css = function(){
	JL.functions.add_css(`
		.jl-collapsible-fields .jl-collapsible-field{
			margin-top:5px;
		}

		.jl-collapsible-fields .jl-collapsible-field:nth-child(1){
			margin-top:0;
		}

		.jl-collapsible-fields .jl-collapsible-field .head,
		.jl-collapsible-fields .jl-collapsible-field .body{
			border:1px solid #666;
			text-align:left;
		}

		.jl-collapsible-fields .jl-collapsible-field .head{
			background:#000;
			padding:3px 6px;
			cursor:pointer;
		}

		.jl-collapsible-fields .jl-collapsible-field i{
			margin-right:2px;
			font-size:12px;
		}

		.jl-collapsible-fields .jl-collapsible-field .body{
			background:#222;
			border-top:0;
			padding:6px;
		}

		.jl-collapsible-fields .jl-collapsible-field .body.collapsed{
			display:none;
		}
	`);

	delete this.add_css;
}

JL.collapsible_fields.prototype.set_parent = function( parent ){
	this.parent = parent;

	this.root_id = this.parent.id + ' .jl-collapsible-fields';

	this.self_str = '$( $( \'' + this.root_id + '\' )[0] ).data( \'self\' )';
};

JL.collapsible_fields.prototype.expand_all = function(){
	for( var c of this.contents ) c.collapsed = false;
	this.draw();
};

JL.collapsible_fields.prototype.collapse_all = function(){
	for( var c of this.contents ) c.collapsed = true;
	this.draw();
};

JL.collapsible_fields.prototype.toggle_field = function( entry_idx ){
	this.contents[ entry_idx ].collapsed = !this.contents[ entry_idx ].collapsed;

	$( this.root_id + ' .field-' + entry_idx ).html( this.get_field_html( this.contents[ entry_idx ] ) );
};

JL.collapsible_fields.prototype.get_field_html = function( entry ){
	return '<div class="head noselect" onclick="' + this.self_str + '.toggle_field(' + entry.index + ');">' + 
		'<i class="fa fa-' + ( entry.collapsed ? 'plus' : 'minus' ) + '"></i> ' + 
		entry.head + 
	'</div>' +
	'<div class="body ' + ( entry.collapsed ? 'collapsed' : '' ) + '">' + 
		entry.body + 
	'</div>';
};

JL.collapsible_fields.prototype.draw = function(){
	var self = this;

	this.html_element.html(
		this.contents.map(function( entry ){
			return '<div class="jl-collapsible-field field-' + entry.index + '">' + 
				self.get_field_html( entry ) +
			'</div>';
		}).join('')
	);
};

/*
-----------------
| Example Usage |
-----------------

new JL.collapsible_fields({
	parent   : { id : '#collapsible_fields-prompt-here' },
	contents : [
		{ "head" : "Header 1", "body" : "Body 1" },
		{ "head" : "Header 2", "body" : "Body 2", "collapsed" : 1 },
		{ "head" : "Header 3", "body" : "Body 3" },
	],
	all_collapsed : true,
})
*/
