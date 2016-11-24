var exc = require('./exc.js');


// ported from python 3.5; see
// github.com/PythonCHB/close_pep/blob/master/is_close.py for original
// implementation
function isclose(a, b, rel_tol, abs_tol) {
    abs_tol = (abs_tol === undefined? 0.0 : abs_tol);
    rel_tol = (rel_tol === undefined? 1e-9 : rel_tol);

    if (rel_tol < 0.0 || abs_tol < 0.0) {
        throw exc.ValueError('error tolerances must be non-negative');
    }

    if (a == b) { // fast-path for exact equality
        return true;
    }
    if (!isFinite(a) || !isFinite(b)){
        return false;
    }
    var diff = Math.abs(b - a);
    return (
        (diff <= Math.abs(rel_tol * b)) ||
        (diff <= Math.abs(rel_tol * a)) ||
        (diff <= abs_tol)
        );
}

exports.isclose = isclose;