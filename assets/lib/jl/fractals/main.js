try{ JL = JL; } catch(e){ JL = {}; }

JL.fractals = {};

JL.fractals.fern_3d = function( num_instances ){
    var fern_data = [];
    
    var x = 0, y = 0, z = 0;

    for( var i = 0; i < num_instances; i++ ){
        var next_x, next_y, next_z;
        var base_size;
        
        var r = Math.random();
        if( r < 0.01 ){
            next_x    = 0;
            next_y    = 0.16 * y;
            next_z    = 0.16 * z;
            base_size = 0.15;
        }
	else if( r < 0.86 ){
            next_x    = 0.85 * x + 0.04 * y;
            next_y    = -0.04 * x + 0.85 * y + 1.6;
            next_z    = 0.85 * z - 0.04 * x; 
            base_size = 0.1;
        }
	else if( r < 0.93 ){
            next_x    = 0.20 * x - 0.26 * y;
            next_y    = 0.23 * x + 0.22 * y + 1.6;
            next_z    = 0.22 * z + 0.10 * x + 0.2; 
            base_size = 0.05;
        }
	else{
            next_x    = -0.15 * x + 0.28 * y;
            next_y    = 0.26 * x + 0.24 * y + 0.44;
            next_z    = 0.24 * z - 0.10 * x - 0.2; 
            base_size = 0.05;
        }

        x = next_x;
        y = next_y;
        z = next_z;

        var scale_decay = Math.max( 0.01, base_size * ( 1 - ( y / 12.0 ) ) );

        if( i > 20 ){
            fern_data.push({
                pos : [
                    Number( x.toFixed(4) ), 
                    Number( y.toFixed(4) ), 
                    Number( z.toFixed(4) )
                ],
                size : Number( scale_decay.toFixed(4) ),
            });
        }
    }

    return fern_data;
};

JL.fractals.cubes_3d = function( max_depth ){ // Menger cube fractal
    var sponge_data = [];

    var build_fractal = function( x, y, z, current_size, depth ){
        if( depth === 0 ){
            sponge_data.push({
                pos : [
                    Number( x.toFixed(4) ),
                    Number( y.toFixed(4) ),
                    Number( z.toFixed(4) )
                ],
                size : Number( current_size.toFixed(4) ),
            });
            return;
        }

        var next_depth = depth - 1;
        var next_size  = current_size / 3.0;

        for( var i = 0; i < 3; i++ ){
            for( var j = 0; j < 3; j++ ){
                for( var k = 0; k < 3; k++ ){
                    var center_count = 0;
                    if( i === 1 ) center_count++;
                    if( j === 1 ) center_count++;
                    if( k === 1 ) center_count++;

                    if( center_count < 2 ){
                        var next_x = x + ( i * next_size );
                        var next_y = y + ( j * next_size );
                        var next_z = z + ( k * next_size );

                        build_fractal( next_x, next_y, next_z, next_size, next_depth );
                    }
                }
            }
        }
    };

    build_fractal( 0, 0, 0, 1.0, max_depth );

    return sponge_data;
};

JL.fractals.pyramid_3d = function( max_depth ){ // Fractal pyramid fractal
    var pyramid_data = [];

    var sqrt_3 = Math.sqrt( 3.0 );
    var sqrt_6 = Math.sqrt( 6.0 );

    var v0_x = 0;
    var v0_y = 0;
    var v0_z = sqrt_6 / 4.0;

    var v1_x = sqrt_3 / 3.0;
    var v1_y = 0;
    var v1_z = -sqrt_6 / 12.0;

    var v2_x = -sqrt_3 / 6.0;
    var v2_y = 0.5;
    var v2_z = -sqrt_6 / 12.0;

    var v3_x = -sqrt_3 / 6.0;
    var v3_y = -0.5;
    var v3_z = -sqrt_6 / 12.0;

    var build_fractal = function( x, y, z, current_size, depth ){
        if( depth === 0 ){
            pyramid_data.push({
                pos : [
                    Number( x.toFixed(4) ),
                    Number( y.toFixed(4) ),
                    Number( z.toFixed(4) )
                ],
                size : Number( current_size.toFixed(4) )
            });
            return;
        }

        var next_depth = depth - 1;
        var next_size  = current_size / 2.0;

        // The offset scalar matches the parent radius so the distance 
        // between the centers of the new children exactly equals their combined radii.
        var offset = current_size;

        var next_x_0 = x + ( v0_x * offset );
        var next_y_0 = y + ( v0_y * offset );
        var next_z_0 = z + ( v0_z * offset );

        var next_x_1 = x + ( v1_x * offset );
        var next_y_1 = y + ( v1_y * offset );
        var next_z_1 = z + ( v1_z * offset );

        var next_x_2 = x + ( v2_x * offset );
        var next_y_2 = y + ( v2_y * offset );
        var next_z_2 = z + ( v2_z * offset );

        var next_x_3 = x + ( v3_x * offset );
        var next_y_3 = y + ( v3_y * offset );
        var next_z_3 = z + ( v3_z * offset );

        build_fractal( next_x_0, next_y_0, next_z_0, next_size, next_depth );
        build_fractal( next_x_1, next_y_1, next_z_1, next_size, next_depth );
        build_fractal( next_x_2, next_y_2, next_z_2, next_size, next_depth );
        build_fractal( next_x_3, next_y_3, next_z_3, next_size, next_depth );
    };

    // Kick off the recursion from the origin with a base size of 1.0
    build_fractal( 0, 0, 0, 1.0, max_depth );

    return pyramid_data;
};

