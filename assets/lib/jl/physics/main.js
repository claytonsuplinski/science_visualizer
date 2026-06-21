try{ JL = JL; } catch(e){ JL = {}; }

JL.physics = {};

/**
 * Constants for Electromagnetic calculations (in SI units)
 */
const PHYSICS = {
    EPSILON_0: 8.85418782e-12, // Vacuum permittivity (F/m)
    MU_0: 4 * Math.PI * 1e-7,  // Vacuum permeability (T*m/A)
    get K() { return 1 / (4 * Math.PI * this.EPSILON_0); }, // Coulomb's constant
    get K_MAG() { return this.MU_0 / (4 * Math.PI); }       // Magnetic constant
};

/**
 * Basic 3D Vector Math utility
 */
const Vec3 = {
    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
    scale: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
    dot: (a, b) => (a.x * b.x + a.y * b.y + a.z * b.z),
    cross: (a, b) => ({
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    }),
    mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
    normalize: (v) => {
        const m = Vec3.mag(v);
        return m === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / m, y: v.y / m, z: v.z / m };
    }
};

JL.physics.calculate_electromagnetic_field = function( targetPoint, sources ){
    let total_E = { x: 0, y: 0, z: 0 }; // Electric Field in V/m
    let total_B = { x: 0, y: 0, z: 0 }; // Magnetic Field in Tesla

    sources.forEach(source => {
        // Vector from source to target point
        const r_vec = Vec3.sub(targetPoint, source.position);
        const r = Vec3.mag(r_vec);
        
        // Skip if we are exactly on top of the source to avoid division by zero
        if (r === 0) return; 

        const r_hat = Vec3.normalize(r_vec);

        switch (source.type) {
            case 'point_charge':
                // Coulomb's Law for Electric Field: E = k * q / r^2 * r_hat
                const eMag = (PHYSICS.K * source.charge) / (r * r);
                const eField = Vec3.scale(r_hat, eMag);
                total_E = Vec3.add(total_E, eField);
                
                // If the charge is moving, it also creates a B-field (Biot-Savart for a moving point charge)
                if (source.velocity) {
                    // B = (mu_0 / 4pi) * (q * v x r_hat) / r^2
                    const v_cross_r = Vec3.cross(source.velocity, r_hat);
                    const bMagConst = (PHYSICS.K_MAG * source.charge) / (r * r);
                    const bField = Vec3.scale(v_cross_r, bMagConst);
                    total_B = Vec3.add(total_B, bField);
                }
                break;

            case 'magnetic_dipole':
                // Approximation for a bar magnet or small current loop
                // B = (mu_0 / 4pi) * (3(m dot r_hat)r_hat - m) / r^3
                const m = source.magneticMoment; // Vector {x, y, z}
                const m_dot_rhat = Vec3.dot(m, r_hat);
                
                const term1 = Vec3.scale(r_hat, 3 * m_dot_rhat);
                const term2 = Vec3.sub(term1, m);
                
                const bFieldDipole = Vec3.scale(term2, PHYSICS.K_MAG / (r * r * r));
                total_B = Vec3.add(total_B, bFieldDipole);
                break;

            case 'infinite_wire':
                // Ampere's Law for a long straight wire
                // B = (mu_0 * I) / (2 * pi * d) wrapping around the wire
                // Note: 'direction' must be a normalized vector. 'position' is a point on the wire.
                const wireDir = Vec3.normalize(source.direction);
                
                // Vector from wire to target
                const wToTarget = Vec3.sub(targetPoint, source.position);
                
                // Find the closest distance vector from the wire to the target
                const projectionLength = Vec3.dot(wToTarget, wireDir);
                const projectionVec = Vec3.scale(wireDir, projectionLength);
                const d_vec = Vec3.sub(wToTarget, projectionVec); // Perpendicular vector
                const d = Vec3.mag(d_vec);

                if (d > 0) {
                    const d_hat = Vec3.normalize(d_vec);
                    // B-field direction is cross product of wire direction and perpendicular vector
                    const b_hat = Vec3.cross(wireDir, d_hat);
                    const bMagWire = (PHYSICS.MU_0 * source.current) / (2 * Math.PI * d);
                    
                    const bFieldWire = Vec3.scale(b_hat, bMagWire);
                    total_B = Vec3.add(total_B, bFieldWire);
                }
                break;
                
            default:
                console.warn(`Unknown source type: ${source.type}`);
        }
    });

    return { E: total_E, B: total_B };
}

setTimeout(function(){
	// Electric Field in (V/m)
	// Magnetic Field in (T)
	console.log( JSON.stringify(
		JL.physics.calculate_electromagnetic_field(
			{ x: 0, y: 0.5, z: 0 },
			[
			    {
				// A stationary point charge (e.g., an electron)
				type: 'point_charge',
				position: { x: 0, y: 0, z: 0 },
				charge: -1.602e-19 // Coulombs
			    },
			    {
				// A moving proton
				type: 'point_charge',
				position: { x: 1, y: 0, z: 0 },
				charge: 1.602e-19,
				velocity: { x: 0, y: 1000, z: 0 } // m/s
			    },
			    {
				// A permanent magnet modeled as a dipole
				type: 'magnetic_dipole',
				position: { x: -1, y: 0, z: 0 },
				magneticMoment: { x: 0, y: 0.1, z: 0 } // A*m^2
			    },
			    {
				// A straight wire/inductor approximation
				type: 'infinite_wire',
				position: { x: 0, y: 0, z: -1 }, // Any point the wire passes through
				direction: { x: 1, y: 0, z: 0 }, // Wire runs along the X axis
				current: 5 // Amperes
			    }
			],
		)
	) );
}, 1000 );
