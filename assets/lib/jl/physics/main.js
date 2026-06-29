try{ JL = JL; } catch(e){ JL = {}; }

JL.physics = {
	constants : {
		coulombs_constant   : 8987551784.952723,
		vacuum_permeability : 0.0000012566370614359173, // (T*m/A)
	},
};

JL.physics.calculate_electromagnetic_field = function( target_point, sources ){
	var total_E = [ 0, 0, 0 ]; // Electric Field in V/m
	var total_B = [ 0, 0, 0 ]; // Magnetic Field in Tesla

	var color_E     = [ 0, 0, 0 ];
	var color_E_mag = 0;

	for( var source of sources ){
		var r_vec = JL.functions.vector_subtract( target_point, source.pos );
		var r     = JL.functions.get_magnitude( r_vec );

		if( r === 0 ) break; 

		var r_hat = JL.functions.normalize( r_vec );

		// 2026-06-27 -- Only point_charge has been tested so far. Not sure if the rest are accurate.
		switch( source.t ){
			case 'point_charge':
				// Coulomb's Law for Electric Field: E = k * q / r^2 * r_hat
				var e_mag = ( JL.physics.constants.coulombs_constant * source.ch) / (r * r);
				var e_field = JL.functions.scalar_multiply( e_mag, r_hat );
				total_E = JL.functions.vector_add( total_E, e_field );

				var color = source.color || ( source.ch > 0 ? [1,0,0] : [0,0,1] );

				var col_mag = Math.abs( e_mag );

				color_E      = JL.functions.vector_add( color_E, JL.functions.scalar_multiply( col_mag, color ) );
				color_E_mag += col_mag;

				// If the charge is moving, it also creates a B-field (Biot-Savart for a moving point charge)
				if( source.vel ){
					// B = (mu_0 / 4pi) * (q * v x r_hat) / r^2
					var v_cross_r = JL.functions.cross_product( source.vel, r_hat );
					var b_mag_const = ( source.ch * 1e-7 ) / (r * r);
					var b_field = JL.functions.scalar_multiply( b_mag_const, v_cross_r );
					total_B = JL.functions.vector_add( total_B, b_field );
				}
			break;

			case 'magnetic_dipole':
				// Approximation for a bar magnet or small current loop
				// B = (mu_0 / 4pi) * (3(m dot r_hat)r_hat - m) / r^3
				var m = source.mm; // Vector {x, y, z}
				var m_dot_rhat = JL.functions.dot_product( m, r_hat );

				var term1 = JL.functions.scalar_multiply( 3 * m_dot_rhat, r_hat );
				var term2 = JL.functions.vector_subtract( term1, m );

				var b_field_dipole = JL.functions.scalar_multiply( 1e-7 / (r * r * r), term2 );
				total_B = JL.functions.vector_add( total_B, b_field_dipole );
				break;

			case 'infinite_wire':
				// Ampere's Law for a long straight wire
				// B = (mu_0 * I) / (2 * pi * d) wrapping around the wire
				// Note: 'direction' must be a normalized vector. 'position' is a point on the wire.
				var wire_dir = JL.functions.normalize( source.dir );

				// Vector from wire to target
				var w_to_target = JL.functions.vector_subtract( target_point, source.pos );

				// Find the closest distance vector from the wire to the target
				var projection_length = JL.functions.dot_product( w_to_target, wire_dir );
				var projection_vec = JL.functions.scalar_multiply( projection_length, wire_dir );
				var d_vec = JL.functions.vector_subtract( w_to_target, projection_vec ); // Perpendicular vector
				var d = JL.functions.get_magnitude( d_vec );

				if( d > 0 ){
					var d_hat = JL.functions.normalize( d_vec );
					// B-field direction is cross product of wire direction and perpendicular vector
					var b_hat = JL.functions.cross_product( wire_dir, d_hat );
					var b_mag_wire = ( JL.physics.constants.vacuum_permeability * source.cur ) / ( 2 * Math.PI * d );

					var b_field_wire = JL.functions.scalar_multiply( b_mag_wire, b_hat );
					total_B = JL.functions.vector_add( total_B, b_field_wire );
				}
				break;
		}
	}

	return { E: total_E, B: total_B, color_E : JL.functions.scalar_multiply( 1 / color_E_mag, color_E ), };
}