JL.fractals.mandelbulb_3d = function( resolution, max_iterations ){ // Mandelbulb fractal
    var bulb_data = [];
    
    // The classic Mandelbulb uses an 8th-order power
    var n = 8.0; 
    
    // The fractal is entirely contained within roughly -1.2 to 1.2 on all axes
    var bound = 1.2; 
    var step_size = ( bound * 2.0 ) / resolution;

    // Iterate through a solid 3D grid
    for( var i = 0; i < resolution; i++ ){
        for( var j = 0; j < resolution; j++ ){
            for( var k = 0; k < resolution; k++ ){
                
                // Calculate the exact center point of the current voxel
                var x0 = -bound + ( i * step_size ) + ( step_size / 2.0 );
                var y0 = -bound + ( j * step_size ) + ( step_size / 2.0 );
                var z0 = -bound + ( k * step_size ) + ( step_size / 2.0 );

                var x = x0;
                var y = y0;
                var z = z0;
                var is_inside = true;

                // Escape-time mathematical evaluation
                for( var iter = 0; iter < max_iterations; iter++ ){
                    var r = Math.sqrt( x * x + y * y + z * z );
                    
                    // If the vector length escapes a radius of 2, it is not part of the fractal
                    if( r > 2.0 ){
                        is_inside = false;
                        break;
                    }

                    // Convert to spherical coordinates
                    var theta = Math.acos( z / r );
                    var phi   = Math.atan2( y, x );

                    // Scale by power n
                    var rn      = Math.pow( r, n );
                    var theta_n = theta * n;
                    var phi_n   = phi * n;

                    // Convert back to Cartesian and add the constant c (x0, y0, z0)
                    x = rn * Math.sin( theta_n ) * Math.cos( phi_n ) + x0;
                    y = rn * Math.sin( theta_n ) * Math.sin( phi_n ) + y0;
                    z = rn * Math.cos( theta_n ) + z0;
                }

                // If the point never escaped, keep the solid cube
                if( is_inside ){
                    bulb_data.push({
                        pos : [
                            Number( x0.toFixed(4) ),
                            Number( y0.toFixed(4) ),
                            Number( z0.toFixed(4) )
                        ],
                        size : Number( step_size.toFixed(4) )
                    });
                }
            }
        }
    }

    return bulb_data;
};

JL.fractals.custom_blob_3d = function( resolution ){
    var data = [];
    
    var bound = 1.5; 
    var step_size = ( bound * 2.0 ) / resolution;

    // Iterate through a solid 3D grid
    for( var i = 0; i < resolution; i++ ){
        for( var j = 0; j < resolution; j++ ){
            for( var k = 0; k < resolution; k++ ){
                
                // Calculate the exact center point of the current voxel
                var x = -bound + ( i * step_size ) + ( step_size / 2.0 );
                var y = -bound + ( j * step_size ) + ( step_size / 2.0 );
                var z = -bound + ( k * step_size ) + ( step_size / 2.0 );

                var x2 = x * x;
                var y2 = y * y;
                var z2 = z * z;

                // 1. Base Ellipsoid (Elongated along the Y-axis)
                var distance = ( x2 / 0.8 ) + ( y2 / 1.5 ) + ( z2 / 1.0 );

                // 2. Longitudinal Fissure (Dips the threshold heavily near x = 0)
                var fissure_depth = 0.5;
                var fissure_width = 15.0;
                var fissure = 1.0 - fissure_depth * Math.exp( -fissure_width * x2 );

                // 3. Fractal Cortical Folding (Gyri and Sulci)
                var freq = 10.0;
                var amp  = 0.15;
                
                // Base folds
                var folds = Math.sin( freq * x ) * Math.sin( freq * y ) * Math.sin( freq * z );
                
                // Second fractal octave (double frequency, half amplitude)
                folds += 0.5 * ( Math.sin( freq * 2.0 * x ) * Math.sin( freq * 2.0 * y ) * Math.sin( freq * 2.0 * z ) );

                if( distance < ( fissure + ( folds * amp ) ) ){
                    data.push({
                        pos : [
                            Number( x.toFixed(4) ),
                            Number( y.toFixed(4) ),
                            Number( z.toFixed(4) )
                        ],
                        size : Number( step_size.toFixed(4) )
                    });
                }
            }
        }
    }

    return data;
};