JL.physics.elementary_particles = [
	{ name : "Up Quark"         , symbol : "u"  , type : "quark"       , charge :  0.66, mass : 2.16    , gen : 1 },
	{ name : "Down Quark"       , symbol : "d"  , type : "quark"       , charge : -0.33, mass : 4.67    , gen : 1 },
	{ name : "Charm Quark"      , symbol : "c"  , type : "quark"       , charge :  0.66, mass : 1270    , gen : 2 },
	{ name : "Strange Quark"    , symbol : "s"  , type : "quark"       , charge : -0.33, mass : 93      , gen : 2 },
	{ name : "Top Quark"        , symbol : "t"  , type : "quark"       , charge :  0.66, mass : 172760  , gen : 3 },
	{ name : "Bottom Quark"     , symbol : "b"  , type : "quark"       , charge : -0.33, mass : 4180    , gen : 3 },
	{ name : "Electron"         , symbol : "e^-", type : "lepton"      , charge : -1.0 , mass : 0.511   , gen : 1 },
	{ name : "Electron Neutrino", symbol : "ν_e", type : "lepton"      , charge :  0.0 , mass : 0.000002, gen : 1 },
	{ name : "Muon"             , symbol : "μ^-", type : "lepton"      , charge : -1.0 , mass : 105.7   , gen : 2 },
	{ name : "Muon Neutrino"    , symbol : "ν_μ", type : "lepton"      , charge :  0.0 , mass : 0.00019 , gen : 2 },
	{ name : "Tau"              , symbol : "τ^-", type : "lepton"      , charge : -1.0 , mass : 1776.86 , gen : 3 },
	{ name : "Tau Neutrino"     , symbol : "ντ" , type : "lepton"      , charge :  0.0 , mass : 0.0182  , gen : 3 },
	{ name : "Photon"           , symbol : "γ"  , type : "gauge boson" , charge :  0.0 , mass : 0.0     },
	{ name : "W Boson"          , symbol : "W^±", type : "gauge boson" , charge :  1.0 , mass : 80379   },
	{ name : "Z Boson"          , symbol : "Z^0", type : "gauge boson" , charge :  0.0 , mass : 91187.6 },
	{ name : "Gluon"            , symbol : "g"  , type : "gauge boson" , charge :  0.0 , mass : 0.0     },
	{ name : "Higgs Boson"      , symbol : "H^0", type : "scalar boson", charge :  0.0 , mass : 125250  },
];

JL.physics.composite_particles = [
	// Baryons
	{ name : "proton"           , symbols : [ "p", "p+", "N+"      ], quarks : [ "u", "u", "d" ], decays : [] },
	{ name : "neutron"          , symbols : [ "n", "n0", "N0"      ], quarks : [ "u", "d", "d" ], decays : [{ prob : 1, particles : [ "p+", "e-", "νe" ] }] },
	{ name : "lambda"           , symbols : [ "Λ0"                 ], quarks : [ "u", "d", "s" ], decays : [{ prob : 0.639, particles : [ "p+", "π-" ] }, { prob : 0.358, particles : [ "n0", "π0" ] }] },
	{ name : "charmed lambda"   , symbols : [ "Λ+c"                ], quarks : [ "u", "d", "c" ], decays : [{ particles : [ "various (see Λ+c decay modes)" ] }] },
	{ name : "bottom lambda"    , symbols : [ "Λ0b"                ], quarks : [ "u", "d", "b" ], decays : [{ particles : [ "various (see Λ0b decay modes)" ] }] },
	{ name : "sigma"            , symbols : [ "Σ+"                 ], quarks : [ "u", "u", "s" ], decays : [{ prob : 0.5157, particles : [ "p+", "π0" ] }, { prob : 0.4831, particles : [ "n0", "π+" ] }] },
	{ name : "sigma"            , symbols : [ "Σ0"                 ], quarks : [ "u", "d", "s" ], decays : [{ prob : 1, particles : [ "Λ0", "γ" ] }] },
	{ name : "sigma"            , symbols : [ "Σ-"                 ], quarks : [ "d", "d", "s" ], decays : [{ prob : 1, particles : [ "n0", "π-" ] }] },
	{ name : "charmed sigma"    , symbols : [ "Σ++c(2455)"         ], quarks : [ "u", "u", "c" ], decays : [{ prob : 1, particles : [ "Λ+c", "π+" ] }] },
	{ name : "charmed sigma"    , symbols : [ "Σ+c(2455)"          ], quarks : [ "u", "d", "c" ], decays : [{ prob : 1, particles : [ "Λ+c", "π0" ] }] },
	{ name : "charmed sigma"    , symbols : [ "Σ0c(2455)"          ], quarks : [ "d", "d", "c" ], decays : [{ prob : 1, particles : [ "Λ+c", "π-" ] }] },
	{ name : "bottom sigma"     , symbols : [ "Σ+b"                ], quarks : [ "u", "u", "b" ], decays : [{ prob : 1, particles : [ "Λ0b", "π+" ] }] },
	{ name : "bottom sigma"     , symbols : [ "Σ0b"                ], quarks : [ "u", "d", "b" ], decays : [{ particles : [ "unknown" ] }] },
	{ name : "bottom sigma"     , symbols : [ "Σ-b"                ], quarks : [ "d", "d", "b" ], decays : [{ prob : 1, particles : [ "Λ0b", "π-" ] }] },
	{ name : "xi"               , symbols : [ "Ξ0"                 ], quarks : [ "u", "s", "s" ], decays : [{ prob : 0.995, particles : [ "Λ0", "π0" ] }] },
	{ name : "xi"               , symbols : [ "Ξ-"                 ], quarks : [ "d", "s", "s" ], decays : [{ prob : 0.998, particles : [ "Λ0", "π-" ] }] },
	{ name : "charmed xi"       , symbols : [ "Ξ+c"                ], quarks : [ "u", "s", "c" ], decays : [{ particles : [ "various (see Ξ+c decay modes)" ] }] },
	{ name : "charmed xi"       , symbols : [ "Ξ0c"                ], quarks : [ "d", "s", "c" ], decays : [{ particles : [ "various (see Ξ0c decay modes)" ] }] },
	{ name : "charmed xi prime" , symbols : [ "Ξ′+c"               ], quarks : [ "u", "s", "c" ], decays : [{ particles : [ "Ξ+c", "γ" ] }] },
	{ name : "charmed xi prime" , symbols : [ "Ξ′0c"               ], quarks : [ "d", "s", "c" ], decays : [{ particles : [ "Ξ0c", "γ" ] }] },
	{ name : "double charmed xi", symbols : [ "Ξ++cc"              ], quarks : [ "u", "c", "c" ], decays : [{ particles : [ "various (see Ξ++cc decay modes)" ] }] },
	{ name : "double charmed xi", symbols : [ "Ξ+cc"               ], quarks : [ "d", "c", "c" ], decays : [{ particles : [ "Λ+c", "K-", "π+" ] }] },
	{ name : "bottom xi"        , symbols : [ "Ξ0b"                ], quarks : [ "u", "s", "b" ], decays : [{ particles : [ "various (see Ξ0b decay modes)" ] }] },
	{ name : "bottom xi"        , symbols : [ "Ξ-b"                ], quarks : [ "d", "s", "b" ], decays : [{ particles : [ "various (see Ξ-b decay modes)" ] }] },
	{ name : "charmed omega"    , symbols : [ "Ω0c"                ], quarks : [ "s", "s", "c" ], decays : [{ particles : [ "various (see Ω0c decay modes)" ] }] },
	{ name : "bottom omega"     , symbols : [ "Ω-b"                ], quarks : [ "s", "s", "b" ], decays : [{ particles : [ "Ω-", "J/ψ" ] }] },
	{ name : "delta"            , symbols : [ "Δ++(1232)"          ], quarks : [ "u", "u", "u" ], decays : [{ prob : 1, particles : [ "p+", "π+" ] }] },
	{ name : "delta"            , symbols : [ "Δ+(1232)"           ], quarks : [ "u", "u", "d" ], decays : [{ prob : 0.66, particles : [ "p+", "π0" ] }, { prob : 0.33, particles : [ "n0", "π+" ] }] },
	{ name : "delta"            , symbols : [ "Δ0(1232)"           ], quarks : [ "u", "d", "d" ], decays : [{ prob : 0.66, particles : [ "n0", "π0" ] }, { prob : 0.33, particles : [ "p+", "π-" ] }] },
	{ name : "delta"            , symbols : [ "Δ-(1232)"           ], quarks : [ "d", "d", "d" ], decays : [{ prob : 1, particles : [ "n0", "π-" ] }] },
	{ name : "sigma"            , symbols : [ "Σ∗+(1385)"          ], quarks : [ "u", "u", "s" ], decays : [{ prob : 0.87, particles : [ "Λ0", "π+" ] }, { prob :  "5.8%", particles : [ "Σ+", "π0" ] }, { prob :  "5.8%", particles : [ "Σ0", "π+" ] }] },
	{ name : "sigma"            , symbols : [ "Σ∗0(1385)"          ], quarks : [ "u", "d", "s" ], decays : [{ prob : 0.87, particles : [ "Λ0", "π0" ] }, { particles : [ "Σ+", "π-" ] }, { particles : [ "Σ0", "π0" ] }] },
	{ name : "sigma"            , symbols : [ "Σ∗-(1385)"          ], quarks : [ "d", "d", "s" ], decays : [{ prob : 0.87, particles : [ "Λ0", "π-" ] }, { particles : [ "Σ0", "π-" ] }, { particles : [ "Σ-", "π0" ] }] },
	{ name : "xi"               , symbols : [ "Ξ∗0(1530)"          ], quarks : [ "u", "s", "s" ], decays : [{ prob : 0.667, particles : [ "Ξ0", "π0" ] }, { prob : 0.333, particles : [ "Ξ-", "π+" ] }] },
	{ name : "xi"               , symbols : [ "Ξ∗-(1530)"          ], quarks : [ "d", "s", "s" ], decays : [{ particles : [ "Ξ0", "π-" ] }, { particles : [ "Ξ-", "π0" ] }] },
	{ name : "omega"            , symbols : [ "Ω-"                 ], quarks : [ "s", "s", "s" ], decays : [{ prob : 0.678, particles : [ "Λ0", "K-" ] }, { prob : 0.236, particles : [ "Ξ0", "π-" ] }, { prob :  "8.6%", particles : [ "Ξ-", "π0" ] }] },
	// Mesons
	{ name : "Pion"             , symbols : [ "π+", "π-"           ], quarks : [ "u", "d"      ], decays : [{ prob : 1, particles : [ "μ+", "νμ" ] }] },
	{ name : "Pion"             , symbols : [ "π0"                 ], quarks : [ "u", "u"      ], decays : [{ prob : 0.988, particles : [ "γ", "γ" ] }] },
	{ name : "Pion"             , symbols : [ "π0"                 ], quarks : [ "d", "d"      ], decays : [{ prob : 0.988, particles : [ "γ", "γ" ] }] },
	{ name : "Eta meson"        , symbols : [ "η"                  ], quarks : [ "u", "u"      ], decays : [{ prob : 0.394, particles : [ "γ", "γ" ] }, { prob : 0.326, particles : [ "π0", "π0", "π0" ] }, { prob : 0.229, particles : [ "π+", "π0", "π-" ] }] },
	{ name : "Eta meson"        , symbols : [ "η"                  ], quarks : [ "d", "d"      ], decays : [{ prob : 0.394, particles : [ "γ", "γ" ] }, { prob : 0.326, particles : [ "π0", "π0", "π0" ] }, { prob : 0.229, particles : [ "π+", "π0", "π-" ] }] },
	{ name : "Eta meson"        , symbols : [ "η"                  ], quarks : [ "s", "s"      ], decays : [{ prob : 0.394, particles : [ "γ", "γ" ] }, { prob : 0.326, particles : [ "π0", "π0", "π0" ] }, { prob : 0.229, particles : [ "π+", "π0", "π-" ] }] },
	{ name : "Eta prime meson"  , symbols : [ "η′(958)"            ], quarks : [ "u", "u"      ], decays : [{ prob : 0.425, particles : [ "π+", "π-", "η" ] }, { prob : 0.295, particles : [ "ρ0", "γ", "or", "π+", "π-", "γ" ] }, { prob : 0.228, particles : [ "π0", "π0", "η" ] }] },
	{ name : "Eta prime meson"  , symbols : [ "η′(958)"            ], quarks : [ "d", "d"      ], decays : [{ prob : 0.425, particles : [ "π+", "π-", "η" ] }, { prob : 0.295, particles : [ "ρ0", "γ", "or", "π+", "π-", "γ" ] }, { prob : 0.228, particles : [ "π0", "π0", "η" ] }] },
	{ name : "Eta prime meson"  , symbols : [ "η′(958)"            ], quarks : [ "s", "s"      ], decays : [{ prob : 0.425, particles : [ "π+", "π-", "η" ] }, { prob : 0.295, particles : [ "ρ0", "γ", "or", "π+", "π-", "γ" ] }, { prob : 0.228, particles : [ "π0", "π0", "η" ] }] },
	{ name : "Charmed eta meson", symbols : [ "ηc(1S)"             ], quarks : [ "c", "c"      ], decays : [{ particles : [ "various (see ηc decay modes)" ] }] },
	{ name : "Bottom eta meson" , symbols : [ "ηb(1S)"             ], quarks : [ "b", "b"      ], decays : [{ particles : [ "various (see ηb decay modes)" ] }] },
	{ name : "Kaon"             , symbols : [ "K+", "K-"           ], quarks : [ "u", "s"      ], decays : [{ prob : 0.636, particles : [ "μ+", "νμ" ] }, { prob : 0.207, particles : [ "π+", "π0" ] }, { prob :  "5.6%", particles : [ "π+", "π+", "π-" ] }] },
	{ name : "Kaon"             , symbols : [ "K0"                 ], quarks : [ "d", "s"      ], decays : [{ particles : [ "decays as K0S or K0L" ] }] },
	{ name : "K-Short"          , symbols : [ "K0S"                ], quarks : [ "d", "s"      ], decays : [{ prob : 0.692, particles : [ "π+", "π-" ] }, { prob : 0.307, particles : [ "π0", "π0" ] }] },
	{ name : "K-Short"          , symbols : [ "K0S"                ], quarks : [ "s", "d"      ], decays : [{ prob : 0.692, particles : [ "π+", "π-" ] }, { prob : 0.307, particles : [ "π0", "π0" ] }] },
	{ name : "K-Long"           , symbols : [ "K0L"                ], quarks : [ "d", "s"      ], decays : [{ prob : 0.406, particles : [ "π±", "e∓", "νe" ] }, { prob : 0.27, particles : [ "π±", "μ∓", "νμ" ] }, { prob : 0.195, particles : [ "π0", "π0", "π0" ] }, { prob : 0.125, particles : [ "π+", "π0", "π-" ] }] },
	{ name : "K-Long"           , symbols : [ "K0L"                ], quarks : [ "s", "d"      ], decays : [{ prob : 0.406, particles : [ "π±", "e∓", "νe" ] }, { prob : 0.27, particles : [ "π±", "μ∓", "νμ" ] }, { prob : 0.195, particles : [ "π0", "π0", "π0" ] }, { prob : 0.125, particles : [ "π+", "π0", "π-" ] }] },
	{ name : "D meson"          , symbols : [ "D+", "D-"           ], quarks : [ "c", "d"      ], decays : [{ particles : [ "various (see D+ decay modes)" ] }] },
	{ name : "D meson"          , symbols : [ "D0"                 ], quarks : [ "c", "u"      ], decays : [{ particles : [ "various (see D0 decay modes)" ] }] },
	{ name : "strange D meson"  , symbols : [ "D+s", "D-s"         ], quarks : [ "c", "s"      ], decays : [{ particles : [ "various (see D+s decay modes)" ] }] },
	{ name : "B meson"          , symbols : [ "B+", "B-"           ], quarks : [ "u", "b"      ], decays : [{ particles : [ "various (see B+ decay modes)" ] }] },
	{ name : "B meson"          , symbols : [ "B0"                 ], quarks : [ "d", "b"      ], decays : [{ particles : [ "various (see B0 decay modes)" ] }] },
	{ name : "Strange B meson"  , symbols : [ "B0s"                ], quarks : [ "s", "b"      ], decays : [{ particles : [ "various (see B0s decay modes)" ] }] },
	{ name : "Charmed B meson"  , symbols : [ "B+c", "B-c"         ], quarks : [ "c", "b"      ], decays : [{ particles : [ "various (see B+c decay modes)" ] }] },
	{ name : "Charged rho meson", symbols : [ "ρ+(770)", "ρ-(770)" ], quarks : [ "u", "d"      ], decays : [{ prob : 1, particles : [ "π+", "π0" ] }] },
	{ name : "Neutral rho meson", symbols : [ "ρ0(770)"            ], quarks : [ "u", "u"      ], decays : [{ prob : 1, particles : [ "π+", "π-" ] }] },
	{ name : "Neutral rho meson", symbols : [ "ρ0(770)"            ], quarks : [ "d", "d"      ], decays : [{ prob : 1, particles : [ "π+", "π-" ] }] },
	{ name : "Omega meson"      , symbols : [ "ω(782)"             ], quarks : [ "u", "u"      ], decays : [{ prob : 0.893, particles : [ "π+", "π0", "π-" ] }, { prob :  "8.3%", particles : [ "π0", "γ" ] }] },
	{ name : "Omega meson"      , symbols : [ "ω(782)"             ], quarks : [ "d", "d"      ], decays : [{ prob : 0.893, particles : [ "π+", "π0", "π-" ] }, { prob :  "8.3%", particles : [ "π0", "γ" ] }] },
	{ name : "Phi meson"        , symbols : [ "ϕ(1020)"            ], quarks : [ "s", "s"      ], decays : [{ prob : 0.492, particles : [ "K+", "K-" ] }, { prob : 0.34, particles : [ "K0S", "K0L" ] }, { prob : 0.153, particles : [ "π+", "π0", "π-", "or", "ρ", "π" ] }] },
	{ name : "J/psi meson"      , symbols : [ "J/ψ(1S)"            ], quarks : [ "c", "c"      ], decays : [{ prob : 0.877, particles : [ "hadrons" ] }, { prob :  "5.9%", particles : [ "e+", "e-" ] }, { prob :  "5.9%", particles : [ "μ+", "μ-" ] }] },
	{ name : "Upsilon meson"    , symbols : [ "ϒ(1S)"              ], quarks : [ "b", "b"      ], decays : [{ prob : 0.026, particles : [ "τ+", "τ-" ] }, { prob : 0.023, particles : [ "e+", "e-" ] }, { prob : 0.024, particles : [ "μ+", "μ-" ] }, { prob : 0.927, particles : [ "various hadrons" ] }] },
];
