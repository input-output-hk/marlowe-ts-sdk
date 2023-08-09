var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var TaskEither = {};

var Applicative = {};

var Apply = {};

var _function = {};

(function (exports) {
	var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dual = exports.getEndomorphismMonoid = exports.not = exports.SK = exports.hole = exports.pipe = exports.untupled = exports.tupled = exports.absurd = exports.decrement = exports.increment = exports.tuple = exports.flow = exports.flip = exports.constVoid = exports.constUndefined = exports.constNull = exports.constFalse = exports.constTrue = exports.constant = exports.unsafeCoerce = exports.identity = exports.apply = exports.getRing = exports.getSemiring = exports.getMonoid = exports.getSemigroup = exports.getBooleanAlgebra = void 0;
	// -------------------------------------------------------------------------------------
	// instances
	// -------------------------------------------------------------------------------------
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	var getBooleanAlgebra = function (B) {
	    return function () { return ({
	        meet: function (x, y) { return function (a) { return B.meet(x(a), y(a)); }; },
	        join: function (x, y) { return function (a) { return B.join(x(a), y(a)); }; },
	        zero: function () { return B.zero; },
	        one: function () { return B.one; },
	        implies: function (x, y) { return function (a) { return B.implies(x(a), y(a)); }; },
	        not: function (x) { return function (a) { return B.not(x(a)); }; }
	    }); };
	};
	exports.getBooleanAlgebra = getBooleanAlgebra;
	/**
	 * Unary functions form a semigroup as long as you can provide a semigroup for the codomain.
	 *
	 * @example
	 * import { Predicate, getSemigroup } from 'fp-ts/function'
	 * import * as B from 'fp-ts/boolean'
	 *
	 * const f: Predicate<number> = (n) => n <= 2
	 * const g: Predicate<number> = (n) => n >= 0
	 *
	 * const S1 = getSemigroup(B.SemigroupAll)<number>()
	 *
	 * assert.deepStrictEqual(S1.concat(f, g)(1), true)
	 * assert.deepStrictEqual(S1.concat(f, g)(3), false)
	 *
	 * const S2 = getSemigroup(B.SemigroupAny)<number>()
	 *
	 * assert.deepStrictEqual(S2.concat(f, g)(1), true)
	 * assert.deepStrictEqual(S2.concat(f, g)(3), true)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	var getSemigroup = function (S) {
	    return function () { return ({
	        concat: function (f, g) { return function (a) { return S.concat(f(a), g(a)); }; }
	    }); };
	};
	exports.getSemigroup = getSemigroup;
	/**
	 * Unary functions form a monoid as long as you can provide a monoid for the codomain.
	 *
	 * @example
	 * import { Predicate } from 'fp-ts/Predicate'
	 * import { getMonoid } from 'fp-ts/function'
	 * import * as B from 'fp-ts/boolean'
	 *
	 * const f: Predicate<number> = (n) => n <= 2
	 * const g: Predicate<number> = (n) => n >= 0
	 *
	 * const M1 = getMonoid(B.MonoidAll)<number>()
	 *
	 * assert.deepStrictEqual(M1.concat(f, g)(1), true)
	 * assert.deepStrictEqual(M1.concat(f, g)(3), false)
	 *
	 * const M2 = getMonoid(B.MonoidAny)<number>()
	 *
	 * assert.deepStrictEqual(M2.concat(f, g)(1), true)
	 * assert.deepStrictEqual(M2.concat(f, g)(3), true)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	var getMonoid = function (M) {
	    var getSemigroupM = (0, exports.getSemigroup)(M);
	    return function () { return ({
	        concat: getSemigroupM().concat,
	        empty: function () { return M.empty; }
	    }); };
	};
	exports.getMonoid = getMonoid;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	var getSemiring = function (S) { return ({
	    add: function (f, g) { return function (x) { return S.add(f(x), g(x)); }; },
	    zero: function () { return S.zero; },
	    mul: function (f, g) { return function (x) { return S.mul(f(x), g(x)); }; },
	    one: function () { return S.one; }
	}); };
	exports.getSemiring = getSemiring;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	var getRing = function (R) {
	    var S = (0, exports.getSemiring)(R);
	    return {
	        add: S.add,
	        mul: S.mul,
	        one: S.one,
	        zero: S.zero,
	        sub: function (f, g) { return function (x) { return R.sub(f(x), g(x)); }; }
	    };
	};
	exports.getRing = getRing;
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.11.0
	 */
	var apply = function (a) {
	    return function (f) {
	        return f(a);
	    };
	};
	exports.apply = apply;
	/**
	 * @since 2.0.0
	 */
	function identity(a) {
	    return a;
	}
	exports.identity = identity;
	/**
	 * @since 2.0.0
	 */
	exports.unsafeCoerce = identity;
	/**
	 * @since 2.0.0
	 */
	function constant(a) {
	    return function () { return a; };
	}
	exports.constant = constant;
	/**
	 * A thunk that returns always `true`.
	 *
	 * @since 2.0.0
	 */
	exports.constTrue = constant(true);
	/**
	 * A thunk that returns always `false`.
	 *
	 * @since 2.0.0
	 */
	exports.constFalse = constant(false);
	/**
	 * A thunk that returns always `null`.
	 *
	 * @since 2.0.0
	 */
	exports.constNull = constant(null);
	/**
	 * A thunk that returns always `undefined`.
	 *
	 * @since 2.0.0
	 */
	exports.constUndefined = constant(undefined);
	/**
	 * A thunk that returns always `void`.
	 *
	 * @since 2.0.0
	 */
	exports.constVoid = exports.constUndefined;
	function flip(f) {
	    return function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        if (args.length > 1) {
	            return f(args[1], args[0]);
	        }
	        return function (a) { return f(a)(args[0]); };
	    };
	}
	exports.flip = flip;
	function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
	    switch (arguments.length) {
	        case 1:
	            return ab;
	        case 2:
	            return function () {
	                return bc(ab.apply(this, arguments));
	            };
	        case 3:
	            return function () {
	                return cd(bc(ab.apply(this, arguments)));
	            };
	        case 4:
	            return function () {
	                return de(cd(bc(ab.apply(this, arguments))));
	            };
	        case 5:
	            return function () {
	                return ef(de(cd(bc(ab.apply(this, arguments)))));
	            };
	        case 6:
	            return function () {
	                return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
	            };
	        case 7:
	            return function () {
	                return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
	            };
	        case 8:
	            return function () {
	                return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
	            };
	        case 9:
	            return function () {
	                return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
	            };
	    }
	    return;
	}
	exports.flow = flow;
	/**
	 * @since 2.0.0
	 */
	function tuple() {
	    var t = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        t[_i] = arguments[_i];
	    }
	    return t;
	}
	exports.tuple = tuple;
	/**
	 * @since 2.0.0
	 */
	function increment(n) {
	    return n + 1;
	}
	exports.increment = increment;
	/**
	 * @since 2.0.0
	 */
	function decrement(n) {
	    return n - 1;
	}
	exports.decrement = decrement;
	/**
	 * @since 2.0.0
	 */
	function absurd(_) {
	    throw new Error('Called `absurd` function which should be uncallable');
	}
	exports.absurd = absurd;
	/**
	 * Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument.
	 *
	 * @example
	 * import { tupled } from 'fp-ts/function'
	 *
	 * const add = tupled((x: number, y: number): number => x + y)
	 *
	 * assert.strictEqual(add([1, 2]), 3)
	 *
	 * @since 2.4.0
	 */
	function tupled(f) {
	    return function (a) { return f.apply(void 0, a); };
	}
	exports.tupled = tupled;
	/**
	 * Inverse function of `tupled`
	 *
	 * @since 2.4.0
	 */
	function untupled(f) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return f(a);
	    };
	}
	exports.untupled = untupled;
	function pipe(a, ab, bc, cd, de, ef, fg, gh, hi) {
	    switch (arguments.length) {
	        case 1:
	            return a;
	        case 2:
	            return ab(a);
	        case 3:
	            return bc(ab(a));
	        case 4:
	            return cd(bc(ab(a)));
	        case 5:
	            return de(cd(bc(ab(a))));
	        case 6:
	            return ef(de(cd(bc(ab(a)))));
	        case 7:
	            return fg(ef(de(cd(bc(ab(a))))));
	        case 8:
	            return gh(fg(ef(de(cd(bc(ab(a)))))));
	        case 9:
	            return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
	        default: {
	            var ret = arguments[0];
	            for (var i = 1; i < arguments.length; i++) {
	                ret = arguments[i](ret);
	            }
	            return ret;
	        }
	    }
	}
	exports.pipe = pipe;
	/**
	 * Type hole simulation
	 *
	 * @since 2.7.0
	 */
	exports.hole = absurd;
	/**
	 * @since 2.11.0
	 */
	var SK = function (_, b) { return b; };
	exports.SK = SK;
	/**
	 * Use `Predicate` module instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	function not(predicate) {
	    return function (a) { return !predicate(a); };
	}
	exports.not = not;
	/**
	 * Use `Endomorphism` module instead.
	 *
	 * @category zone of death
	 * @since 2.10.0
	 * @deprecated
	 */
	var getEndomorphismMonoid = function () { return ({
	    concat: function (first, second) { return flow(first, second); },
	    empty: identity
	}); };
	exports.getEndomorphismMonoid = getEndomorphismMonoid;
	/** @internal */
	var dual = function (arity, body) {
	    var isDataFirst = typeof arity === 'number' ? function (args) { return args.length >= arity; } : arity;
	    return function () {
	        var args = Array.from(arguments);
	        if (isDataFirst(arguments)) {
	            return body.apply(this, args);
	        }
	        return function (self) { return body.apply(void 0, __spreadArray([self], args, false)); };
	    };
	};
	exports.dual = dual; 
} (_function));

var internal = {};

(function (exports) {
	var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.flatMapReader = exports.flatMapTask = exports.flatMapIO = exports.flatMapEither = exports.flatMapOption = exports.flatMapNullable = exports.liftOption = exports.liftNullable = exports.fromReadonlyNonEmptyArray = exports.has = exports.emptyRecord = exports.emptyReadonlyArray = exports.tail = exports.head = exports.isNonEmpty = exports.singleton = exports.right = exports.left = exports.isRight = exports.isLeft = exports.some = exports.none = exports.isSome = exports.isNone = void 0;
	var function_1 = _function;
	// -------------------------------------------------------------------------------------
	// Option
	// -------------------------------------------------------------------------------------
	/** @internal */
	var isNone = function (fa) { return fa._tag === 'None'; };
	exports.isNone = isNone;
	/** @internal */
	var isSome = function (fa) { return fa._tag === 'Some'; };
	exports.isSome = isSome;
	/** @internal */
	exports.none = { _tag: 'None' };
	/** @internal */
	var some = function (a) { return ({ _tag: 'Some', value: a }); };
	exports.some = some;
	// -------------------------------------------------------------------------------------
	// Either
	// -------------------------------------------------------------------------------------
	/** @internal */
	var isLeft = function (ma) { return ma._tag === 'Left'; };
	exports.isLeft = isLeft;
	/** @internal */
	var isRight = function (ma) { return ma._tag === 'Right'; };
	exports.isRight = isRight;
	/** @internal */
	var left = function (e) { return ({ _tag: 'Left', left: e }); };
	exports.left = left;
	/** @internal */
	var right = function (a) { return ({ _tag: 'Right', right: a }); };
	exports.right = right;
	// -------------------------------------------------------------------------------------
	// ReadonlyNonEmptyArray
	// -------------------------------------------------------------------------------------
	/** @internal */
	var singleton = function (a) { return [a]; };
	exports.singleton = singleton;
	/** @internal */
	var isNonEmpty = function (as) { return as.length > 0; };
	exports.isNonEmpty = isNonEmpty;
	/** @internal */
	var head = function (as) { return as[0]; };
	exports.head = head;
	/** @internal */
	var tail = function (as) { return as.slice(1); };
	exports.tail = tail;
	// -------------------------------------------------------------------------------------
	// empty
	// -------------------------------------------------------------------------------------
	/** @internal */
	exports.emptyReadonlyArray = [];
	/** @internal */
	exports.emptyRecord = {};
	// -------------------------------------------------------------------------------------
	// Record
	// -------------------------------------------------------------------------------------
	/** @internal */
	exports.has = Object.prototype.hasOwnProperty;
	// -------------------------------------------------------------------------------------
	// NonEmptyArray
	// -------------------------------------------------------------------------------------
	/** @internal */
	var fromReadonlyNonEmptyArray = function (as) { return __spreadArray([as[0]], as.slice(1), true); };
	exports.fromReadonlyNonEmptyArray = fromReadonlyNonEmptyArray;
	/** @internal */
	var liftNullable = function (F) {
	    return function (f, onNullable) {
	        return function () {
	            var a = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                a[_i] = arguments[_i];
	            }
	            var o = f.apply(void 0, a);
	            return F.fromEither(o == null ? (0, exports.left)(onNullable.apply(void 0, a)) : (0, exports.right)(o));
	        };
	    };
	};
	exports.liftNullable = liftNullable;
	/** @internal */
	var liftOption = function (F) {
	    return function (f, onNone) {
	        return function () {
	            var a = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                a[_i] = arguments[_i];
	            }
	            var o = f.apply(void 0, a);
	            return F.fromEither((0, exports.isNone)(o) ? (0, exports.left)(onNone.apply(void 0, a)) : (0, exports.right)(o.value));
	        };
	    };
	};
	exports.liftOption = liftOption;
	/** @internal */
	var flatMapNullable = function (F, M) {
	     return (0, function_1.dual)(3, function (self, f, onNullable) {
	        return M.flatMap(self, (0, exports.liftNullable)(F)(f, onNullable));
	    });
	};
	exports.flatMapNullable = flatMapNullable;
	/** @internal */
	var flatMapOption = function (F, M) {
	     return (0, function_1.dual)(3, function (self, f, onNone) { return M.flatMap(self, (0, exports.liftOption)(F)(f, onNone)); });
	};
	exports.flatMapOption = flatMapOption;
	/** @internal */
	var flatMapEither = function (F, M) {
	     return (0, function_1.dual)(2, function (self, f) {
	        return M.flatMap(self, function (a) { return F.fromEither(f(a)); });
	    });
	};
	exports.flatMapEither = flatMapEither;
	/** @internal */
	var flatMapIO = function (F, M) {
	     return (0, function_1.dual)(2, function (self, f) {
	        return M.flatMap(self, function (a) { return F.fromIO(f(a)); });
	    });
	};
	exports.flatMapIO = flatMapIO;
	/** @internal */
	var flatMapTask = function (F, M) {
	     return (0, function_1.dual)(2, function (self, f) {
	        return M.flatMap(self, function (a) { return F.fromTask(f(a)); });
	    });
	};
	exports.flatMapTask = flatMapTask;
	/** @internal */
	var flatMapReader = function (F, M) {
	     return (0, function_1.dual)(2, function (self, f) {
	        return M.flatMap(self, function (a) { return F.fromReader(f(a)); });
	    });
	};
	exports.flatMapReader = flatMapReader; 
} (internal));

var __createBinding$4 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$4 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$4 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$4(result, mod, k);
    __setModuleDefault$4(result, mod);
    return result;
};
Object.defineProperty(Apply, "__esModule", { value: true });
Apply.sequenceS = Apply.sequenceT = Apply.getApplySemigroup = Apply.apS = Apply.apSecond = Apply.apFirst = Apply.ap = void 0;
/**
 * The `Apply` class provides the `ap` which is used to apply a function to an argument under a type constructor.
 *
 * `Apply` can be used to lift functions of two or more arguments to work on values wrapped with the type constructor
 * `f`.
 *
 * Instances must satisfy the following law in addition to the `Functor` laws:
 *
 * 1. Associative composition: `F.ap(F.ap(F.map(fbc, bc => ab => a => bc(ab(a))), fab), fa) <-> F.ap(fbc, F.ap(fab, fa))`
 *
 * Formally, `Apply` represents a strong lax semi-monoidal endofunctor.
 *
 * @example
 * import * as O from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * const f = (a: string) => (b: number) => (c: boolean) => a + String(b) + String(c)
 * const fa: O.Option<string> = O.some('s')
 * const fb: O.Option<number> = O.some(1)
 * const fc: O.Option<boolean> = O.some(true)
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     // lift a function
 *     O.some(f),
 *     // apply the first argument
 *     O.ap(fa),
 *     // apply the second argument
 *     O.ap(fb),
 *     // apply the third argument
 *     O.ap(fc)
 *   ),
 *   O.some('s1true')
 * )
 *
 * @since 2.0.0
 */
var function_1$8 = _function;
var _$2 = __importStar$4(internal);
function ap$2(F, G) {
    return function (fa) {
        return function (fab) {
            return F.ap(F.map(fab, function (gab) { return function (ga) { return G.ap(gab, ga); }; }), fa);
        };
    };
}
Apply.ap = ap$2;
function apFirst(A) {
    return function (second) { return function (first) {
        return A.ap(A.map(first, function (a) { return function () { return a; }; }), second);
    }; };
}
Apply.apFirst = apFirst;
function apSecond(A) {
    return function (second) {
        return function (first) {
            return A.ap(A.map(first, function () { return function (b) { return b; }; }), second);
        };
    };
}
Apply.apSecond = apSecond;
function apS(F) {
    return function (name, fb) {
        return function (fa) {
            return F.ap(F.map(fa, function (a) { return function (b) {
                var _a;
                return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
            }; }), fb);
        };
    };
}
Apply.apS = apS;
function getApplySemigroup(F) {
    return function (S) { return ({
        concat: function (first, second) {
            return F.ap(F.map(first, function (x) { return function (y) { return S.concat(x, y); }; }), second);
        }
    }); };
}
Apply.getApplySemigroup = getApplySemigroup;
function curried(f, n, acc) {
    return function (x) {
        var combined = Array(acc.length + 1);
        for (var i = 0; i < acc.length; i++) {
            combined[i] = acc[i];
        }
        combined[acc.length] = x;
        return n === 0 ? f.apply(null, combined) : curried(f, n - 1, combined);
    };
}
var tupleConstructors = {
    1: function (a) { return [a]; },
    2: function (a) { return function (b) { return [a, b]; }; },
    3: function (a) { return function (b) { return function (c) { return [a, b, c]; }; }; },
    4: function (a) { return function (b) { return function (c) { return function (d) { return [a, b, c, d]; }; }; }; },
    5: function (a) { return function (b) { return function (c) { return function (d) { return function (e) { return [a, b, c, d, e]; }; }; }; }; }
};
function getTupleConstructor(len) {
    if (!_$2.has.call(tupleConstructors, len)) {
        tupleConstructors[len] = curried(function_1$8.tuple, len - 1, []);
    }
    return tupleConstructors[len];
}
function sequenceT(F) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var len = args.length;
        var f = getTupleConstructor(len);
        var fas = F.map(args[0], f);
        for (var i = 1; i < len; i++) {
            fas = F.ap(fas, args[i]);
        }
        return fas;
    };
}
Apply.sequenceT = sequenceT;
function getRecordConstructor(keys) {
    var len = keys.length;
    switch (len) {
        case 1:
            return function (a) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a);
            };
        case 2:
            return function (a) { return function (b) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a);
            }; };
        case 3:
            return function (a) { return function (b) { return function (c) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a);
            }; }; };
        case 4:
            return function (a) { return function (b) { return function (c) { return function (d) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a);
            }; }; }; };
        case 5:
            return function (a) { return function (b) { return function (c) { return function (d) { return function (e) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a[keys[4]] = e,
                    _a);
            }; }; }; }; };
        default:
            return curried(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var r = {};
                for (var i = 0; i < len; i++) {
                    r[keys[i]] = args[i];
                }
                return r;
            }, len - 1, []);
    }
}
function sequenceS(F) {
    return function (r) {
        var keys = Object.keys(r);
        var len = keys.length;
        var f = getRecordConstructor(keys);
        var fr = F.map(r[keys[0]], f);
        for (var i = 1; i < len; i++) {
            fr = F.ap(fr, r[keys[i]]);
        }
        return fr;
    };
}
Apply.sequenceS = sequenceS;

var Functor = {};

Object.defineProperty(Functor, "__esModule", { value: true });
Functor.asUnit = Functor.as = Functor.getFunctorComposition = Functor.let = Functor.bindTo = Functor.flap = Functor.map = void 0;
/**
 * A `Functor` is a type constructor which supports a mapping operation `map`.
 *
 * `map` can be used to turn functions `a -> b` into functions `f a -> f b` whose argument and return types use the type
 * constructor `f` to represent some computational context.
 *
 * Instances must satisfy the following laws:
 *
 * 1. Identity: `F.map(fa, a => a) <-> fa`
 * 2. Composition: `F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)`
 *
 * @since 2.0.0
 */
var function_1$7 = _function;
function map$4(F, G) {
    return function (f) { return function (fa) { return F.map(fa, function (ga) { return G.map(ga, f); }); }; };
}
Functor.map = map$4;
function flap(F) {
    return function (a) { return function (fab) { return F.map(fab, function (f) { return f(a); }); }; };
}
Functor.flap = flap;
function bindTo(F) {
    return function (name) { return function (fa) { return F.map(fa, function (a) {
        var _a;
        return (_a = {}, _a[name] = a, _a);
    }); }; };
}
Functor.bindTo = bindTo;
function let_(F) {
    return function (name, f) { return function (fa) { return F.map(fa, function (a) {
        var _a;
        return Object.assign({}, a, (_a = {}, _a[name] = f(a), _a));
    }); }; };
}
Functor.let = let_;
/** @deprecated */
function getFunctorComposition(F, G) {
    var _map = map$4(F, G);
    return {
        map: function (fga, f) { return (0, function_1$7.pipe)(fga, _map(f)); }
    };
}
Functor.getFunctorComposition = getFunctorComposition;
/** @internal */
function as(F) {
    return function (self, b) { return F.map(self, function () { return b; }); };
}
Functor.as = as;
/** @internal */
function asUnit(F) {
    var asM = as(F);
    return function (self) { return asM(self, undefined); };
}
Functor.asUnit = asUnit;

Object.defineProperty(Applicative, "__esModule", { value: true });
Applicative.getApplicativeComposition = Applicative.getApplicativeMonoid = void 0;
/**
 * The `Applicative` type class extends the `Apply` type class with a `of` function, which can be used to create values
 * of type `f a` from values of type `a`.
 *
 * Where `Apply` provides the ability to lift functions of two or more arguments to functions whose arguments are
 * wrapped using `f`, and `Functor` provides the ability to lift functions of one argument, `pure` can be seen as the
 * function which lifts functions of _zero_ arguments. That is, `Applicative` functors support a lifting operation for
 * any number of function arguments.
 *
 * Instances must satisfy the following laws in addition to the `Apply` laws:
 *
 * 1. Identity: `A.ap(A.of(a => a), fa) <-> fa`
 * 2. Homomorphism: `A.ap(A.of(ab), A.of(a)) <-> A.of(ab(a))`
 * 3. Interchange: `A.ap(fab, A.of(a)) <-> A.ap(A.of(ab => ab(a)), fab)`
 *
 * Note. `Functor`'s `map` can be derived: `A.map(x, f) = A.ap(A.of(f), x)`
 *
 * @since 2.0.0
 */
var Apply_1$1 = Apply;
var function_1$6 = _function;
var Functor_1$3 = Functor;
function getApplicativeMonoid(F) {
    var f = (0, Apply_1$1.getApplySemigroup)(F);
    return function (M) { return ({
        concat: f(M).concat,
        empty: F.of(M.empty)
    }); };
}
Applicative.getApplicativeMonoid = getApplicativeMonoid;
/** @deprecated */
function getApplicativeComposition(F, G) {
    var map = (0, Functor_1$3.getFunctorComposition)(F, G).map;
    var _ap = (0, Apply_1$1.ap)(F, G);
    return {
        map: map,
        of: function (a) { return F.of(G.of(a)); },
        ap: function (fgab, fga) { return (0, function_1$6.pipe)(fgab, _ap(fga)); }
    };
}
Applicative.getApplicativeComposition = getApplicativeComposition;

var Chain = {};

Object.defineProperty(Chain, "__esModule", { value: true });
Chain.bind = Chain.tap = Chain.chainFirst = void 0;
function chainFirst(M) {
    var tapM = tap(M);
    return function (f) { return function (first) { return tapM(first, f); }; };
}
Chain.chainFirst = chainFirst;
/** @internal */
function tap(M) {
    return function (first, f) { return M.chain(first, function (a) { return M.map(f(a), function () { return a; }); }); };
}
Chain.tap = tap;
function bind(M) {
    return function (name, f) { return function (ma) { return M.chain(ma, function (a) { return M.map(f(a), function (b) {
        var _a;
        return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
    }); }); }; };
}
Chain.bind = bind;

var Compactable$1 = {};

var Option = {};

var FromEither = {};

/**
 * The `FromEither` type class represents those data types which support errors.
 *
 * @since 2.10.0
 */
var __createBinding$3 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$3 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$3 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$3(result, mod, k);
    __setModuleDefault$3(result, mod);
    return result;
};
Object.defineProperty(FromEither, "__esModule", { value: true });
FromEither.tapEither = FromEither.filterOrElse = FromEither.chainFirstEitherK = FromEither.chainEitherK = FromEither.fromEitherK = FromEither.chainOptionK = FromEither.fromOptionK = FromEither.fromPredicate = FromEither.fromOption = void 0;
var Chain_1$2 = Chain;
var function_1$5 = _function;
var _$1 = __importStar$3(internal);
function fromOption(F) {
    return function (onNone) { return function (ma) { return F.fromEither(_$1.isNone(ma) ? _$1.left(onNone()) : _$1.right(ma.value)); }; };
}
FromEither.fromOption = fromOption;
function fromPredicate$2(F) {
    return function (predicate, onFalse) {
        return function (a) {
            return F.fromEither(predicate(a) ? _$1.right(a) : _$1.left(onFalse(a)));
        };
    };
}
FromEither.fromPredicate = fromPredicate$2;
function fromOptionK(F) {
    var fromOptionF = fromOption(F);
    return function (onNone) {
        var from = fromOptionF(onNone);
        return function (f) { return (0, function_1$5.flow)(f, from); };
    };
}
FromEither.fromOptionK = fromOptionK;
function chainOptionK(F, M) {
    var fromOptionKF = fromOptionK(F);
    return function (onNone) {
        var from = fromOptionKF(onNone);
        return function (f) { return function (ma) { return M.chain(ma, from(f)); }; };
    };
}
FromEither.chainOptionK = chainOptionK;
function fromEitherK(F) {
    return function (f) { return (0, function_1$5.flow)(f, F.fromEither); };
}
FromEither.fromEitherK = fromEitherK;
function chainEitherK(F, M) {
    var fromEitherKF = fromEitherK(F);
    return function (f) { return function (ma) { return M.chain(ma, fromEitherKF(f)); }; };
}
FromEither.chainEitherK = chainEitherK;
function chainFirstEitherK(F, M) {
    var tapEitherM = tapEither(F, M);
    return function (f) { return function (ma) { return tapEitherM(ma, f); }; };
}
FromEither.chainFirstEitherK = chainFirstEitherK;
function filterOrElse(F, M) {
    return function (predicate, onFalse) {
        return function (ma) {
            return M.chain(ma, function (a) { return F.fromEither(predicate(a) ? _$1.right(a) : _$1.left(onFalse(a))); });
        };
    };
}
FromEither.filterOrElse = filterOrElse;
/** @internal */
function tapEither(F, M) {
    var fromEither = fromEitherK(F);
    var tapM = (0, Chain_1$2.tap)(M);
    return function (self, f) { return tapM(self, fromEither(f)); };
}
FromEither.tapEither = tapEither;

var Predicate = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.and = exports.or = exports.not = exports.Contravariant = exports.getMonoidAll = exports.getSemigroupAll = exports.getMonoidAny = exports.getSemigroupAny = exports.URI = exports.contramap = void 0;
	var function_1 = _function;
	var contramap_ = function (predicate, f) { return (0, function_1.pipe)(predicate, (0, exports.contramap)(f)); };
	/**
	 * @since 2.11.0
	 */
	var contramap = function (f) {
	    return function (predicate) {
	        return (0, function_1.flow)(f, predicate);
	    };
	};
	exports.contramap = contramap;
	/**
	 * @category type lambdas
	 * @since 2.11.0
	 */
	exports.URI = 'Predicate';
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getSemigroupAny = function () { return ({
	    concat: function (first, second) { return (0, function_1.pipe)(first, (0, exports.or)(second)); }
	}); };
	exports.getSemigroupAny = getSemigroupAny;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getMonoidAny = function () { return ({
	    concat: (0, exports.getSemigroupAny)().concat,
	    empty: function_1.constFalse
	}); };
	exports.getMonoidAny = getMonoidAny;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getSemigroupAll = function () { return ({
	    concat: function (first, second) { return (0, function_1.pipe)(first, (0, exports.and)(second)); }
	}); };
	exports.getSemigroupAll = getSemigroupAll;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getMonoidAll = function () { return ({
	    concat: (0, exports.getSemigroupAll)().concat,
	    empty: function_1.constTrue
	}); };
	exports.getMonoidAll = getMonoidAll;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.Contravariant = {
	    URI: exports.URI,
	    contramap: contramap_
	};
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.11.0
	 */
	var not = function (predicate) {
	    return function (a) {
	        return !predicate(a);
	    };
	};
	exports.not = not;
	/**
	 * @since 2.11.0
	 */
	var or = function (second) {
	    return function (first) {
	        return function (a) {
	            return first(a) || second(a);
	        };
	    };
	};
	exports.or = or;
	/**
	 * @since 2.11.0
	 */
	var and = function (second) {
	    return function (first) {
	        return function (a) {
	            return first(a) && second(a);
	        };
	    };
	};
	exports.and = and; 
} (Predicate));

var Semigroup = {};

var Magma = {};

/**
 * A `Magma` is a pair `(A, concat)` in which `A` is a non-empty set and `concat` is a binary operation on `A`
 *
 * See [Semigroup](https://gcanti.github.io/fp-ts/modules/Semigroup.ts.html) for some instances.
 *
 * @since 2.0.0
 */
Object.defineProperty(Magma, "__esModule", { value: true });
Magma.concatAll = Magma.endo = Magma.filterSecond = Magma.filterFirst = Magma.reverse = void 0;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * The dual of a `Magma`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { reverse, concatAll } from 'fp-ts/Magma'
 * import * as N from 'fp-ts/number'
 *
 * const subAll = concatAll(reverse(N.MagmaSub))(0)
 *
 * assert.deepStrictEqual(subAll([1, 2, 3]), 2)
 *
 * @since 2.11.0
 */
var reverse$1 = function (M) { return ({
    concat: function (first, second) { return M.concat(second, first); }
}); };
Magma.reverse = reverse$1;
/**
 * @since 2.11.0
 */
var filterFirst = function (predicate) {
    return function (M) { return ({
        concat: function (first, second) { return (predicate(first) ? M.concat(first, second) : second); }
    }); };
};
Magma.filterFirst = filterFirst;
/**
 * @since 2.11.0
 */
var filterSecond = function (predicate) {
    return function (M) { return ({
        concat: function (first, second) { return (predicate(second) ? M.concat(first, second) : first); }
    }); };
};
Magma.filterSecond = filterSecond;
/**
 * @since 2.11.0
 */
var endo = function (f) {
    return function (M) { return ({
        concat: function (first, second) { return M.concat(f(first), f(second)); }
    }); };
};
Magma.endo = endo;
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Given a sequence of `as`, concat them and return the total.
 *
 * If `as` is empty, return the provided `startWith` value.
 *
 * @example
 * import { concatAll } from 'fp-ts/Magma'
 * import * as N from 'fp-ts/number'
 *
 * const subAll = concatAll(N.MagmaSub)(0)
 *
 * assert.deepStrictEqual(subAll([1, 2, 3]), -6)
 *
 * @since 2.11.0
 */
var concatAll = function (M) {
    return function (startWith) {
        return function (as) {
            return as.reduce(function (a, acc) { return M.concat(a, acc); }, startWith);
        };
    };
};
Magma.concatAll = concatAll;

var Ord = {};

var Eq = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.eqDate = exports.eqNumber = exports.eqString = exports.eqBoolean = exports.eq = exports.strictEqual = exports.getStructEq = exports.getTupleEq = exports.Contravariant = exports.getMonoid = exports.getSemigroup = exports.eqStrict = exports.URI = exports.contramap = exports.tuple = exports.struct = exports.fromEquals = void 0;
	var function_1 = _function;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	var fromEquals = function (equals) { return ({
	    equals: function (x, y) { return x === y || equals(x, y); }
	}); };
	exports.fromEquals = fromEquals;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.10.0
	 */
	var struct = function (eqs) {
	    return (0, exports.fromEquals)(function (first, second) {
	        for (var key in eqs) {
	            if (!eqs[key].equals(first[key], second[key])) {
	                return false;
	            }
	        }
	        return true;
	    });
	};
	exports.struct = struct;
	/**
	 * Given a tuple of `Eq`s returns a `Eq` for the tuple
	 *
	 * @example
	 * import { tuple } from 'fp-ts/Eq'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 * import * as B from 'fp-ts/boolean'
	 *
	 * const E = tuple(S.Eq, N.Eq, B.Eq)
	 * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, true]), true)
	 * assert.strictEqual(E.equals(['a', 1, true], ['b', 1, true]), false)
	 * assert.strictEqual(E.equals(['a', 1, true], ['a', 2, true]), false)
	 * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, false]), false)
	 *
	 * @since 2.10.0
	 */
	var tuple = function () {
	    var eqs = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        eqs[_i] = arguments[_i];
	    }
	    return (0, exports.fromEquals)(function (first, second) { return eqs.every(function (E, i) { return E.equals(first[i], second[i]); }); });
	};
	exports.tuple = tuple;
	/* istanbul ignore next */
	var contramap_ = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.contramap)(f)); };
	/**
	 * A typical use case for `contramap` would be like, given some `User` type, to construct an `Eq<User>`.
	 *
	 * We can do so with a function from `User -> X` where `X` is some value that we know how to compare
	 * for equality (meaning we have an `Eq<X>`)
	 *
	 * For example, given the following `User` type, we want to construct an `Eq<User>` that just looks at the `key` field
	 * for each user (since it's known to be unique).
	 *
	 * If we have a way of comparing `UUID`s for equality (`eqUUID: Eq<UUID>`) and we know how to go from `User -> UUID`,
	 * using `contramap` we can do this
	 *
	 * @example
	 * import { contramap, Eq } from 'fp-ts/Eq'
	 * import { pipe } from 'fp-ts/function'
	 * import * as S from 'fp-ts/string'
	 *
	 * type UUID = string
	 *
	 * interface User {
	 *   readonly key: UUID
	 *   readonly firstName: string
	 *   readonly lastName: string
	 * }
	 *
	 * const eqUUID: Eq<UUID> = S.Eq
	 *
	 * const eqUserByKey: Eq<User> = pipe(
	 *   eqUUID,
	 *   contramap((user) => user.key)
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   eqUserByKey.equals(
	 *     { key: 'k1', firstName: 'a1', lastName: 'b1' },
	 *     { key: 'k2', firstName: 'a1', lastName: 'b1' }
	 *   ),
	 *   false
	 * )
	 * assert.deepStrictEqual(
	 *   eqUserByKey.equals(
	 *     { key: 'k1', firstName: 'a1', lastName: 'b1' },
	 *     { key: 'k1', firstName: 'a2', lastName: 'b1' }
	 *   ),
	 *   true
	 * )
	 *
	 * @since 2.0.0
	 */
	var contramap = function (f) { return function (fa) {
	    return (0, exports.fromEquals)(function (x, y) { return fa.equals(f(x), f(y)); });
	}; };
	exports.contramap = contramap;
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Eq';
	/**
	 * @category instances
	 * @since 2.5.0
	 */
	exports.eqStrict = {
	    equals: function (a, b) { return a === b; }
	};
	var empty = {
	    equals: function () { return true; }
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	var getSemigroup = function () { return ({
	    concat: function (x, y) { return (0, exports.fromEquals)(function (a, b) { return x.equals(a, b) && y.equals(a, b); }); }
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * @category instances
	 * @since 2.6.0
	 */
	var getMonoid = function () { return ({
	    concat: (0, exports.getSemigroup)().concat,
	    empty: empty
	}); };
	exports.getMonoid = getMonoid;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Contravariant = {
	    URI: exports.URI,
	    contramap: contramap_
	};
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use [`tuple`](#tuple) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getTupleEq = exports.tuple;
	/**
	 * Use [`struct`](#struct) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getStructEq = exports.struct;
	/**
	 * Use [`eqStrict`](#eqstrict) instead
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.strictEqual = exports.eqStrict.equals;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Contravariant` instance, pass `E.Contravariant` instead of `E.eq`
	 * (where `E` is from `import E from 'fp-ts/Eq'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.eq = exports.Contravariant;
	/**
	 * Use [`Eq`](./boolean.ts.html#eq) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.eqBoolean = exports.eqStrict;
	/**
	 * Use [`Eq`](./string.ts.html#eq) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.eqString = exports.eqStrict;
	/**
	 * Use [`Eq`](./number.ts.html#eq) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.eqNumber = exports.eqStrict;
	/**
	 * Use [`Eq`](./Date.ts.html#eq) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.eqDate = {
	    equals: function (first, second) { return first.valueOf() === second.valueOf(); }
	}; 
} (Eq));

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ordDate = exports.ordNumber = exports.ordString = exports.ordBoolean = exports.ord = exports.getDualOrd = exports.getTupleOrd = exports.between = exports.clamp = exports.max = exports.min = exports.geq = exports.leq = exports.gt = exports.lt = exports.equals = exports.trivial = exports.Contravariant = exports.getMonoid = exports.getSemigroup = exports.URI = exports.contramap = exports.reverse = exports.tuple = exports.fromCompare = exports.equalsDefault = void 0;
	var Eq_1 = Eq;
	var function_1 = _function;
	// -------------------------------------------------------------------------------------
	// defaults
	// -------------------------------------------------------------------------------------
	/**
	 * @category defaults
	 * @since 2.10.0
	 */
	var equalsDefault = function (compare) {
	    return function (first, second) {
	        return first === second || compare(first, second) === 0;
	    };
	};
	exports.equalsDefault = equalsDefault;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	var fromCompare = function (compare) { return ({
	    equals: (0, exports.equalsDefault)(compare),
	    compare: function (first, second) { return (first === second ? 0 : compare(first, second)); }
	}); };
	exports.fromCompare = fromCompare;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * Given a tuple of `Ord`s returns an `Ord` for the tuple.
	 *
	 * @example
	 * import { tuple } from 'fp-ts/Ord'
	 * import * as B from 'fp-ts/boolean'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 *
	 * const O = tuple(S.Ord, N.Ord, B.Ord)
	 * assert.strictEqual(O.compare(['a', 1, true], ['b', 2, true]), -1)
	 * assert.strictEqual(O.compare(['a', 1, true], ['a', 2, true]), -1)
	 * assert.strictEqual(O.compare(['a', 1, true], ['a', 1, false]), 1)
	 *
	 * @since 2.10.0
	 */
	var tuple = function () {
	    var ords = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        ords[_i] = arguments[_i];
	    }
	    return (0, exports.fromCompare)(function (first, second) {
	        var i = 0;
	        for (; i < ords.length - 1; i++) {
	            var r = ords[i].compare(first[i], second[i]);
	            if (r !== 0) {
	                return r;
	            }
	        }
	        return ords[i].compare(first[i], second[i]);
	    });
	};
	exports.tuple = tuple;
	/**
	 * @since 2.10.0
	 */
	var reverse = function (O) { return (0, exports.fromCompare)(function (first, second) { return O.compare(second, first); }); };
	exports.reverse = reverse;
	/* istanbul ignore next */
	var contramap_ = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.contramap)(f)); };
	/**
	 * A typical use case for `contramap` would be like, given some `User` type, to construct an `Ord<User>`.
	 *
	 * We can do so with a function from `User -> X` where `X` is some value that we know how to compare
	 * for ordering (meaning we have an `Ord<X>`)
	 *
	 * For example, given the following `User` type, there are lots of possible choices for `X`,
	 * but let's say we want to sort a list of users by `lastName`.
	 *
	 * If we have a way of comparing `lastName`s for ordering (`ordLastName: Ord<string>`) and we know how to go from `User -> string`,
	 * using `contramap` we can do this
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import { contramap, Ord } from 'fp-ts/Ord'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as S from 'fp-ts/string'
	 *
	 * interface User {
	 *   readonly firstName: string
	 *   readonly lastName: string
	 * }
	 *
	 * const ordLastName: Ord<string> = S.Ord
	 *
	 * const ordByLastName: Ord<User> = pipe(
	 *   ordLastName,
	 *   contramap((user) => user.lastName)
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   RA.sort(ordByLastName)([
	 *     { firstName: 'a', lastName: 'd' },
	 *     { firstName: 'c', lastName: 'b' }
	 *   ]),
	 *   [
	 *     { firstName: 'c', lastName: 'b' },
	 *     { firstName: 'a', lastName: 'd' }
	 *   ]
	 * )
	 *
	 * @since 2.0.0
	 */
	var contramap = function (f) { return function (fa) {
	    return (0, exports.fromCompare)(function (first, second) { return fa.compare(f(first), f(second)); });
	}; };
	exports.contramap = contramap;
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Ord';
	/**
	 * A typical use case for the `Semigroup` instance of `Ord` is merging two or more orderings.
	 *
	 * For example the following snippet builds an `Ord` for a type `User` which
	 * sorts by `created` date descending, and **then** `lastName`
	 *
	 * @example
	 * import * as D from 'fp-ts/Date'
	 * import { pipe } from 'fp-ts/function'
	 * import { contramap, getSemigroup, Ord, reverse } from 'fp-ts/Ord'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as S from 'fp-ts/string'
	 *
	 * interface User {
	 *   readonly id: string
	 *   readonly lastName: string
	 *   readonly created: Date
	 * }
	 *
	 * const ordByLastName: Ord<User> = pipe(
	 *   S.Ord,
	 *   contramap((user) => user.lastName)
	 * )
	 *
	 * const ordByCreated: Ord<User> = pipe(
	 *   D.Ord,
	 *   contramap((user) => user.created)
	 * )
	 *
	 * const ordUserByCreatedDescThenLastName = getSemigroup<User>().concat(
	 *   reverse(ordByCreated),
	 *   ordByLastName
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   RA.sort(ordUserByCreatedDescThenLastName)([
	 *     { id: 'c', lastName: 'd', created: new Date(1973, 10, 30) },
	 *     { id: 'a', lastName: 'b', created: new Date(1973, 10, 30) },
	 *     { id: 'e', lastName: 'f', created: new Date(1980, 10, 30) }
	 *   ]),
	 *   [
	 *     { id: 'e', lastName: 'f', created: new Date(1980, 10, 30) },
	 *     { id: 'a', lastName: 'b', created: new Date(1973, 10, 30) },
	 *     { id: 'c', lastName: 'd', created: new Date(1973, 10, 30) }
	 *   ]
	 * )
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getSemigroup = function () { return ({
	    concat: function (first, second) {
	        return (0, exports.fromCompare)(function (a, b) {
	            var ox = first.compare(a, b);
	            return ox !== 0 ? ox : second.compare(a, b);
	        });
	    }
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * Returns a `Monoid` such that:
	 *
	 * - its `concat(ord1, ord2)` operation will order first by `ord1`, and then by `ord2`
	 * - its `empty` value is an `Ord` that always considers compared elements equal
	 *
	 * @example
	 * import { sort } from 'fp-ts/Array'
	 * import { contramap, reverse, getMonoid } from 'fp-ts/Ord'
	 * import * as S from 'fp-ts/string'
	 * import * as B from 'fp-ts/boolean'
	 * import { pipe } from 'fp-ts/function'
	 * import { concatAll } from 'fp-ts/Monoid'
	 * import * as N from 'fp-ts/number'
	 *
	 * interface User {
	 *   readonly id: number
	 *   readonly name: string
	 *   readonly age: number
	 *   readonly rememberMe: boolean
	 * }
	 *
	 * const byName = pipe(
	 *   S.Ord,
	 *   contramap((p: User) => p.name)
	 * )
	 *
	 * const byAge = pipe(
	 *   N.Ord,
	 *   contramap((p: User) => p.age)
	 * )
	 *
	 * const byRememberMe = pipe(
	 *   B.Ord,
	 *   contramap((p: User) => p.rememberMe)
	 * )
	 *
	 * const M = getMonoid<User>()
	 *
	 * const users: Array<User> = [
	 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
	 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
	 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
	 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true }
	 * ]
	 *
	 * // sort by name, then by age, then by `rememberMe`
	 * const O1 = concatAll(M)([byName, byAge, byRememberMe])
	 * assert.deepStrictEqual(sort(O1)(users), [
	 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
	 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
	 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
	 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
	 * ])
	 *
	 * // now `rememberMe = true` first, then by name, then by age
	 * const O2 = concatAll(M)([reverse(byRememberMe), byName, byAge])
	 * assert.deepStrictEqual(sort(O2)(users), [
	 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
	 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
	 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
	 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
	 * ])
	 *
	 * @category instances
	 * @since 2.4.0
	 */
	var getMonoid = function () { return ({
	    concat: (0, exports.getSemigroup)().concat,
	    empty: (0, exports.fromCompare)(function () { return 0; })
	}); };
	exports.getMonoid = getMonoid;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Contravariant = {
	    URI: exports.URI,
	    contramap: contramap_
	};
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.11.0
	 */
	exports.trivial = {
	    equals: function_1.constTrue,
	    compare: /*#__PURE__*/ (0, function_1.constant)(0)
	};
	/**
	 * @since 2.11.0
	 */
	var equals = function (O) {
	    return function (second) {
	        return function (first) {
	            return first === second || O.compare(first, second) === 0;
	        };
	    };
	};
	exports.equals = equals;
	// TODO: curry in v3
	/**
	 * Test whether one value is _strictly less than_ another
	 *
	 * @since 2.0.0
	 */
	var lt = function (O) {
	    return function (first, second) {
	        return O.compare(first, second) === -1;
	    };
	};
	exports.lt = lt;
	// TODO: curry in v3
	/**
	 * Test whether one value is _strictly greater than_ another
	 *
	 * @since 2.0.0
	 */
	var gt = function (O) {
	    return function (first, second) {
	        return O.compare(first, second) === 1;
	    };
	};
	exports.gt = gt;
	// TODO: curry in v3
	/**
	 * Test whether one value is _non-strictly less than_ another
	 *
	 * @since 2.0.0
	 */
	var leq = function (O) {
	    return function (first, second) {
	        return O.compare(first, second) !== 1;
	    };
	};
	exports.leq = leq;
	// TODO: curry in v3
	/**
	 * Test whether one value is _non-strictly greater than_ another
	 *
	 * @since 2.0.0
	 */
	var geq = function (O) {
	    return function (first, second) {
	        return O.compare(first, second) !== -1;
	    };
	};
	exports.geq = geq;
	// TODO: curry in v3
	/**
	 * Take the minimum of two values. If they are considered equal, the first argument is chosen
	 *
	 * @since 2.0.0
	 */
	var min = function (O) {
	    return function (first, second) {
	        return first === second || O.compare(first, second) < 1 ? first : second;
	    };
	};
	exports.min = min;
	// TODO: curry in v3
	/**
	 * Take the maximum of two values. If they are considered equal, the first argument is chosen
	 *
	 * @since 2.0.0
	 */
	var max = function (O) {
	    return function (first, second) {
	        return first === second || O.compare(first, second) > -1 ? first : second;
	    };
	};
	exports.max = max;
	/**
	 * Clamp a value between a minimum and a maximum
	 *
	 * @since 2.0.0
	 */
	var clamp = function (O) {
	    var minO = (0, exports.min)(O);
	    var maxO = (0, exports.max)(O);
	    return function (low, hi) { return function (a) { return maxO(minO(a, hi), low); }; };
	};
	exports.clamp = clamp;
	/**
	 * Test whether a value is between a minimum and a maximum (inclusive)
	 *
	 * @since 2.0.0
	 */
	var between = function (O) {
	    var ltO = (0, exports.lt)(O);
	    var gtO = (0, exports.gt)(O);
	    return function (low, hi) { return function (a) { return ltO(a, low) || gtO(a, hi) ? false : true; }; };
	};
	exports.between = between;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use [`tuple`](#tuple) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getTupleOrd = exports.tuple;
	/**
	 * Use [`reverse`](#reverse) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getDualOrd = exports.reverse;
	/**
	 * Use [`Contravariant`](#contravariant) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.ord = exports.Contravariant;
	// default compare for primitive types
	function compare(first, second) {
	    return first < second ? -1 : first > second ? 1 : 0;
	}
	var strictOrd = {
	    equals: Eq_1.eqStrict.equals,
	    compare: compare
	};
	/**
	 * Use [`Ord`](./boolean.ts.html#ord) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.ordBoolean = strictOrd;
	/**
	 * Use [`Ord`](./string.ts.html#ord) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.ordString = strictOrd;
	/**
	 * Use [`Ord`](./number.ts.html#ord) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.ordNumber = strictOrd;
	/**
	 * Use [`Ord`](./Date.ts.html#ord) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.ordDate = (0, function_1.pipe)(exports.ordNumber, 
	/*#__PURE__*/
	(0, exports.contramap)(function (date) { return date.valueOf(); })); 
} (Ord));

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.semigroupProduct = exports.semigroupSum = exports.semigroupString = exports.getFunctionSemigroup = exports.semigroupAny = exports.semigroupAll = exports.fold = exports.getIntercalateSemigroup = exports.getMeetSemigroup = exports.getJoinSemigroup = exports.getDualSemigroup = exports.getStructSemigroup = exports.getTupleSemigroup = exports.getFirstSemigroup = exports.getLastSemigroup = exports.getObjectSemigroup = exports.semigroupVoid = exports.concatAll = exports.last = exports.first = exports.intercalate = exports.tuple = exports.struct = exports.reverse = exports.constant = exports.max = exports.min = void 0;
	/**
	 * If a type `A` can form a `Semigroup` it has an **associative** binary operation.
	 *
	 * ```ts
	 * interface Semigroup<A> {
	 *   readonly concat: (x: A, y: A) => A
	 * }
	 * ```
	 *
	 * Associativity means the following equality must hold for any choice of `x`, `y`, and `z`.
	 *
	 * ```ts
	 * concat(x, concat(y, z)) = concat(concat(x, y), z)
	 * ```
	 *
	 * A common example of a semigroup is the type `string` with the operation `+`.
	 *
	 * ```ts
	 * import { Semigroup } from 'fp-ts/Semigroup'
	 *
	 * const semigroupString: Semigroup<string> = {
	 *   concat: (x, y) => x + y
	 * }
	 *
	 * const x = 'x'
	 * const y = 'y'
	 * const z = 'z'
	 *
	 * semigroupString.concat(x, y) // 'xy'
	 *
	 * semigroupString.concat(x, semigroupString.concat(y, z)) // 'xyz'
	 *
	 * semigroupString.concat(semigroupString.concat(x, y), z) // 'xyz'
	 * ```
	 *
	 * *Adapted from https://typelevel.org/cats*
	 *
	 * @since 2.0.0
	 */
	var function_1 = _function;
	var _ = __importStar(internal);
	var M = __importStar(Magma);
	var Or = __importStar(Ord);
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * Get a semigroup where `concat` will return the minimum, based on the provided order.
	 *
	 * @example
	 * import * as N from 'fp-ts/number'
	 * import * as S from 'fp-ts/Semigroup'
	 *
	 * const S1 = S.min(N.Ord)
	 *
	 * assert.deepStrictEqual(S1.concat(1, 2), 1)
	 *
	 * @category constructors
	 * @since 2.10.0
	 */
	var min = function (O) { return ({
	    concat: Or.min(O)
	}); };
	exports.min = min;
	/**
	 * Get a semigroup where `concat` will return the maximum, based on the provided order.
	 *
	 * @example
	 * import * as N from 'fp-ts/number'
	 * import * as S from 'fp-ts/Semigroup'
	 *
	 * const S1 = S.max(N.Ord)
	 *
	 * assert.deepStrictEqual(S1.concat(1, 2), 2)
	 *
	 * @category constructors
	 * @since 2.10.0
	 */
	var max = function (O) { return ({
	    concat: Or.max(O)
	}); };
	exports.max = max;
	/**
	 * @category constructors
	 * @since 2.10.0
	 */
	var constant = function (a) { return ({
	    concat: function () { return a; }
	}); };
	exports.constant = constant;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * The dual of a `Semigroup`, obtained by swapping the arguments of `concat`.
	 *
	 * @example
	 * import { reverse } from 'fp-ts/Semigroup'
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(reverse(S.Semigroup).concat('a', 'b'), 'ba')
	 *
	 * @since 2.10.0
	 */
	exports.reverse = M.reverse;
	/**
	 * Given a struct of semigroups returns a semigroup for the struct.
	 *
	 * @example
	 * import { struct } from 'fp-ts/Semigroup'
	 * import * as N from 'fp-ts/number'
	 *
	 * interface Point {
	 *   readonly x: number
	 *   readonly y: number
	 * }
	 *
	 * const S = struct<Point>({
	 *   x: N.SemigroupSum,
	 *   y: N.SemigroupSum
	 * })
	 *
	 * assert.deepStrictEqual(S.concat({ x: 1, y: 2 }, { x: 3, y: 4 }), { x: 4, y: 6 })
	 *
	 * @since 2.10.0
	 */
	var struct = function (semigroups) { return ({
	    concat: function (first, second) {
	        var r = {};
	        for (var k in semigroups) {
	            if (_.has.call(semigroups, k)) {
	                r[k] = semigroups[k].concat(first[k], second[k]);
	            }
	        }
	        return r;
	    }
	}); };
	exports.struct = struct;
	/**
	 * Given a tuple of semigroups returns a semigroup for the tuple.
	 *
	 * @example
	 * import { tuple } from 'fp-ts/Semigroup'
	 * import * as B from 'fp-ts/boolean'
	 * import * as N from 'fp-ts/number'
	 * import * as S from 'fp-ts/string'
	 *
	 * const S1 = tuple(S.Semigroup, N.SemigroupSum)
	 * assert.deepStrictEqual(S1.concat(['a', 1], ['b', 2]), ['ab', 3])
	 *
	 * const S2 = tuple(S.Semigroup, N.SemigroupSum, B.SemigroupAll)
	 * assert.deepStrictEqual(S2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
	 *
	 * @since 2.10.0
	 */
	var tuple = function () {
	    var semigroups = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        semigroups[_i] = arguments[_i];
	    }
	    return ({
	        concat: function (first, second) { return semigroups.map(function (s, i) { return s.concat(first[i], second[i]); }); }
	    });
	};
	exports.tuple = tuple;
	/**
	 * Between each pair of elements insert `middle`.
	 *
	 * @example
	 * import { intercalate } from 'fp-ts/Semigroup'
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const S1 = pipe(S.Semigroup, intercalate(' + '))
	 *
	 * assert.strictEqual(S1.concat('a', 'b'), 'a + b')
	 *
	 * @since 2.10.0
	 */
	var intercalate = function (middle) {
	    return function (S) { return ({
	        concat: function (x, y) { return S.concat(x, S.concat(middle, y)); }
	    }); };
	};
	exports.intercalate = intercalate;
	// -------------------------------------------------------------------------------------
	// instances
	// -------------------------------------------------------------------------------------
	/**
	 * Always return the first argument.
	 *
	 * @example
	 * import * as S from 'fp-ts/Semigroup'
	 *
	 * assert.deepStrictEqual(S.first<number>().concat(1, 2), 1)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	var first = function () { return ({ concat: function_1.identity }); };
	exports.first = first;
	/**
	 * Always return the last argument.
	 *
	 * @example
	 * import * as S from 'fp-ts/Semigroup'
	 *
	 * assert.deepStrictEqual(S.last<number>().concat(1, 2), 2)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	var last = function () { return ({ concat: function (_, y) { return y; } }); };
	exports.last = last;
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * Given a sequence of `as`, concat them and return the total.
	 *
	 * If `as` is empty, return the provided `startWith` value.
	 *
	 * @example
	 * import { concatAll } from 'fp-ts/Semigroup'
	 * import * as N from 'fp-ts/number'
	 *
	 * const sum = concatAll(N.SemigroupSum)(0)
	 *
	 * assert.deepStrictEqual(sum([1, 2, 3]), 6)
	 * assert.deepStrictEqual(sum([]), 0)
	 *
	 * @since 2.10.0
	 */
	exports.concatAll = M.concatAll;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use `void` module instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupVoid = (0, exports.constant)(undefined);
	/**
	 * Use [`getAssignSemigroup`](./struct.ts.html#getAssignSemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getObjectSemigroup = function () { return ({
	    concat: function (first, second) { return Object.assign({}, first, second); }
	}); };
	exports.getObjectSemigroup = getObjectSemigroup;
	/**
	 * Use [`last`](#last) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getLastSemigroup = exports.last;
	/**
	 * Use [`first`](#first) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getFirstSemigroup = exports.first;
	/**
	 * Use [`tuple`](#tuple) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getTupleSemigroup = exports.tuple;
	/**
	 * Use [`struct`](#struct) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getStructSemigroup = exports.struct;
	/**
	 * Use [`reverse`](#reverse) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getDualSemigroup = exports.reverse;
	/**
	 * Use [`max`](#max) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getJoinSemigroup = exports.max;
	/**
	 * Use [`min`](#min) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getMeetSemigroup = exports.min;
	/**
	 * Use [`intercalate`](#intercalate) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.getIntercalateSemigroup = exports.intercalate;
	function fold(S) {
	    var concatAllS = (0, exports.concatAll)(S);
	    return function (startWith, as) { return (as === undefined ? concatAllS(startWith) : concatAllS(startWith)(as)); };
	}
	exports.fold = fold;
	/**
	 * Use [`SemigroupAll`](./boolean.ts.html#SemigroupAll) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupAll = {
	    concat: function (x, y) { return x && y; }
	};
	/**
	 * Use [`SemigroupAny`](./boolean.ts.html#SemigroupAny) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupAny = {
	    concat: function (x, y) { return x || y; }
	};
	/**
	 * Use [`getSemigroup`](./function.ts.html#getSemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getFunctionSemigroup = function_1.getSemigroup;
	/**
	 * Use [`Semigroup`](./string.ts.html#Semigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupString = {
	    concat: function (x, y) { return x + y; }
	};
	/**
	 * Use [`SemigroupSum`](./number.ts.html#SemigroupSum) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupSum = {
	    concat: function (x, y) { return x + y; }
	};
	/**
	 * Use [`SemigroupProduct`](./number.ts.html#SemigroupProduct) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.semigroupProduct = {
	    concat: function (x, y) { return x * y; }
	}; 
} (Semigroup));

var Separated = {};

(function (exports) {
	/**
	 * ```ts
	 * interface Separated<E, A> {
	 *    readonly left: E
	 *    readonly right: A
	 * }
	 * ```
	 *
	 * Represents a result of separating a whole into two parts.
	 *
	 * @since 2.10.0
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.right = exports.left = exports.flap = exports.Functor = exports.Bifunctor = exports.URI = exports.bimap = exports.mapLeft = exports.map = exports.separated = void 0;
	var function_1 = _function;
	var Functor_1 = Functor;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * @category constructors
	 * @since 2.10.0
	 */
	var separated = function (left, right) { return ({ left: left, right: right }); };
	exports.separated = separated;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _mapLeft = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapLeft)(f)); };
	var _bimap = function (fa, g, f) { return (0, function_1.pipe)(fa, (0, exports.bimap)(g, f)); };
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.10.0
	 */
	var map = function (f) {
	    return function (fa) {
	        return (0, exports.separated)((0, exports.left)(fa), f((0, exports.right)(fa)));
	    };
	};
	exports.map = map;
	/**
	 * Map a function over the first type argument of a bifunctor.
	 *
	 * @category error handling
	 * @since 2.10.0
	 */
	var mapLeft = function (f) {
	    return function (fa) {
	        return (0, exports.separated)(f((0, exports.left)(fa)), (0, exports.right)(fa));
	    };
	};
	exports.mapLeft = mapLeft;
	/**
	 * Map a pair of functions over the two type arguments of the bifunctor.
	 *
	 * @category mapping
	 * @since 2.10.0
	 */
	var bimap = function (f, g) {
	    return function (fa) {
	        return (0, exports.separated)(f((0, exports.left)(fa)), g((0, exports.right)(fa)));
	    };
	};
	exports.bimap = bimap;
	/**
	 * @category type lambdas
	 * @since 2.10.0
	 */
	exports.URI = 'Separated';
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Bifunctor = {
	    URI: exports.URI,
	    mapLeft: _mapLeft,
	    bimap: _bimap
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.10.0
	 */
	var left = function (s) { return s.left; };
	exports.left = left;
	/**
	 * @since 2.10.0
	 */
	var right = function (s) { return s.right; };
	exports.right = right; 
} (Separated));

var Witherable = {};

var __createBinding$2 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$2 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$2 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$2(result, mod, k);
    __setModuleDefault$2(result, mod);
    return result;
};
Object.defineProperty(Witherable, "__esModule", { value: true });
Witherable.filterE = Witherable.witherDefault = Witherable.wiltDefault = void 0;
var _ = __importStar$2(internal);
function wiltDefault$1(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.separate); };
    };
}
Witherable.wiltDefault = wiltDefault$1;
function witherDefault$1(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.compact); };
    };
}
Witherable.witherDefault = witherDefault$1;
function filterE(W) {
    return function (F) {
        var witherF = W.wither(F);
        return function (predicate) { return function (ga) { return witherF(ga, function (a) { return F.map(predicate(a), function (b) { return (b ? _.some(a) : _.none); }); }); }; };
    };
}
Witherable.filterE = filterE;

var Zero = {};

Object.defineProperty(Zero, "__esModule", { value: true });
Zero.guard = void 0;
function guard(F, P) {
    return function (b) { return (b ? P.of(undefined) : F.zero()); };
}
Zero.guard = guard;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Witherable = exports.wilt = exports.wither = exports.Traversable = exports.sequence = exports.traverse = exports.Filterable = exports.partitionMap = exports.partition = exports.filterMap = exports.filter = exports.Compactable = exports.separate = exports.compact = exports.Extend = exports.extend = exports.Alternative = exports.guard = exports.Zero = exports.zero = exports.Alt = exports.alt = exports.altW = exports.orElse = exports.Foldable = exports.reduceRight = exports.foldMap = exports.reduce = exports.Monad = exports.Chain = exports.flatMap = exports.Applicative = exports.Apply = exports.ap = exports.Pointed = exports.of = exports.asUnit = exports.as = exports.Functor = exports.map = exports.getMonoid = exports.getOrd = exports.getEq = exports.getShow = exports.URI = exports.getRight = exports.getLeft = exports.fromPredicate = exports.some = exports.none = void 0;
	exports.getFirstMonoid = exports.getApplyMonoid = exports.getApplySemigroup = exports.option = exports.mapNullable = exports.getRefinement = exports.chainFirst = exports.chain = exports.sequenceArray = exports.traverseArray = exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex = exports.traverseReadonlyNonEmptyArrayWithIndex = exports.ApT = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.exists = exports.elem = exports.toUndefined = exports.toNullable = exports.chainNullableK = exports.fromNullableK = exports.tryCatchK = exports.tryCatch = exports.fromNullable = exports.chainFirstEitherK = exports.chainEitherK = exports.fromEitherK = exports.duplicate = exports.tapEither = exports.tap = exports.flatten = exports.apSecond = exports.apFirst = exports.flap = exports.getOrElse = exports.getOrElseW = exports.fold = exports.match = exports.foldW = exports.matchW = exports.isNone = exports.isSome = exports.FromEither = exports.fromEither = exports.MonadThrow = exports.throwError = void 0;
	exports.getLastMonoid = void 0;
	var Applicative_1 = Applicative;
	var Apply_1 = Apply;
	var chainable = __importStar(Chain);
	var FromEither_1 = FromEither;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var Predicate_1 = Predicate;
	var Semigroup_1 = Semigroup;
	var Separated_1 = Separated;
	var Witherable_1 = Witherable;
	var Zero_1 = Zero;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * `None` doesn't have a constructor, instead you can use it directly as a value. Represents a missing value.
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.none = _.none;
	/**
	 * Constructs a `Some`. Represents an optional value that exists.
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.some = _.some;
	function fromPredicate(predicate) {
	    return function (a) { return (predicate(a) ? (0, exports.some)(a) : exports.none); };
	}
	exports.fromPredicate = fromPredicate;
	/**
	 * Returns the `Left` value of an `Either` if possible.
	 *
	 * @example
	 * import { getLeft, none, some } from 'fp-ts/Option'
	 * import { right, left } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(getLeft(right(1)), none)
	 * assert.deepStrictEqual(getLeft(left('a')), some('a'))
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	var getLeft = function (ma) { return (ma._tag === 'Right' ? exports.none : (0, exports.some)(ma.left)); };
	exports.getLeft = getLeft;
	/**
	 * Returns the `Right` value of an `Either` if possible.
	 *
	 * @example
	 * import { getRight, none, some } from 'fp-ts/Option'
	 * import { right, left } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(getRight(right(1)), some(1))
	 * assert.deepStrictEqual(getRight(left('a')), none)
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	var getRight = function (ma) { return (ma._tag === 'Left' ? exports.none : (0, exports.some)(ma.right)); };
	exports.getRight = getRight;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	var _foldMap = function (M) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapM(f)); };
	};
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	var _filter = function (fa, predicate) { return (0, function_1.pipe)(fa, (0, exports.filter)(predicate)); };
	/* istanbul ignore next */
	var _filterMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.filterMap)(f)); };
	/* istanbul ignore next */
	var _extend = function (wa, f) { return (0, function_1.pipe)(wa, (0, exports.extend)(f)); };
	/* istanbul ignore next */
	var _partition = function (fa, predicate) {
	    return (0, function_1.pipe)(fa, (0, exports.partition)(predicate));
	};
	/* istanbul ignore next */
	var _partitionMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.partitionMap)(f)); };
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Option';
	/**
	 * @category instances
	 * @since 2.0.0
	 */
	var getShow = function (S) { return ({
	    show: function (ma) { return ((0, exports.isNone)(ma) ? 'none' : "some(".concat(S.show(ma.value), ")")); }
	}); };
	exports.getShow = getShow;
	/**
	 * @example
	 * import { none, some, getEq } from 'fp-ts/Option'
	 * import * as N from 'fp-ts/number'
	 *
	 * const E = getEq(N.Eq)
	 * assert.strictEqual(E.equals(none, none), true)
	 * assert.strictEqual(E.equals(none, some(1)), false)
	 * assert.strictEqual(E.equals(some(1), none), false)
	 * assert.strictEqual(E.equals(some(1), some(2)), false)
	 * assert.strictEqual(E.equals(some(1), some(1)), true)
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getEq = function (E) { return ({
	    equals: function (x, y) { return x === y || ((0, exports.isNone)(x) ? (0, exports.isNone)(y) : (0, exports.isNone)(y) ? false : E.equals(x.value, y.value)); }
	}); };
	exports.getEq = getEq;
	/**
	 * The `Ord` instance allows `Option` values to be compared with
	 * `compare`, whenever there is an `Ord` instance for
	 * the type the `Option` contains.
	 *
	 * `None` is considered to be less than any `Some` value.
	 *
	 *
	 * @example
	 * import { none, some, getOrd } from 'fp-ts/Option'
	 * import * as N from 'fp-ts/number'
	 *
	 * const O = getOrd(N.Ord)
	 * assert.strictEqual(O.compare(none, none), 0)
	 * assert.strictEqual(O.compare(none, some(1)), -1)
	 * assert.strictEqual(O.compare(some(1), none), 1)
	 * assert.strictEqual(O.compare(some(1), some(2)), -1)
	 * assert.strictEqual(O.compare(some(1), some(1)), 0)
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getOrd = function (O) { return ({
	    equals: (0, exports.getEq)(O).equals,
	    compare: function (x, y) { return (x === y ? 0 : (0, exports.isSome)(x) ? ((0, exports.isSome)(y) ? O.compare(x.value, y.value) : 1) : -1); }
	}); };
	exports.getOrd = getOrd;
	/**
	 * Monoid returning the left-most non-`None` value. If both operands are `Some`s then the inner values are
	 * concatenated using the provided `Semigroup`
	 *
	 * | x       | y       | concat(x, y)       |
	 * | ------- | ------- | ------------------ |
	 * | none    | none    | none               |
	 * | some(a) | none    | some(a)            |
	 * | none    | some(b) | some(b)            |
	 * | some(a) | some(b) | some(concat(a, b)) |
	 *
	 * @example
	 * import { getMonoid, some, none } from 'fp-ts/Option'
	 * import { SemigroupSum } from 'fp-ts/number'
	 *
	 * const M = getMonoid(SemigroupSum)
	 * assert.deepStrictEqual(M.concat(none, none), none)
	 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
	 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
	 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(3))
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getMonoid = function (S) { return ({
	    concat: function (x, y) { return ((0, exports.isNone)(x) ? y : (0, exports.isNone)(y) ? x : (0, exports.some)(S.concat(x.value, y.value))); },
	    empty: exports.none
	}); };
	exports.getMonoid = getMonoid;
	/**
	 * @category mapping
	 * @since 2.0.0
	 */
	var map = function (f) { return function (fa) {
	    return (0, exports.isNone)(fa) ? exports.none : (0, exports.some)(f(fa.value));
	}; };
	exports.map = map;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * Maps the `Some` value of this `Option` to the specified constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.as = (0, function_1.dual)(2, (0, Functor_1.as)(exports.Functor));
	/**
	 * Maps the `Some` value of this `Option` to the void constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.asUnit = (0, Functor_1.asUnit)(exports.Functor);
	/**
	 * @category constructors
	 * @since 2.7.0
	 */
	exports.of = exports.some;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * @since 2.0.0
	 */
	var ap = function (fa) { return function (fab) {
	    return (0, exports.isNone)(fab) ? exports.none : (0, exports.isNone)(fa) ? exports.none : (0, exports.some)(fab.value(fa.value));
	}; };
	exports.ap = ap;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) { return ((0, exports.isNone)(ma) ? exports.none : f(ma.value)); });
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	var reduce = function (b, f) { return function (fa) {
	    return (0, exports.isNone)(fa) ? b : f(b, fa.value);
	}; };
	exports.reduce = reduce;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	var foldMap = function (M) { return function (f) { return function (fa) {
	    return (0, exports.isNone)(fa) ? M.empty : f(fa.value);
	}; }; };
	exports.foldMap = foldMap;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	var reduceRight = function (b, f) { return function (fa) {
	    return (0, exports.isNone)(fa) ? b : f(fa.value, b);
	}; };
	exports.reduceRight = reduceRight;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * Returns the provided `Option` `that` if `self` is `None`, otherwise returns `self`.
	 *
	 * @param self - The first `Option` to be checked.
	 * @param that - The `Option` to return if `self` is `None`.
	 *
	 * @example
	 * import * as O from "fp-ts/Option"
	 *
	 * assert.deepStrictEqual(O.orElse(O.none, () => O.none), O.none)
	 * assert.deepStrictEqual(O.orElse(O.some(1), () => O.none), O.some(1))
	 * assert.deepStrictEqual(O.orElse(O.none, () => O.some('b')), O.some('b'))
	 * assert.deepStrictEqual(O.orElse(O.some(1), () => O.some('b')), O.some(1))
	 *
	 * @category error handling
	 * @since 2.16.0
	 */
	exports.orElse = (0, function_1.dual)(2, function (self, that) { return ((0, exports.isNone)(self) ? that() : self); });
	/**
	 * Alias of `orElse`.
	 *
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @category legacy
	 * @since 2.9.0
	 */
	exports.altW = exports.orElse;
	/**
	 * Alias of `orElse`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.alt = exports.orElse;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @since 2.7.0
	 */
	var zero = function () { return exports.none; };
	exports.zero = zero;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.Zero = {
	    URI: exports.URI,
	    zero: exports.zero
	};
	/**
	 * @category do notation
	 * @since 2.11.0
	 */
	exports.guard = (0, Zero_1.guard)(exports.Zero, exports.Pointed);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alternative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    alt: _alt,
	    zero: exports.zero
	};
	/**
	 * @since 2.0.0
	 */
	var extend = function (f) { return function (wa) {
	    return (0, exports.isNone)(wa) ? exports.none : (0, exports.some)(f(wa));
	}; };
	exports.extend = extend;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Extend = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend
	};
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	exports.compact = (0, exports.flatMap)(function_1.identity);
	var defaultSeparated = /*#__PURE__*/ (0, Separated_1.separated)(exports.none, exports.none);
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	var separate = function (ma) {
	    return (0, exports.isNone)(ma) ? defaultSeparated : (0, Separated_1.separated)((0, exports.getLeft)(ma.value), (0, exports.getRight)(ma.value));
	};
	exports.separate = separate;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Compactable = {
	    URI: exports.URI,
	    compact: exports.compact,
	    separate: exports.separate
	};
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	var filter = function (predicate) {
	    return function (fa) {
	        return (0, exports.isNone)(fa) ? exports.none : predicate(fa.value) ? fa : exports.none;
	    };
	};
	exports.filter = filter;
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	var filterMap = function (f) { return function (fa) {
	    return (0, exports.isNone)(fa) ? exports.none : f(fa.value);
	}; };
	exports.filterMap = filterMap;
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	var partition = function (predicate) {
	    return function (fa) {
	        return (0, Separated_1.separated)(_filter(fa, (0, Predicate_1.not)(predicate)), _filter(fa, predicate));
	    };
	};
	exports.partition = partition;
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	var partitionMap = function (f) { return (0, function_1.flow)((0, exports.map)(f), exports.separate); };
	exports.partitionMap = partitionMap;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Filterable = {
	    URI: exports.URI,
	    map: _map,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap
	};
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    return function (f) {
	        return function (ta) {
	            return (0, exports.isNone)(ta) ? F.of(exports.none) : F.map(f(ta.value), exports.some);
	        };
	    };
	};
	exports.traverse = traverse;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) {
	    return function (ta) {
	        return (0, exports.isNone)(ta) ? F.of(exports.none) : F.map(ta.value, exports.some);
	    };
	};
	exports.sequence = sequence;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	var _wither = /*#__PURE__*/ (0, Witherable_1.witherDefault)(exports.Traversable, exports.Compactable);
	var _wilt = /*#__PURE__*/ (0, Witherable_1.wiltDefault)(exports.Traversable, exports.Compactable);
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wither = function (F) {
	    var _witherF = _wither(F);
	    return function (f) { return function (fa) { return _witherF(fa, f); }; };
	};
	exports.wither = wither;
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wilt = function (F) {
	    var _wiltF = _wilt(F);
	    return function (f) { return function (fa) { return _wiltF(fa, f); }; };
	};
	exports.wilt = wilt;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Witherable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    wither: _wither,
	    wilt: _wilt
	};
	/**
	 * @since 2.7.0
	 */
	var throwError = function () { return exports.none; };
	exports.throwError = throwError;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.MonadThrow = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap,
	    throwError: exports.throwError
	};
	/**
	 * Transforms an `Either` to an `Option` discarding the error.
	 *
	 * Alias of [getRight](#getright)
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.fromEither = exports.getRight;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.FromEither = {
	    URI: exports.URI,
	    fromEither: exports.fromEither
	};
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * Returns `true` if the option is an instance of `Some`, `false` otherwise.
	 *
	 * @example
	 * import { some, none, isSome } from 'fp-ts/Option'
	 *
	 * assert.strictEqual(isSome(some(1)), true)
	 * assert.strictEqual(isSome(none), false)
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	exports.isSome = _.isSome;
	/**
	 * Returns `true` if the option is `None`, `false` otherwise.
	 *
	 * @example
	 * import { some, none, isNone } from 'fp-ts/Option'
	 *
	 * assert.strictEqual(isNone(some(1)), false)
	 * assert.strictEqual(isNone(none), true)
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	var isNone = function (fa) { return fa._tag === 'None'; };
	exports.isNone = isNone;
	/**
	 * Less strict version of [`match`](#match).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	var matchW = function (onNone, onSome) {
	    return function (ma) {
	        return (0, exports.isNone)(ma) ? onNone() : onSome(ma.value);
	    };
	};
	exports.matchW = matchW;
	/**
	 * Alias of [`matchW`](#matchw).
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.foldW = exports.matchW;
	/**
	 * Takes a (lazy) default value, a function, and an `Option` value, if the `Option` value is `None` the default value is
	 * returned, otherwise the function is applied to the value inside the `Some` and the result is returned.
	 *
	 * @example
	 * import { some, none, match } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     match(() => 'a none', a => `a some containing ${a}`)
	 *   ),
	 *   'a some containing 1'
	 * )
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     none,
	 *     match(() => 'a none', a => `a some containing ${a}`)
	 *   ),
	 *   'a none'
	 * )
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.match = exports.matchW;
	/**
	 * Alias of [`match`](#match).
	 *
	 * @category pattern matching
	 * @since 2.0.0
	 */
	exports.fold = exports.match;
	/**
	 * Less strict version of [`getOrElse`](#getorelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return type will be merged.
	 *
	 * @category error handling
	 * @since 2.6.0
	 */
	var getOrElseW = function (onNone) {
	    return function (ma) {
	        return (0, exports.isNone)(ma) ? onNone() : ma.value;
	    };
	};
	exports.getOrElseW = getOrElseW;
	/**
	 * Extracts the value out of the structure, if it exists. Otherwise returns the given default value
	 *
	 * @example
	 * import { some, none, getOrElse } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     getOrElse(() => 0)
	 *   ),
	 *   1
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     none,
	 *     getOrElse(() => 0)
	 *   ),
	 *   0
	 * )
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.getOrElse = exports.getOrElseW;
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.0.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.0.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * @category sequencing
	 * @since 2.0.0
	 */
	exports.flatten = exports.compact;
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @category combinators
	 * @since 2.15.0
	 */
	exports.tap = (0, function_1.dual)(2, chainable.tap(exports.Chain));
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as O from 'fp-ts/Option'
	 * import * as E from 'fp-ts/Either'
	 *
	 * const compute = (value: number) => pipe(
	 *   O.of(value),
	 *   O.tapEither((value) => value > 0 ? E.right('ok') : E.left('error')),
	 * )
	 *
	 * assert.deepStrictEqual(compute(1), O.of(1))
	 * assert.deepStrictEqual(compute(-42), O.none)
	 *
	 * @category combinators
	 * @since 2.16.0
	 */
	exports.tapEither = (0, function_1.dual)(2, (0, FromEither_1.tapEither)(exports.FromEither, exports.Chain));
	/**
	 * @since 2.0.0
	 */
	exports.duplicate = (0, exports.extend)(function_1.identity);
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	exports.fromEitherK = (0, FromEither_1.fromEitherK)(exports.FromEither);
	/**
	 * @category sequencing
	 * @since 2.11.0
	 */
	exports.chainEitherK = 
	/*#__PURE__*/ (0, FromEither_1.chainEitherK)(exports.FromEither, exports.Chain);
	/**
	 * Alias of `tapEither`.
	 *
	 * @category legacy
	 * @since 2.12.0
	 */
	exports.chainFirstEitherK = exports.tapEither;
	/**
	 * Constructs a new `Option` from a nullable type. If the value is `null` or `undefined`, returns `None`, otherwise
	 * returns the value wrapped in a `Some`.
	 *
	 * @example
	 * import { none, some, fromNullable } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(fromNullable(undefined), none)
	 * assert.deepStrictEqual(fromNullable(null), none)
	 * assert.deepStrictEqual(fromNullable(1), some(1))
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	var fromNullable = function (a) { return (a == null ? exports.none : (0, exports.some)(a)); };
	exports.fromNullable = fromNullable;
	/**
	 * Transforms an exception into an `Option`. If `f` throws, returns `None`, otherwise returns the output wrapped in a
	 * `Some`.
	 *
	 * See also [`tryCatchK`](#trycatchk).
	 *
	 * @example
	 * import { none, some, tryCatch } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(
	 *   tryCatch(() => {
	 *     throw new Error()
	 *   }),
	 *   none
	 * )
	 * assert.deepStrictEqual(tryCatch(() => 1), some(1))
	 *
	 * @category interop
	 * @since 2.0.0
	 */
	var tryCatch = function (f) {
	    try {
	        return (0, exports.some)(f());
	    }
	    catch (e) {
	        return exports.none;
	    }
	};
	exports.tryCatch = tryCatch;
	/**
	 * Converts a function that may throw to one returning a `Option`.
	 *
	 * @category interop
	 * @since 2.10.0
	 */
	var tryCatchK = function (f) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return (0, exports.tryCatch)(function () { return f.apply(void 0, a); });
	    };
	};
	exports.tryCatchK = tryCatchK;
	/**
	 * Returns a *smart constructor* from a function that returns a nullable value.
	 *
	 * @example
	 * import { fromNullableK, none, some } from 'fp-ts/Option'
	 *
	 * const f = (s: string): number | undefined => {
	 *   const n = parseFloat(s)
	 *   return isNaN(n) ? undefined : n
	 * }
	 *
	 * const g = fromNullableK(f)
	 *
	 * assert.deepStrictEqual(g('1'), some(1))
	 * assert.deepStrictEqual(g('a'), none)
	 *
	 * @category lifting
	 * @since 2.9.0
	 */
	var fromNullableK = function (f) { return (0, function_1.flow)(f, exports.fromNullable); };
	exports.fromNullableK = fromNullableK;
	/**
	 * This is `chain` + `fromNullable`, useful when working with optional values.
	 *
	 * @example
	 * import { some, none, fromNullable, chainNullableK } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * interface Employee {
	 *   readonly company?: {
	 *     readonly address?: {
	 *       readonly street?: {
	 *         readonly name?: string
	 *       }
	 *     }
	 *   }
	 * }
	 *
	 * const employee1: Employee = { company: { address: { street: { name: 'high street' } } } }
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     fromNullable(employee1.company),
	 *     chainNullableK(company => company.address),
	 *     chainNullableK(address => address.street),
	 *     chainNullableK(street => street.name)
	 *   ),
	 *   some('high street')
	 * )
	 *
	 * const employee2: Employee = { company: { address: { street: {} } } }
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     fromNullable(employee2.company),
	 *     chainNullableK(company => company.address),
	 *     chainNullableK(address => address.street),
	 *     chainNullableK(street => street.name)
	 *   ),
	 *   none
	 * )
	 *
	 * @category sequencing
	 * @since 2.9.0
	 */
	var chainNullableK = function (f) {
	    return function (ma) {
	        return (0, exports.isNone)(ma) ? exports.none : (0, exports.fromNullable)(f(ma.value));
	    };
	};
	exports.chainNullableK = chainNullableK;
	/**
	 * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
	 *
	 * @example
	 * import { some, none, toNullable } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     toNullable
	 *   ),
	 *   1
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     none,
	 *     toNullable
	 *   ),
	 *   null
	 * )
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.toNullable = (0, exports.match)(function_1.constNull, function_1.identity);
	/**
	 * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
	 *
	 * @example
	 * import { some, none, toUndefined } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     toUndefined
	 *   ),
	 *   1
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     none,
	 *     toUndefined
	 *   ),
	 *   undefined
	 * )
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.toUndefined = (0, exports.match)(function_1.constUndefined, function_1.identity);
	function elem(E) {
	    return function (a, ma) {
	        if (ma === undefined) {
	            var elemE_1 = elem(E);
	            return function (ma) { return elemE_1(a, ma); };
	        }
	        return (0, exports.isNone)(ma) ? false : E.equals(a, ma.value);
	    };
	}
	exports.elem = elem;
	/**
	 * Returns `true` if the predicate is satisfied by the wrapped value
	 *
	 * @example
	 * import { some, none, exists } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     exists(n => n > 0)
	 *   ),
	 *   true
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     some(1),
	 *     exists(n => n > 1)
	 *   ),
	 *   false
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     none,
	 *     exists(n => n > 0)
	 *   ),
	 *   false
	 * )
	 *
	 * @since 2.0.0
	 */
	var exists = function (predicate) {
	    return function (ma) {
	        return (0, exports.isNone)(ma) ? false : predicate(ma.value);
	    };
	};
	exports.exists = exists;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = chainable.bind(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	/**
	 * @since 2.11.0
	 */
	exports.ApT = (0, exports.of)(_.emptyReadonlyArray);
	// -------------------------------------------------------------------------------------
	// array utils
	// -------------------------------------------------------------------------------------
	/**
	 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndex = function (f) {
	    return function (as) {
	        var o = f(0, _.head(as));
	        if ((0, exports.isNone)(o)) {
	            return exports.none;
	        }
	        var out = [o.value];
	        for (var i = 1; i < as.length; i++) {
	            var o_1 = f(i, as[i]);
	            if ((0, exports.isNone)(o_1)) {
	                return exports.none;
	            }
	            out.push(o_1.value);
	        }
	        return (0, exports.some)(out);
	    };
	};
	exports.traverseReadonlyNonEmptyArrayWithIndex = traverseReadonlyNonEmptyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndex = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndex)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndex = traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseArray = function (f) {
	    return (0, exports.traverseReadonlyArrayWithIndex)(function (_, a) { return f(a); });
	};
	exports.traverseArray = traverseArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceArray = 
	/*#__PURE__*/ (0, exports.traverseArray)(function_1.identity);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chainFirst = exports.tap;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use `Refinement` module instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	function getRefinement(getOption) {
	    return function (a) { return (0, exports.isSome)(getOption(a)); };
	}
	exports.getRefinement = getRefinement;
	/**
	 * Use [`chainNullableK`](#chainnullablek) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.mapNullable = exports.chainNullableK;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `O.Functor` instead of `O.option`
	 * (where `O` is from `import O from 'fp-ts/Option'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.option = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _ap,
	    chain: exports.flatMap,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    zero: exports.zero,
	    alt: _alt,
	    extend: _extend,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    wither: _wither,
	    wilt: _wilt,
	    throwError: exports.throwError
	};
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplySemigroup = (0, Apply_1.getApplySemigroup)(exports.Apply);
	/**
	 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplyMonoid = (0, Applicative_1.getApplicativeMonoid)(exports.Applicative);
	/**
	 * Use
	 *
	 * ```ts
	 * import { first } from 'fp-ts/Semigroup'
	 * import { getMonoid } from 'fp-ts/Option'
	 *
	 * getMonoid(first())
	 * ```
	 *
	 * instead.
	 *
	 * Monoid returning the left-most non-`None` value
	 *
	 * | x       | y       | concat(x, y) |
	 * | ------- | ------- | ------------ |
	 * | none    | none    | none         |
	 * | some(a) | none    | some(a)      |
	 * | none    | some(b) | some(b)      |
	 * | some(a) | some(b) | some(a)      |
	 *
	 * @example
	 * import { getFirstMonoid, some, none } from 'fp-ts/Option'
	 *
	 * const M = getFirstMonoid<number>()
	 * assert.deepStrictEqual(M.concat(none, none), none)
	 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
	 * assert.deepStrictEqual(M.concat(none, some(2)), some(2))
	 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(1))
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getFirstMonoid = function () { return (0, exports.getMonoid)((0, Semigroup_1.first)()); };
	exports.getFirstMonoid = getFirstMonoid;
	/**
	 * Use
	 *
	 * ```ts
	 * import { last } from 'fp-ts/Semigroup'
	 * import { getMonoid } from 'fp-ts/Option'
	 *
	 * getMonoid(last())
	 * ```
	 *
	 * instead.
	 *
	 * Monoid returning the right-most non-`None` value
	 *
	 * | x       | y       | concat(x, y) |
	 * | ------- | ------- | ------------ |
	 * | none    | none    | none         |
	 * | some(a) | none    | some(a)      |
	 * | none    | some(b) | some(b)      |
	 * | some(a) | some(b) | some(b)      |
	 *
	 * @example
	 * import { getLastMonoid, some, none } from 'fp-ts/Option'
	 *
	 * const M = getLastMonoid<number>()
	 * assert.deepStrictEqual(M.concat(none, none), none)
	 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
	 * assert.deepStrictEqual(M.concat(none, some(2)), some(2))
	 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(2))
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getLastMonoid = function () { return (0, exports.getMonoid)((0, Semigroup_1.last)()); };
	exports.getLastMonoid = getLastMonoid; 
} (Option));

var __createBinding$1 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$1 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$1 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
    __setModuleDefault$1(result, mod);
    return result;
};
Object.defineProperty(Compactable$1, "__esModule", { value: true });
Compactable$1.getCompactableComposition = Compactable$1.separate = Compactable$1.compact = void 0;
var function_1$4 = _function;
var Functor_1$2 = Functor;
var Option_1$1 = Option;
var S = __importStar$1(Separated);
function compact$1(F, G) {
    return function (fga) { return F.map(fga, G.compact); };
}
Compactable$1.compact = compact$1;
function separate$1(F, C, G) {
    var _compact = compact$1(F, C);
    var _map = (0, Functor_1$2.map)(F, G);
    return function (fge) { return S.separated(_compact((0, function_1$4.pipe)(fge, _map(Option_1$1.getLeft))), _compact((0, function_1$4.pipe)(fge, _map(Option_1$1.getRight)))); };
}
Compactable$1.separate = separate$1;
/** @deprecated */
function getCompactableComposition(F, G) {
    var map = (0, Functor_1$2.getFunctorComposition)(F, G).map;
    return {
        map: map,
        compact: compact$1(F, G),
        separate: separate$1(F, G, G)
    };
}
Compactable$1.getCompactableComposition = getCompactableComposition;

var Either = {};

var ChainRec = {};

Object.defineProperty(ChainRec, "__esModule", { value: true });
ChainRec.tailRec = void 0;
/**
 * @since 2.0.0
 */
var tailRec = function (startWith, f) {
    var ab = f(startWith);
    while (ab._tag === 'Left') {
        ab = f(ab.left);
    }
    return ab.right;
};
ChainRec.tailRec = tailRec;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.match = exports.foldW = exports.matchW = exports.isRight = exports.isLeft = exports.fromOption = exports.fromPredicate = exports.FromEither = exports.MonadThrow = exports.throwError = exports.ChainRec = exports.Extend = exports.extend = exports.Alt = exports.alt = exports.altW = exports.Bifunctor = exports.mapLeft = exports.bimap = exports.Traversable = exports.sequence = exports.traverse = exports.Foldable = exports.reduceRight = exports.foldMap = exports.reduce = exports.Monad = exports.Chain = exports.Applicative = exports.Apply = exports.ap = exports.apW = exports.Pointed = exports.of = exports.asUnit = exports.as = exports.Functor = exports.map = exports.getAltValidation = exports.getApplicativeValidation = exports.getWitherable = exports.getFilterable = exports.getCompactable = exports.getSemigroup = exports.getEq = exports.getShow = exports.URI = exports.flatMap = exports.right = exports.left = void 0;
	exports.chainFirstW = exports.chainFirst = exports.chain = exports.chainW = exports.sequenceArray = exports.traverseArray = exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex = exports.traverseReadonlyNonEmptyArrayWithIndex = exports.ApT = exports.apSW = exports.apS = exports.bindW = exports.bind = exports.let = exports.bindTo = exports.Do = exports.exists = exports.elem = exports.toError = exports.toUnion = exports.chainNullableK = exports.fromNullableK = exports.tryCatchK = exports.tryCatch = exports.fromNullable = exports.orElse = exports.orElseW = exports.swap = exports.filterOrElseW = exports.filterOrElse = exports.flatMapOption = exports.flatMapNullable = exports.liftOption = exports.liftNullable = exports.chainOptionKW = exports.chainOptionK = exports.fromOptionK = exports.duplicate = exports.flatten = exports.flattenW = exports.tap = exports.apSecondW = exports.apSecond = exports.apFirstW = exports.apFirst = exports.flap = exports.getOrElse = exports.getOrElseW = exports.fold = void 0;
	exports.getValidation = exports.getValidationMonoid = exports.getValidationSemigroup = exports.getApplyMonoid = exports.getApplySemigroup = exports.either = exports.stringifyJSON = exports.parseJSON = void 0;
	var Applicative_1 = Applicative;
	var Apply_1 = Apply;
	var chainable = __importStar(Chain);
	var ChainRec_1 = ChainRec;
	var FromEither_1 = FromEither;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var Separated_1 = Separated;
	var Witherable_1 = Witherable;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
	 * structure.
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.left = _.left;
	/**
	 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
	 * of this structure.
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.right = _.right;
	/**
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) { return ((0, exports.isLeft)(ma) ? ma : f(ma.right)); });
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	/* istanbul ignore next */
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	/* istanbul ignore next */
	var _foldMap = function (M) { return function (fa, f) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return (0, function_1.pipe)(fa, foldMapM(f));
	}; };
	/* istanbul ignore next */
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	var _bimap = function (fa, f, g) { return (0, function_1.pipe)(fa, (0, exports.bimap)(f, g)); };
	var _mapLeft = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapLeft)(f)); };
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	/* istanbul ignore next */
	var _extend = function (wa, f) { return (0, function_1.pipe)(wa, (0, exports.extend)(f)); };
	var _chainRec = function (a, f) {
	    return (0, ChainRec_1.tailRec)(f(a), function (e) {
	        return (0, exports.isLeft)(e) ? (0, exports.right)((0, exports.left)(e.left)) : (0, exports.isLeft)(e.right) ? (0, exports.left)(f(e.right.left)) : (0, exports.right)((0, exports.right)(e.right.right));
	    });
	};
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Either';
	/**
	 * @category instances
	 * @since 2.0.0
	 */
	var getShow = function (SE, SA) { return ({
	    show: function (ma) { return ((0, exports.isLeft)(ma) ? "left(".concat(SE.show(ma.left), ")") : "right(".concat(SA.show(ma.right), ")")); }
	}); };
	exports.getShow = getShow;
	/**
	 * @category instances
	 * @since 2.0.0
	 */
	var getEq = function (EL, EA) { return ({
	    equals: function (x, y) {
	        return x === y || ((0, exports.isLeft)(x) ? (0, exports.isLeft)(y) && EL.equals(x.left, y.left) : (0, exports.isRight)(y) && EA.equals(x.right, y.right));
	    }
	}); };
	exports.getEq = getEq;
	/**
	 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
	 * concatenated using the provided `Semigroup`
	 *
	 * @example
	 * import { getSemigroup, left, right } from 'fp-ts/Either'
	 * import { SemigroupSum } from 'fp-ts/number'
	 *
	 * const S = getSemigroup<string, number>(SemigroupSum)
	 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
	 * assert.deepStrictEqual(S.concat(left('a'), right(2)), right(2))
	 * assert.deepStrictEqual(S.concat(right(1), left('b')), right(1))
	 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getSemigroup = function (S) { return ({
	    concat: function (x, y) { return ((0, exports.isLeft)(y) ? x : (0, exports.isLeft)(x) ? y : (0, exports.right)(S.concat(x.right, y.right))); }
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * Builds a `Compactable` instance for `Either` given `Monoid` for the left side.
	 *
	 * @category filtering
	 * @since 2.10.0
	 */
	var getCompactable = function (M) {
	    var empty = (0, exports.left)(M.empty);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        compact: function (ma) { return ((0, exports.isLeft)(ma) ? ma : ma.right._tag === 'None' ? empty : (0, exports.right)(ma.right.value)); },
	        separate: function (ma) {
	            return (0, exports.isLeft)(ma)
	                ? (0, Separated_1.separated)(ma, ma)
	                : (0, exports.isLeft)(ma.right)
	                    ? (0, Separated_1.separated)((0, exports.right)(ma.right.left), empty)
	                    : (0, Separated_1.separated)(empty, (0, exports.right)(ma.right.right));
	        }
	    };
	};
	exports.getCompactable = getCompactable;
	/**
	 * Builds a `Filterable` instance for `Either` given `Monoid` for the left side
	 *
	 * @category filtering
	 * @since 2.10.0
	 */
	var getFilterable = function (M) {
	    var empty = (0, exports.left)(M.empty);
	    var _a = (0, exports.getCompactable)(M), compact = _a.compact, separate = _a.separate;
	    var filter = function (ma, predicate) {
	        return (0, exports.isLeft)(ma) ? ma : predicate(ma.right) ? ma : empty;
	    };
	    var partition = function (ma, p) {
	        return (0, exports.isLeft)(ma)
	            ? (0, Separated_1.separated)(ma, ma)
	            : p(ma.right)
	                ? (0, Separated_1.separated)(empty, (0, exports.right)(ma.right))
	                : (0, Separated_1.separated)((0, exports.right)(ma.right), empty);
	    };
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        compact: compact,
	        separate: separate,
	        filter: filter,
	        filterMap: function (ma, f) {
	            if ((0, exports.isLeft)(ma)) {
	                return ma;
	            }
	            var ob = f(ma.right);
	            return ob._tag === 'None' ? empty : (0, exports.right)(ob.value);
	        },
	        partition: partition,
	        partitionMap: function (ma, f) {
	            if ((0, exports.isLeft)(ma)) {
	                return (0, Separated_1.separated)(ma, ma);
	            }
	            var e = f(ma.right);
	            return (0, exports.isLeft)(e) ? (0, Separated_1.separated)((0, exports.right)(e.left), empty) : (0, Separated_1.separated)(empty, (0, exports.right)(e.right));
	        }
	    };
	};
	exports.getFilterable = getFilterable;
	/**
	 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var getWitherable = function (M) {
	    var F_ = (0, exports.getFilterable)(M);
	    var C = (0, exports.getCompactable)(M);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        compact: F_.compact,
	        separate: F_.separate,
	        filter: F_.filter,
	        filterMap: F_.filterMap,
	        partition: F_.partition,
	        partitionMap: F_.partitionMap,
	        traverse: _traverse,
	        sequence: exports.sequence,
	        reduce: _reduce,
	        foldMap: _foldMap,
	        reduceRight: _reduceRight,
	        wither: (0, Witherable_1.witherDefault)(exports.Traversable, C),
	        wilt: (0, Witherable_1.wiltDefault)(exports.Traversable, C)
	    };
	};
	exports.getWitherable = getWitherable;
	/**
	 * The default [`Applicative`](#applicative) instance returns the first error, if you want to
	 * get all errors you need to provide a way to concatenate them via a `Semigroup`.
	 *
	 * @example
	 * import * as A from 'fp-ts/Apply'
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as S from 'fp-ts/Semigroup'
	 * import * as string from 'fp-ts/string'
	 *
	 * const parseString = (u: unknown): E.Either<string, string> =>
	 *   typeof u === 'string' ? E.right(u) : E.left('not a string')
	 *
	 * const parseNumber = (u: unknown): E.Either<string, number> =>
	 *   typeof u === 'number' ? E.right(u) : E.left('not a number')
	 *
	 * interface Person {
	 *   readonly name: string
	 *   readonly age: number
	 * }
	 *
	 * const parsePerson = (
	 *   input: Record<string, unknown>
	 * ): E.Either<string, Person> =>
	 *   pipe(
	 *     E.Do,
	 *     E.apS('name', parseString(input.name)),
	 *     E.apS('age', parseNumber(input.age))
	 *   )
	 *
	 * assert.deepStrictEqual(parsePerson({}), E.left('not a string')) // <= first error
	 *
	 * const Applicative = E.getApplicativeValidation(
	 *   pipe(string.Semigroup, S.intercalate(', '))
	 * )
	 *
	 * const apS = A.apS(Applicative)
	 *
	 * const parsePersonAll = (
	 *   input: Record<string, unknown>
	 * ): E.Either<string, Person> =>
	 *   pipe(
	 *     E.Do,
	 *     apS('name', parseString(input.name)),
	 *     apS('age', parseNumber(input.age))
	 *   )
	 *
	 * assert.deepStrictEqual(parsePersonAll({}), E.left('not a string, not a number')) // <= all errors
	 *
	 * @category error handling
	 * @since 2.7.0
	 */
	var getApplicativeValidation = function (SE) { return ({
	    URI: exports.URI,
	    _E: undefined,
	    map: _map,
	    ap: function (fab, fa) {
	        return (0, exports.isLeft)(fab)
	            ? (0, exports.isLeft)(fa)
	                ? (0, exports.left)(SE.concat(fab.left, fa.left))
	                : fab
	            : (0, exports.isLeft)(fa)
	                ? fa
	                : (0, exports.right)(fab.right(fa.right));
	    },
	    of: exports.of
	}); };
	exports.getApplicativeValidation = getApplicativeValidation;
	/**
	 * The default [`Alt`](#alt) instance returns the last error, if you want to
	 * get all errors you need to provide a way to concatenate them via a `Semigroup`.
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as S from 'fp-ts/Semigroup'
	 * import * as string from 'fp-ts/string'
	 *
	 * const parseString = (u: unknown): E.Either<string, string> =>
	 *   typeof u === 'string' ? E.right(u) : E.left('not a string')
	 *
	 * const parseNumber = (u: unknown): E.Either<string, number> =>
	 *   typeof u === 'number' ? E.right(u) : E.left('not a number')
	 *
	 * const parse = (u: unknown): E.Either<string, string | number> =>
	 *   pipe(
	 *     parseString(u),
	 *     E.alt<string, string | number>(() => parseNumber(u))
	 *   )
	 *
	 * assert.deepStrictEqual(parse(true), E.left('not a number')) // <= last error
	 *
	 * const Alt = E.getAltValidation(pipe(string.Semigroup, S.intercalate(', ')))
	 *
	 * const parseAll = (u: unknown): E.Either<string, string | number> =>
	 *   Alt.alt<string | number>(parseString(u), () => parseNumber(u))
	 *
	 * assert.deepStrictEqual(parseAll(true), E.left('not a string, not a number')) // <= all errors
	 *
	 * @category error handling
	 * @since 2.7.0
	 */
	var getAltValidation = function (SE) { return ({
	    URI: exports.URI,
	    _E: undefined,
	    map: _map,
	    alt: function (me, that) {
	        if ((0, exports.isRight)(me)) {
	            return me;
	        }
	        var ea = that();
	        return (0, exports.isLeft)(ea) ? (0, exports.left)(SE.concat(me.left, ea.left)) : ea;
	    }
	}); };
	exports.getAltValidation = getAltValidation;
	/**
	 * @category mapping
	 * @since 2.0.0
	 */
	var map = function (f) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? fa : (0, exports.right)(f(fa.right));
	}; };
	exports.map = map;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * Maps the `Right` value of this `Either` to the specified constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.as = (0, function_1.dual)(2, (0, Functor_1.as)(exports.Functor));
	/**
	 * Maps the `Right` value of this `Either` to the void constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.asUnit = (0, Functor_1.asUnit)(exports.Functor);
	/**
	 * @category constructors
	 * @since 2.7.0
	 */
	exports.of = exports.right;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * Less strict version of [`ap`](#ap).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.8.0
	 */
	var apW = function (fa) { return function (fab) {
	    return (0, exports.isLeft)(fab) ? fab : (0, exports.isLeft)(fa) ? fa : (0, exports.right)(fab.right(fa.right));
	}; };
	exports.apW = apW;
	/**
	 * @since 2.0.0
	 */
	exports.ap = exports.apW;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * Left-associative fold of a structure.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as E from 'fp-ts/Either'
	 *
	 * const startWith = 'prefix'
	 * const concat = (a: string, b: string) => `${a}:${b}`
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right('a'), E.reduce(startWith, concat)),
	 *   'prefix:a'
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.left('e'), E.reduce(startWith, concat)),
	 *   'prefix'
	 * )
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	var reduce = function (b, f) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? b : f(b, fa.right);
	}; };
	exports.reduce = reduce;
	/**
	 * Map each element of the structure to a monoid, and combine the results.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as E from 'fp-ts/Either'
	 * import * as S from 'fp-ts/string'
	 *
	 * const yell = (a: string) => `${a}!`
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right('a'), E.foldMap(S.Monoid)(yell)),
	 *   'a!'
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.left('e'), E.foldMap(S.Monoid)(yell)),
	 *   S.Monoid.empty
	 * )
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	var foldMap = function (M) { return function (f) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? M.empty : f(fa.right);
	}; }; };
	exports.foldMap = foldMap;
	/**
	 * Right-associative fold of a structure.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as E from 'fp-ts/Either'
	 *
	 * const startWith = 'postfix'
	 * const concat = (a: string, b: string) => `${a}:${b}`
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right('a'), E.reduceRight(startWith, concat)),
	 *   'a:postfix'
	 * )
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.left('e'), E.reduceRight(startWith, concat)),
	 *   'postfix'
	 * )
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	var reduceRight = function (b, f) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? b : f(fa.right, b);
	}; };
	exports.reduceRight = reduceRight;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * Map each element of a structure to an action, evaluate these actions from left to right, and collect the results.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as E from 'fp-ts/Either'
	 * import * as O from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right(['a']), E.traverse(O.Applicative)(RA.head)),
	 *   O.some(E.right('a'))
	 *  )
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right([]), E.traverse(O.Applicative)(RA.head)),
	 *   O.none
	 * )
	 *
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    return function (f) {
	        return function (ta) {
	            return (0, exports.isLeft)(ta) ? F.of((0, exports.left)(ta.left)) : F.map(f(ta.right), exports.right);
	        };
	    };
	};
	exports.traverse = traverse;
	/**
	 * Evaluate each monadic action in the structure from left to right, and collect the results.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as E from 'fp-ts/Either'
	 * import * as O from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right(O.some('a')), E.sequence(O.Applicative)),
	 *   O.some(E.right('a'))
	 *  )
	 *
	 * assert.deepStrictEqual(
	 *   pipe(E.right(O.none), E.sequence(O.Applicative)),
	 *   O.none
	 * )
	 *
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) {
	    return function (ma) {
	        return (0, exports.isLeft)(ma) ? F.of((0, exports.left)(ma.left)) : F.map(ma.right, exports.right);
	    };
	};
	exports.sequence = sequence;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	/**
	 * Map a pair of functions over the two type arguments of the bifunctor.
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	var bimap = function (f, g) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? (0, exports.left)(f(fa.left)) : (0, exports.right)(g(fa.right));
	}; };
	exports.bimap = bimap;
	/**
	 * Map a function over the first type argument of a bifunctor.
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	var mapLeft = function (f) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? (0, exports.left)(f(fa.left)) : fa;
	}; };
	exports.mapLeft = mapLeft;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Bifunctor = {
	    URI: exports.URI,
	    bimap: _bimap,
	    mapLeft: _mapLeft
	};
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the error and the return types will be merged.
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	var altW = function (that) { return function (fa) {
	    return (0, exports.isLeft)(fa) ? that() : fa;
	}; };
	exports.altW = altW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `Either` returns the left-most non-`Left` value (or the right-most `Left` value if both values are `Left`).
	 *
	 * | x        | y        | pipe(x, alt(() => y) |
	 * | -------- | -------- | -------------------- |
	 * | left(a)  | left(b)  | left(b)              |
	 * | left(a)  | right(2) | right(2)             |
	 * | right(1) | left(b)  | right(1)             |
	 * | right(1) | right(2) | right(1)             |
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.left('a'),
	 *     E.alt(() => E.left('b'))
	 *   ),
	 *   E.left('b')
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.left('a'),
	 *     E.alt(() => E.right(2))
	 *   ),
	 *   E.right(2)
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.right(1),
	 *     E.alt(() => E.left('b'))
	 *   ),
	 *   E.right(1)
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.right(1),
	 *     E.alt(() => E.right(2))
	 *   ),
	 *   E.right(1)
	 * )
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.alt = exports.altW;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @since 2.0.0
	 */
	var extend = function (f) { return function (wa) {
	    return (0, exports.isLeft)(wa) ? wa : (0, exports.right)(f(wa));
	}; };
	exports.extend = extend;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Extend = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.ChainRec = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap,
	    chainRec: _chainRec
	};
	/**
	 * @since 2.6.3
	 */
	exports.throwError = exports.left;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.MonadThrow = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap,
	    throwError: exports.throwError
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromEither = {
	    URI: exports.URI,
	    fromEither: function_1.identity
	};
	/**
	 * @example
	 * import { fromPredicate, left, right } from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     1,
	 *     fromPredicate(
	 *       (n) => n > 0,
	 *       () => 'error'
	 *     )
	 *   ),
	 *   right(1)
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     -1,
	 *     fromPredicate(
	 *       (n) => n > 0,
	 *       () => 'error'
	 *     )
	 *   ),
	 *   left('error')
	 * )
	 *
	 * @category lifting
	 * @since 2.0.0
	 */
	exports.fromPredicate = (0, FromEither_1.fromPredicate)(exports.FromEither);
	// -------------------------------------------------------------------------------------
	// conversions
	// -------------------------------------------------------------------------------------
	/**
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as O from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     O.some(1),
	 *     E.fromOption(() => 'error')
	 *   ),
	 *   E.right(1)
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     O.none,
	 *     E.fromOption(() => 'error')
	 *   ),
	 *   E.left('error')
	 * )
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.fromOption = 
	/*#__PURE__*/ (0, FromEither_1.fromOption)(exports.FromEither);
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * Returns `true` if the either is an instance of `Left`, `false` otherwise.
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	exports.isLeft = _.isLeft;
	/**
	 * Returns `true` if the either is an instance of `Right`, `false` otherwise.
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	exports.isRight = _.isRight;
	/**
	 * Less strict version of [`match`](#match).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	var matchW = function (onLeft, onRight) {
	    return function (ma) {
	        return (0, exports.isLeft)(ma) ? onLeft(ma.left) : onRight(ma.right);
	    };
	};
	exports.matchW = matchW;
	/**
	 * Alias of [`matchW`](#matchw).
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.foldW = exports.matchW;
	/**
	 * Takes two functions and an `Either` value, if the value is a `Left` the inner value is applied to the first function,
	 * if the value is a `Right` the inner value is applied to the second function.
	 *
	 * @example
	 * import { match, left, right } from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * function onLeft(errors: Array<string>): string {
	 *   return `Errors: ${errors.join(', ')}`
	 * }
	 *
	 * function onRight(value: number): string {
	 *   return `Ok: ${value}`
	 * }
	 *
	 * assert.strictEqual(
	 *   pipe(
	 *     right(1),
	 *     match(onLeft, onRight)
	 *   ),
	 *   'Ok: 1'
	 * )
	 * assert.strictEqual(
	 *   pipe(
	 *     left(['error 1', 'error 2']),
	 *     match(onLeft, onRight)
	 *   ),
	 *   'Errors: error 1, error 2'
	 * )
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.match = exports.matchW;
	/**
	 * Alias of [`match`](#match).
	 *
	 * @category pattern matching
	 * @since 2.0.0
	 */
	exports.fold = exports.match;
	/**
	 * Less strict version of [`getOrElse`](#getorelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return type will be merged.
	 *
	 * @category error handling
	 * @since 2.6.0
	 */
	var getOrElseW = function (onLeft) {
	    return function (ma) {
	        return (0, exports.isLeft)(ma) ? onLeft(ma.left) : ma.right;
	    };
	};
	exports.getOrElseW = getOrElseW;
	/**
	 * Returns the wrapped value if it's a `Right` or a default value if is a `Left`.
	 *
	 * @example
	 * import { getOrElse, left, right } from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     right(1),
	 *     getOrElse(() => 0)
	 *   ),
	 *   1
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     left('error'),
	 *     getOrElse(() => 0)
	 *   ),
	 *   0
	 * )
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.getOrElse = exports.getOrElseW;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.0.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Less strict version of [`apFirst`](#apfirst)
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.12.0
	 */
	exports.apFirstW = exports.apFirst;
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.0.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * Less strict version of [`apSecond`](#apsecond)
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.12.0
	 */
	exports.apSecondW = exports.apSecond;
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @category combinators
	 * @since 2.15.0
	 */
	exports.tap = (0, function_1.dual)(2, chainable.tap(exports.Chain));
	/**
	 * Less strict version of [`flatten`](#flatten).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category sequencing
	 * @since 2.11.0
	 */
	exports.flattenW = 
	/*#__PURE__*/ (0, exports.flatMap)(function_1.identity);
	/**
	 * The `flatten` function is the conventional monad join operator. It is used to remove one level of monadic structure, projecting its bound argument into the outer level.
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(E.flatten(E.right(E.right('a'))), E.right('a'))
	 * assert.deepStrictEqual(E.flatten(E.right(E.left('e'))), E.left('e'))
	 * assert.deepStrictEqual(E.flatten(E.left('e')), E.left('e'))
	 *
	 * @category sequencing
	 * @since 2.0.0
	 */
	exports.flatten = exports.flattenW;
	/**
	 * @since 2.0.0
	 */
	exports.duplicate = (0, exports.extend)(function_1.identity);
	/**
	 * Use `liftOption`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.fromOptionK = 
	/*#__PURE__*/ (0, FromEither_1.fromOptionK)(exports.FromEither);
	/**
	 * Use `flatMapOption`.
	 *
	 * @category legacy
	 * @since 2.11.0
	 */
	exports.chainOptionK = (0, FromEither_1.chainOptionK)(exports.FromEither, exports.Chain);
	/**
	 * Use `flatMapOption`.
	 *
	 * @category legacy
	 * @since 2.13.2
	 */
	exports.chainOptionKW = exports.chainOptionK;
	/** @internal */
	var _FromEither = {
	    fromEither: exports.FromEither.fromEither
	};
	/**
	 * @category lifting
	 * @since 2.15.0
	 */
	exports.liftNullable = _.liftNullable(_FromEither);
	/**
	 * @category lifting
	 * @since 2.15.0
	 */
	exports.liftOption = _.liftOption(_FromEither);
	/** @internal */
	var _FlatMap = {
	    flatMap: exports.flatMap
	};
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapNullable = _.flatMapNullable(_FromEither, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapOption = _.flatMapOption(_FromEither, _FlatMap);
	/**
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.right(1),
	 *     E.filterOrElse(
	 *       (n) => n > 0,
	 *       () => 'error'
	 *     )
	 *   ),
	 *   E.right(1)
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.right(-1),
	 *     E.filterOrElse(
	 *       (n) => n > 0,
	 *       () => 'error'
	 *     )
	 *   ),
	 *   E.left('error')
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     E.left('a'),
	 *     E.filterOrElse(
	 *       (n) => n > 0,
	 *       () => 'error'
	 *     )
	 *   ),
	 *   E.left('a')
	 * )
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	exports.filterOrElse = (0, FromEither_1.filterOrElse)(exports.FromEither, exports.Chain);
	/**
	 * Less strict version of [`filterOrElse`](#filterorelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category filtering
	 * @since 2.9.0
	 */
	exports.filterOrElseW = exports.filterOrElse;
	/**
	 * Returns a `Right` if is a `Left` (and vice versa).
	 *
	 * @since 2.0.0
	 */
	var swap = function (ma) { return ((0, exports.isLeft)(ma) ? (0, exports.right)(ma.left) : (0, exports.left)(ma.right)); };
	exports.swap = swap;
	/**
	 * Less strict version of [`orElse`](#orelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @category error handling
	 * @since 2.10.0
	 */
	var orElseW = function (onLeft) {
	    return function (ma) {
	        return (0, exports.isLeft)(ma) ? onLeft(ma.left) : ma;
	    };
	};
	exports.orElseW = orElseW;
	/**
	 * Useful for recovering from errors.
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.orElse = exports.orElseW;
	/**
	 * Takes a default and a nullable value, if the value is not nully, turn it into a `Right`, if the value is nully use
	 * the provided default as a `Left`.
	 *
	 * @example
	 * import { fromNullable, left, right } from 'fp-ts/Either'
	 *
	 * const parse = fromNullable('nully')
	 *
	 * assert.deepStrictEqual(parse(1), right(1))
	 * assert.deepStrictEqual(parse(null), left('nully'))
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	var fromNullable = function (e) {
	    return function (a) {
	        return a == null ? (0, exports.left)(e) : (0, exports.right)(a);
	    };
	};
	exports.fromNullable = fromNullable;
	/**
	 * Constructs a new `Either` from a function that might throw.
	 *
	 * See also [`tryCatchK`](#trycatchk).
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 *
	 * const unsafeHead = <A>(as: ReadonlyArray<A>): A => {
	 *   if (as.length > 0) {
	 *     return as[0]
	 *   } else {
	 *     throw new Error('empty array')
	 *   }
	 * }
	 *
	 * const head = <A>(as: ReadonlyArray<A>): E.Either<Error, A> =>
	 *   E.tryCatch(() => unsafeHead(as), e => (e instanceof Error ? e : new Error('unknown error')))
	 *
	 * assert.deepStrictEqual(head([]), E.left(new Error('empty array')))
	 * assert.deepStrictEqual(head([1, 2, 3]), E.right(1))
	 *
	 * @category interop
	 * @since 2.0.0
	 */
	var tryCatch = function (f, onThrow) {
	    try {
	        return (0, exports.right)(f());
	    }
	    catch (e) {
	        return (0, exports.left)(onThrow(e));
	    }
	};
	exports.tryCatch = tryCatch;
	/**
	 * Converts a function that may throw to one returning a `Either`.
	 *
	 * @category interop
	 * @since 2.10.0
	 */
	var tryCatchK = function (f, onThrow) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return (0, exports.tryCatch)(function () { return f.apply(void 0, a); }, onThrow);
	    };
	};
	exports.tryCatchK = tryCatchK;
	/**
	 * Use `liftNullable`.
	 *
	 * @category legacy
	 * @since 2.9.0
	 */
	var fromNullableK = function (e) {
	    var from = (0, exports.fromNullable)(e);
	    return function (f) { return (0, function_1.flow)(f, from); };
	};
	exports.fromNullableK = fromNullableK;
	/**
	 * Use `flatMapNullable`.
	 *
	 * @category legacy
	 * @since 2.9.0
	 */
	var chainNullableK = function (e) {
	    var from = (0, exports.fromNullableK)(e);
	    return function (f) { return (0, exports.flatMap)(from(f)); };
	};
	exports.chainNullableK = chainNullableK;
	/**
	 * @category conversions
	 * @since 2.10.0
	 */
	exports.toUnion = (0, exports.foldW)(function_1.identity, function_1.identity);
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * Default value for the `onError` argument of `tryCatch`
	 *
	 * @since 2.0.0
	 */
	function toError(e) {
	    return e instanceof Error ? e : new Error(String(e));
	}
	exports.toError = toError;
	function elem(E) {
	    return function (a, ma) {
	        if (ma === undefined) {
	            var elemE_1 = elem(E);
	            return function (ma) { return elemE_1(a, ma); };
	        }
	        return (0, exports.isLeft)(ma) ? false : E.equals(a, ma.right);
	    };
	}
	exports.elem = elem;
	/**
	 * Returns `false` if `Left` or returns the result of the application of the given predicate to the `Right` value.
	 *
	 * @example
	 * import { exists, left, right } from 'fp-ts/Either'
	 *
	 * const gt2 = exists((n: number) => n > 2)
	 *
	 * assert.strictEqual(gt2(left('a')), false)
	 * assert.strictEqual(gt2(right(1)), false)
	 * assert.strictEqual(gt2(right(3)), true)
	 *
	 * @since 2.0.0
	 */
	var exists = function (predicate) {
	    return function (ma) {
	        return (0, exports.isLeft)(ma) ? false : predicate(ma.right);
	    };
	};
	exports.exists = exists;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = chainable.bind(exports.Chain);
	/**
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindW = exports.bind;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	/**
	 * Less strict version of [`apS`](#aps).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apSW = exports.apS;
	/**
	 * @since 2.11.0
	 */
	exports.ApT = (0, exports.of)(_.emptyReadonlyArray);
	// -------------------------------------------------------------------------------------
	// array utils
	// -------------------------------------------------------------------------------------
	/**
	 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndex = function (f) {
	    return function (as) {
	        var e = f(0, _.head(as));
	        if ((0, exports.isLeft)(e)) {
	            return e;
	        }
	        var out = [e.right];
	        for (var i = 1; i < as.length; i++) {
	            var e_1 = f(i, as[i]);
	            if ((0, exports.isLeft)(e_1)) {
	                return e_1;
	            }
	            out.push(e_1.right);
	        }
	        return (0, exports.right)(out);
	    };
	};
	exports.traverseReadonlyNonEmptyArrayWithIndex = traverseReadonlyNonEmptyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndex = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndex)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndex = traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseArray = function (f) { return (0, exports.traverseReadonlyArrayWithIndex)(function (_, a) { return f(a); }); };
	exports.traverseArray = traverseArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceArray = 
	/*#__PURE__*/ (0, exports.traverseArray)(function_1.identity);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.6.0
	 */
	exports.chainW = exports.flatMap;
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chainFirst = exports.tap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.8.0
	 */
	exports.chainFirstW = exports.tap;
	/**
	 * Use [`parse`](./Json.ts.html#parse) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	function parseJSON(s, onError) {
	    return (0, exports.tryCatch)(function () { return JSON.parse(s); }, onError);
	}
	exports.parseJSON = parseJSON;
	/**
	 * Use [`stringify`](./Json.ts.html#stringify) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var stringifyJSON = function (u, onError) {
	    return (0, exports.tryCatch)(function () {
	        var s = JSON.stringify(u);
	        if (typeof s !== 'string') {
	            throw new Error('Converting unsupported structure to JSON');
	        }
	        return s;
	    }, onError);
	};
	exports.stringifyJSON = stringifyJSON;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `E.Functor` instead of `E.either`
	 * (where `E` is from `import E from 'fp-ts/Either'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.either = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _ap,
	    chain: exports.flatMap,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    bimap: _bimap,
	    mapLeft: _mapLeft,
	    alt: _alt,
	    extend: _extend,
	    chainRec: _chainRec,
	    throwError: exports.throwError
	};
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
	 * are concatenated using the provided `Semigroup`
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplySemigroup = 
	/*#__PURE__*/ (0, Apply_1.getApplySemigroup)(exports.Apply);
	/**
	 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplyMonoid = 
	/*#__PURE__*/ (0, Applicative_1.getApplicativeMonoid)(exports.Applicative);
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getValidationSemigroup = function (SE, SA) {
	    return (0, Apply_1.getApplySemigroup)((0, exports.getApplicativeValidation)(SE))(SA);
	};
	exports.getValidationSemigroup = getValidationSemigroup;
	/**
	 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getValidationMonoid = function (SE, MA) {
	    return (0, Applicative_1.getApplicativeMonoid)((0, exports.getApplicativeValidation)(SE))(MA);
	};
	exports.getValidationMonoid = getValidationMonoid;
	/**
	 * Use [`getApplicativeValidation`](#getapplicativevalidation) and [`getAltValidation`](#getaltvalidation) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	function getValidation(SE) {
	    var ap = (0, exports.getApplicativeValidation)(SE).ap;
	    var alt = (0, exports.getAltValidation)(SE).alt;
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        of: exports.of,
	        chain: exports.flatMap,
	        bimap: _bimap,
	        mapLeft: _mapLeft,
	        reduce: _reduce,
	        foldMap: _foldMap,
	        reduceRight: _reduceRight,
	        extend: _extend,
	        traverse: _traverse,
	        sequence: exports.sequence,
	        chainRec: _chainRec,
	        throwError: exports.throwError,
	        ap: ap,
	        alt: alt
	    };
	}
	exports.getValidation = getValidation; 
} (Either));

var EitherT = {};

var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(EitherT, "__esModule", { value: true });
EitherT.getEitherM = EitherT.toUnion = EitherT.swap = EitherT.orLeft = EitherT.tapError = EitherT.orElseFirst = EitherT.orElse = EitherT.getOrElse = EitherT.matchE = EitherT.match = EitherT.altValidation = EitherT.mapError = EitherT.mapLeft = EitherT.mapBoth = EitherT.bimap = EitherT.alt = EitherT.flatMap = EitherT.chain = EitherT.ap = EitherT.map = EitherT.chainNullableK = EitherT.fromNullableK = EitherT.fromNullable = EitherT.leftF = EitherT.rightF = EitherT.left = EitherT.right = void 0;
var Apply_1 = Apply;
var E = __importStar(Either);
var function_1$3 = _function;
var Functor_1$1 = Functor;
function right$3(F) {
    return (0, function_1$3.flow)(E.right, F.of);
}
EitherT.right = right$3;
function left$3(F) {
    return (0, function_1$3.flow)(E.left, F.of);
}
EitherT.left = left$3;
function rightF(F) {
    return function (fa) { return F.map(fa, E.right); };
}
EitherT.rightF = rightF;
function leftF(F) {
    return function (fe) { return F.map(fe, E.left); };
}
EitherT.leftF = leftF;
function fromNullable$2(F) {
    return function (e) { return (0, function_1$3.flow)(E.fromNullable(e), F.of); };
}
EitherT.fromNullable = fromNullable$2;
function fromNullableK(F) {
    var fromNullableF = fromNullable$2(F);
    return function (e) {
        var fromNullableFE = fromNullableF(e);
        return function (f) { return (0, function_1$3.flow)(f, fromNullableFE); };
    };
}
EitherT.fromNullableK = fromNullableK;
function chainNullableK(M) {
    var chainM = chain$1(M);
    var fromNullableKM = fromNullableK(M);
    return function (e) {
        var fromNullableKMe = fromNullableKM(e);
        return function (f) { return chainM(fromNullableKMe(f)); };
    };
}
EitherT.chainNullableK = chainNullableK;
function map$3(F) {
    return (0, Functor_1$1.map)(F, E.Functor);
}
EitherT.map = map$3;
function ap$1(F) {
    return (0, Apply_1.ap)(F, E.Apply);
}
EitherT.ap = ap$1;
function chain$1(M) {
    var flatMapM = flatMap$1(M);
    return function (f) { return function (ma) { return flatMapM(ma, f); }; };
}
EitherT.chain = chain$1;
/** @internal */
function flatMap$1(M) {
    return function (ma, f) { return M.chain(ma, function (e) { return (E.isLeft(e) ? M.of(e) : f(e.right)); }); };
}
EitherT.flatMap = flatMap$1;
function alt$1(M) {
    return function (second) { return function (first) { return M.chain(first, function (e) { return (E.isLeft(e) ? second() : M.of(e)); }); }; };
}
EitherT.alt = alt$1;
function bimap(F) {
    var mapBothF = mapBoth(F);
    return function (f, g) { return function (self) { return mapBothF(self, f, g); }; };
}
EitherT.bimap = bimap;
/** @internal */
function mapBoth(F) {
    return function (self, f, g) { return F.map(self, E.bimap(f, g)); };
}
EitherT.mapBoth = mapBoth;
function mapLeft(F) {
    var mapErrorF = mapError(F);
    return function (f) { return function (self) { return mapErrorF(self, f); }; };
}
EitherT.mapLeft = mapLeft;
/** @internal */
function mapError(F) {
    return function (self, f) { return F.map(self, E.mapLeft(f)); };
}
EitherT.mapError = mapError;
function altValidation(M, S) {
    return function (second) { return function (first) {
        return M.chain(first, E.match(function (e1) {
            return M.map(second(), E.mapLeft(function (e2) { return S.concat(e1, e2); }));
        }, right$3(M)));
    }; };
}
EitherT.altValidation = altValidation;
function match$3(F) {
    return function (onLeft, onRight) { return function (ma) { return F.map(ma, E.match(onLeft, onRight)); }; };
}
EitherT.match = match$3;
function matchE(M) {
    return function (onLeft, onRight) { return function (ma) { return M.chain(ma, E.match(onLeft, onRight)); }; };
}
EitherT.matchE = matchE;
function getOrElse$1(M) {
    return function (onLeft) { return function (ma) { return M.chain(ma, E.match(onLeft, M.of)); }; };
}
EitherT.getOrElse = getOrElse$1;
function orElse$1(M) {
    return function (onLeft) { return function (ma) { return M.chain(ma, function (e) { return (E.isLeft(e) ? onLeft(e.left) : M.of(e)); }); }; };
}
EitherT.orElse = orElse$1;
function orElseFirst(M) {
    var tapErrorM = tapError(M);
    return function (onLeft) { return function (ma) { return tapErrorM(ma, onLeft); }; };
}
EitherT.orElseFirst = orElseFirst;
/** @internal */
function tapError(M) {
    var orElseM = orElse$1(M);
    return function (ma, onLeft) {
        return (0, function_1$3.pipe)(ma, orElseM(function (e) { return M.map(onLeft(e), function (eb) { return (E.isLeft(eb) ? eb : E.left(e)); }); }));
    };
}
EitherT.tapError = tapError;
function orLeft(M) {
    return function (onLeft) { return function (ma) {
        return M.chain(ma, E.match(function (e) { return M.map(onLeft(e), E.left); }, function (a) { return M.of(E.right(a)); }));
    }; };
}
EitherT.orLeft = orLeft;
function swap(F) {
    return function (ma) { return F.map(ma, E.swap); };
}
EitherT.swap = swap;
function toUnion(F) {
    return function (fa) { return F.map(fa, E.toUnion); };
}
EitherT.toUnion = toUnion;
/** @deprecated  */
/* istanbul ignore next */
function getEitherM(M) {
    var _ap = ap$1(M);
    var _map = map$3(M);
    var _chain = chain$1(M);
    var _alt = alt$1(M);
    var _bimap = bimap(M);
    var _mapLeft = mapLeft(M);
    var _fold = matchE(M);
    var _getOrElse = getOrElse$1(M);
    var _orElse = orElse$1(M);
    return {
        map: function (fa, f) { return (0, function_1$3.pipe)(fa, _map(f)); },
        ap: function (fab, fa) { return (0, function_1$3.pipe)(fab, _ap(fa)); },
        of: right$3(M),
        chain: function (ma, f) { return (0, function_1$3.pipe)(ma, _chain(f)); },
        alt: function (fa, that) { return (0, function_1$3.pipe)(fa, _alt(that)); },
        bimap: function (fea, f, g) { return (0, function_1$3.pipe)(fea, _bimap(f, g)); },
        mapLeft: function (fea, f) { return (0, function_1$3.pipe)(fea, _mapLeft(f)); },
        fold: function (fa, onLeft, onRight) { return (0, function_1$3.pipe)(fa, _fold(onLeft, onRight)); },
        getOrElse: function (fa, onLeft) { return (0, function_1$3.pipe)(fa, _getOrElse(onLeft)); },
        orElse: function (fa, f) { return (0, function_1$3.pipe)(fa, _orElse(f)); },
        swap: swap(M),
        rightM: rightF(M),
        leftM: leftF(M),
        left: left$3(M)
    };
}
EitherT.getEitherM = getEitherM;

var Filterable = {};

Object.defineProperty(Filterable, "__esModule", { value: true });
Filterable.getFilterableComposition = Filterable.partitionMap = Filterable.partition = Filterable.filterMap = Filterable.filter = void 0;
/**
 * `Filterable` represents data structures which can be _partitioned_/_filtered_.
 *
 * Adapted from https://github.com/LiamGoodacre/purescript-filterable/blob/master/src/Data/Filterable.purs
 *
 * @since 2.0.0
 */
var Compactable_1 = Compactable$1;
var function_1$2 = _function;
var Functor_1 = Functor;
var Option_1 = Option;
var Predicate_1 = Predicate;
var Separated_1 = Separated;
function filter$3(F, G) {
    return function (predicate) { return function (fga) { return F.map(fga, function (ga) { return G.filter(ga, predicate); }); }; };
}
Filterable.filter = filter$3;
function filterMap$1(F, G) {
    return function (f) { return function (fga) { return F.map(fga, function (ga) { return G.filterMap(ga, f); }); }; };
}
Filterable.filterMap = filterMap$1;
function partition$1(F, G) {
    var _filter = filter$3(F, G);
    return function (predicate) {
        var left = _filter((0, Predicate_1.not)(predicate));
        var right = _filter(predicate);
        return function (fgb) { return (0, Separated_1.separated)(left(fgb), right(fgb)); };
    };
}
Filterable.partition = partition$1;
function partitionMap$1(F, G) {
    var _filterMap = filterMap$1(F, G);
    return function (f) { return function (fga) {
        return (0, Separated_1.separated)((0, function_1$2.pipe)(fga, _filterMap(function (a) { return (0, Option_1.getLeft)(f(a)); })), (0, function_1$2.pipe)(fga, _filterMap(function (a) { return (0, Option_1.getRight)(f(a)); })));
    }; };
}
Filterable.partitionMap = partitionMap$1;
/** @deprecated */
function getFilterableComposition(F, G) {
    var map = (0, Functor_1.getFunctorComposition)(F, G).map;
    var _compact = (0, Compactable_1.compact)(F, G);
    var _separate = (0, Compactable_1.separate)(F, G, G);
    var _filter = filter$3(F, G);
    var _filterMap = filterMap$1(F, G);
    var _partition = partition$1(F, G);
    var _partitionMap = partitionMap$1(F, G);
    return {
        map: map,
        compact: _compact,
        separate: _separate,
        filter: function (fga, f) { return (0, function_1$2.pipe)(fga, _filter(f)); },
        filterMap: function (fga, f) { return (0, function_1$2.pipe)(fga, _filterMap(f)); },
        partition: function (fga, p) { return (0, function_1$2.pipe)(fga, _partition(p)); },
        partitionMap: function (fga, f) { return (0, function_1$2.pipe)(fga, _partitionMap(f)); }
    };
}
Filterable.getFilterableComposition = getFilterableComposition;

var FromIO = {};

Object.defineProperty(FromIO, "__esModule", { value: true });
FromIO.tapIO = FromIO.chainFirstIOK = FromIO.chainIOK = FromIO.fromIOK = void 0;
/**
 * Lift a computation from the `IO` monad
 *
 * @since 2.10.0
 */
var Chain_1$1 = Chain;
var function_1$1 = _function;
function fromIOK(F) {
    return function (f) { return (0, function_1$1.flow)(f, F.fromIO); };
}
FromIO.fromIOK = fromIOK;
function chainIOK(F, M) {
    return function (f) {
        var g = (0, function_1$1.flow)(f, F.fromIO);
        return function (first) { return M.chain(first, g); };
    };
}
FromIO.chainIOK = chainIOK;
function chainFirstIOK(F, M) {
    var tapIOM = tapIO(F, M);
    return function (f) { return function (first) { return tapIOM(first, f); }; };
}
FromIO.chainFirstIOK = chainFirstIOK;
/** @internal */
function tapIO(F, M) {
    var chainFirstM = (0, Chain_1$1.tap)(M);
    return function (self, f) { return chainFirstM(self, (0, function_1$1.flow)(f, F.fromIO)); };
}
FromIO.tapIO = tapIO;

var FromTask = {};

Object.defineProperty(FromTask, "__esModule", { value: true });
FromTask.tapTask = FromTask.chainFirstTaskK = FromTask.chainTaskK = FromTask.fromTaskK = void 0;
/**
 * Lift a computation from the `Task` monad
 *
 * @since 2.10.0
 */
var Chain_1 = Chain;
var function_1 = _function;
function fromTaskK(F) {
    return function (f) { return (0, function_1.flow)(f, F.fromTask); };
}
FromTask.fromTaskK = fromTaskK;
function chainTaskK(F, M) {
    return function (f) {
        var g = (0, function_1.flow)(f, F.fromTask);
        return function (first) { return M.chain(first, g); };
    };
}
FromTask.chainTaskK = chainTaskK;
function chainFirstTaskK(F, M) {
    var tapTaskM = tapTask(F, M);
    return function (f) { return function (first) { return tapTaskM(first, f); }; };
}
FromTask.chainFirstTaskK = chainFirstTaskK;
/** @internal */
function tapTask(F, M) {
    var tapM = (0, Chain_1.tap)(M);
    return function (self, f) { return tapM(self, (0, function_1.flow)(f, F.fromTask)); };
}
FromTask.tapTask = tapTask;

var Task = {};

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sequenceSeqArray = exports.traverseSeqArray = exports.traverseSeqArrayWithIndex = exports.sequenceArray = exports.traverseArray = exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndexSeq = exports.traverseReadonlyNonEmptyArrayWithIndexSeq = exports.traverseReadonlyArrayWithIndex = exports.traverseReadonlyNonEmptyArrayWithIndex = exports.ApT = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.never = exports.FromTask = exports.chainFirstIOK = exports.chainIOK = exports.fromIOK = exports.tapIO = exports.tap = exports.flatMapIO = exports.FromIO = exports.MonadTask = exports.fromTask = exports.MonadIO = exports.Monad = exports.Chain = exports.ApplicativeSeq = exports.ApplySeq = exports.ApplicativePar = exports.apSecond = exports.apFirst = exports.ApplyPar = exports.Pointed = exports.flap = exports.asUnit = exports.as = exports.Functor = exports.getRaceMonoid = exports.URI = exports.flatten = exports.flatMap = exports.of = exports.ap = exports.map = exports.delay = exports.fromIO = void 0;
	exports.getMonoid = exports.getSemigroup = exports.taskSeq = exports.task = exports.chainFirst = exports.chain = void 0;
	/**
	 * ```ts
	 * interface Task<A> {
	 *   (): Promise<A>
	 * }
	 * ```
	 *
	 * `Task<A>` represents an asynchronous computation that yields a value of type `A` and **never fails**.
	 * If you want to represent an asynchronous computation that may fail, please see `TaskEither`.
	 *
	 * @since 2.0.0
	 */
	var Applicative_1 = Applicative;
	var Apply_1 = Apply;
	var chainable = __importStar(Chain);
	var FromIO_1 = FromIO;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	// -------------------------------------------------------------------------------------
	// conversions
	// -------------------------------------------------------------------------------------
	/**
	 * @category conversions
	 * @since 2.0.0
	 */
	var fromIO = function (ma) { return function () { return Promise.resolve().then(ma); }; };
	exports.fromIO = fromIO;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * Creates a task that will complete after a time delay
	 *
	 * @example
	 * import { sequenceT } from 'fp-ts/Apply'
	 * import * as T from 'fp-ts/Task'
	 * import { takeRight } from 'fp-ts/Array'
	 *
	 * async function test() {
	 *   const log: Array<string> = []
	 *   const append = (message: string): T.Task<void> =>
	 *     T.fromIO(() => {
	 *       log.push(message)
	 *     })
	 *   const fa = append('a')
	 *   const fb = T.delay(20)(append('b'))
	 *   const fc = T.delay(10)(append('c'))
	 *   const fd = append('d')
	 *   await sequenceT(T.ApplyPar)(fa, fb, fc, fd)()
	 *   assert.deepStrictEqual(takeRight(2)(log), ['c', 'b'])
	 * }
	 *
	 * test()
	 *
	 * @since 2.0.0
	 */
	function delay(millis) {
	    return function (ma) { return function () {
	        return new Promise(function (resolve) {
	            setTimeout(function () {
	                Promise.resolve().then(ma).then(resolve);
	            }, millis);
	        });
	    }; };
	}
	exports.delay = delay;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _apPar = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	var _apSeq = function (fab, fa) { return (0, exports.flatMap)(fab, function (f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); }); };
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	var map = function (f) { return function (fa) { return function () {
	    return Promise.resolve().then(fa).then(f);
	}; }; };
	exports.map = map;
	/**
	 * @since 2.0.0
	 */
	var ap = function (fa) { return function (fab) { return function () {
	    return Promise.all([Promise.resolve().then(fab), Promise.resolve().then(fa)]).then(function (_a) {
	        var f = _a[0], a = _a[1];
	        return f(a);
	    });
	}; }; };
	exports.ap = ap;
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	var of = function (a) { return function () { return Promise.resolve(a); }; };
	exports.of = of;
	/**
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) {
	    return function () {
	        return Promise.resolve()
	            .then(ma)
	            .then(function (a) { return f(a)(); });
	    };
	});
	/**
	 * @category sequencing
	 * @since 2.0.0
	 */
	exports.flatten = (0, exports.flatMap)(function_1.identity);
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Task';
	/**
	 * Monoid returning the first completed task.
	 *
	 * Note: uses `Promise.race` internally.
	 *
	 * @example
	 * import * as T from 'fp-ts/Task'
	 *
	 * async function test() {
	 *   const S = T.getRaceMonoid<string>()
	 *   const fa = T.delay(20)(T.of('a'))
	 *   const fb = T.delay(10)(T.of('b'))
	 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'b')
	 * }
	 *
	 * test()
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	function getRaceMonoid() {
	    return {
	        concat: function (x, y) { return function () { return Promise.race([Promise.resolve().then(x), Promise.resolve().then(y)]); }; },
	        empty: exports.never
	    };
	}
	exports.getRaceMonoid = getRaceMonoid;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * Maps the value to the specified constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.as = (0, function_1.dual)(2, (0, Functor_1.as)(exports.Functor));
	/**
	 * Maps the value to the void constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.asUnit = (0, Functor_1.asUnit)(exports.Functor);
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * Runs computations in parallel.
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.ApplyPar = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.0.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.ApplyPar);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.0.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.ApplyPar);
	/**
	 * Runs computations in parallel.
	 *
	 * @category instances
	 * @since 2.7.0
	 */
	exports.ApplicativePar = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    of: exports.of
	};
	/**
	 * Runs computations sequentially.
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.ApplySeq = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apSeq
	};
	/**
	 * Runs computations sequentially.
	 *
	 * @category instances
	 * @since 2.7.0
	 */
	exports.ApplicativeSeq = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apSeq,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _apPar,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonadIO = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _apPar,
	    chain: exports.flatMap,
	    fromIO: exports.fromIO
	};
	/**
	 * @category zone of death
	 * @since 2.7.0
	 * @deprecated
	 */
	exports.fromTask = function_1.identity;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonadTask = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _apPar,
	    chain: exports.flatMap,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromIO = {
	    URI: exports.URI,
	    fromIO: exports.fromIO
	};
	/** @internal */
	var _FlatMap = {
	    flatMap: exports.flatMap
	};
	/** @internal */
	var _FromIO = {
	    fromIO: exports.FromIO.fromIO
	};
	/**
	 * @category sequencing
	 * @since 2.16.0
	 */
	exports.flatMapIO = _.flatMapIO(_FromIO, _FlatMap);
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @category combinators
	 * @since 2.15.0
	 */
	exports.tap = (0, function_1.dual)(2, chainable.tap(exports.Chain));
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as T from 'fp-ts/Task'
	 * import * as Console from 'fp-ts/Console'
	 *
	 * // Will produce `Hello, fp-ts` to the stdout
	 * const effect = pipe(
	 *   T.of('fp-ts'),
	 *   T.tapIO((value) => Console.log(`Hello, ${value}`)),
	 * )
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await effect(), 'fp-ts')
	 * }
	 *
	 * test()
	 *
	 * @category combinators
	 * @since 2.16.0
	 */
	exports.tapIO = (0, function_1.dual)(2, (0, FromIO_1.tapIO)(exports.FromIO, exports.Chain));
	/**
	 * @category lifting
	 * @since 2.4.0
	 */
	exports.fromIOK = 
	/*#__PURE__*/ (0, FromIO_1.fromIOK)(exports.FromIO);
	/**
	 * Alias of `flatMapIO`.
	 *
	 * @category legacy
	 * @since 2.4.0
	 */
	exports.chainIOK = exports.flatMapIO;
	/**
	 * Alias of `tapIO`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainFirstIOK = exports.tapIO;
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromTask = {
	    URI: exports.URI,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * A `Task` that never completes.
	 *
	 * @since 2.0.0
	 */
	var never = function () { return new Promise(function (_) { return undefined; }); };
	exports.never = never;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = chainable.bind(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.ApplyPar);
	/**
	 * @since 2.11.0
	 */
	exports.ApT = (0, exports.of)(_.emptyReadonlyArray);
	// -------------------------------------------------------------------------------------
	// array utils
	// -------------------------------------------------------------------------------------
	/**
	 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(ApplicativePar)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndex = function (f) {
	    return function (as) {
	        return function () {
	            return Promise.all(as.map(function (a, i) { return Promise.resolve().then(function () { return f(i, a)(); }); }));
	        };
	    };
	};
	exports.traverseReadonlyNonEmptyArrayWithIndex = traverseReadonlyNonEmptyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativePar)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndex = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndex)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndex = traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndexSeq = function (f) {
	    return function (as) {
	        return function () {
	            return _.tail(as).reduce(function (acc, a, i) {
	                return acc.then(function (bs) {
	                    return Promise.resolve()
	                        .then(f(i + 1, a))
	                        .then(function (b) {
	                        bs.push(b);
	                        return bs;
	                    });
	                });
	            }, Promise.resolve()
	                .then(f(0, _.head(as)))
	                .then(_.singleton));
	        };
	    };
	};
	exports.traverseReadonlyNonEmptyArrayWithIndexSeq = traverseReadonlyNonEmptyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndexSeq = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndexSeq)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndexSeq = traverseReadonlyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseArray = function (f) {
	    return (0, exports.traverseReadonlyArrayWithIndex)(function (_, a) { return f(a); });
	};
	exports.traverseArray = traverseArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceArray = 
	/*#__PURE__*/ (0, exports.traverseArray)(function_1.identity);
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseSeqArrayWithIndex = exports.traverseReadonlyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverse(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseSeqArray = function (f) {
	    return (0, exports.traverseReadonlyArrayWithIndexSeq)(function (_, a) { return f(a); });
	};
	exports.traverseSeqArray = traverseSeqArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceSeqArray = 
	/*#__PURE__*/ (0, exports.traverseSeqArray)(function_1.identity);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chainFirst = exports.tap;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `T.Functor` instead of `T.task`
	 * (where `T` is from `import T from 'fp-ts/Task'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.task = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _apPar,
	    chain: exports.flatMap,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `T.Functor` instead of `T.taskSeq`
	 * (where `T` is from `import T from 'fp-ts/Task'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.taskSeq = {
	    URI: exports.URI,
	    map: _map,
	    of: exports.of,
	    ap: _apSeq,
	    chain: exports.flatMap,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getSemigroup = (0, Apply_1.getApplySemigroup)(exports.ApplySeq);
	/**
	 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
	 *
	 * Lift a monoid into 'Task', the inner values are concatenated using the provided `Monoid`.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getMonoid = (0, Applicative_1.getApplicativeMonoid)(exports.ApplicativeSeq); 
} (Task));

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.throwError = exports.of = exports.altW = exports.alt = exports.flatten = exports.flattenW = exports.flatMap = exports.apW = exports.ap = exports.mapLeft = exports.mapError = exports.bimap = exports.mapBoth = exports.map = exports.fromIOEitherK = exports.chainTaskOptionK = exports.chainTaskOptionKW = exports.fromTaskOptionK = exports.swap = exports.orLeft = exports.orElseFirstTaskK = exports.orElseFirstIOK = exports.tapError = exports.orElseW = exports.orElse = exports.chainNullableK = exports.fromNullableK = exports.fromNullable = exports.toUnion = exports.tryCatchK = exports.tryCatch = exports.getOrElseW = exports.getOrElse = exports.foldW = exports.matchEW = exports.fold = exports.matchE = exports.matchW = exports.match = exports.fromTaskOption = exports.fromIOEither = exports.fromEither = exports.fromTask = exports.fromIO = exports.leftIO = exports.rightIO = exports.leftTask = exports.rightTask = exports.right = exports.left = void 0;
	exports.fromPredicate = exports.chainFirstEitherKW = exports.chainFirstEitherK = exports.chainEitherKW = exports.chainEitherK = exports.flatMapTaskOption = exports.flatMapIOEither = exports.flatMapTask = exports.flatMapIO = exports.flatMapEither = exports.flatMapOption = exports.flatMapNullable = exports.liftOption = exports.liftNullable = exports.chainOptionKW = exports.chainOptionK = exports.fromOptionK = exports.fromOption = exports.Alt = exports.Bifunctor = exports.tapTask = exports.tapIO = exports.tapEither = exports.tap = exports.FromTask = exports.FromIO = exports.FromEither = exports.MonadThrow = exports.MonadTask = exports.MonadIO = exports.Monad = exports.Chain = exports.ApplicativeSeq = exports.ApplySeq = exports.ApplicativePar = exports.apSecondW = exports.apSecond = exports.apFirstW = exports.apFirst = exports.ApplyPar = exports.Pointed = exports.flap = exports.asUnit = exports.as = exports.Functor = exports.getFilterable = exports.getCompactable = exports.getAltTaskValidation = exports.getApplicativeTaskValidation = exports.URI = void 0;
	exports.getTaskValidation = exports.getSemigroup = exports.getApplyMonoid = exports.getApplySemigroup = exports.taskEitherSeq = exports.taskEither = exports.orElseFirstW = exports.orElseFirst = exports.chainFirstW = exports.chainFirst = exports.chainW = exports.chain = exports.sequenceSeqArray = exports.traverseSeqArray = exports.traverseSeqArrayWithIndex = exports.sequenceArray = exports.traverseArray = exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndexSeq = exports.traverseReadonlyNonEmptyArrayWithIndexSeq = exports.traverseReadonlyArrayWithIndex = exports.traverseReadonlyNonEmptyArrayWithIndex = exports.ApT = exports.apSW = exports.apS = exports.bindW = exports.bind = exports.let = exports.bindTo = exports.Do = exports.bracketW = exports.bracket = exports.taskify = exports.chainIOEitherK = exports.chainIOEitherKW = exports.chainFirstTaskK = exports.chainTaskK = exports.fromTaskK = exports.chainFirstIOK = exports.chainIOK = exports.fromIOK = exports.fromEitherK = exports.filterOrElseW = exports.filterOrElse = void 0;
	var Applicative_1 = Applicative;
	var Apply_1 = Apply;
	var chainable = __importStar(Chain);
	var Compactable_1 = Compactable$1;
	var E = __importStar(Either);
	var ET = __importStar(EitherT);
	var Filterable_1 = Filterable;
	var FromEither_1 = FromEither;
	var FromIO_1 = FromIO;
	var FromTask_1 = FromTask;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var T = __importStar(Task);
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.left = ET.left(T.Pointed);
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.right = ET.right(T.Pointed);
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.rightTask = ET.rightF(T.Functor);
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.leftTask = ET.leftF(T.Functor);
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.rightIO = (0, function_1.flow)(T.fromIO, exports.rightTask);
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.leftIO = (0, function_1.flow)(T.fromIO, exports.leftTask);
	// -------------------------------------------------------------------------------------
	// conversions
	// -------------------------------------------------------------------------------------
	/**
	 * @category conversions
	 * @since 2.7.0
	 */
	exports.fromIO = exports.rightIO;
	/**
	 * @category conversions
	 * @since 2.7.0
	 */
	exports.fromTask = exports.rightTask;
	/**
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.fromEither = T.of;
	/**
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.fromIOEither = T.fromIO;
	/**
	 * @category conversions
	 * @since 2.11.0
	 */
	var fromTaskOption = function (onNone) {
	    return T.map(E.fromOption(onNone));
	};
	exports.fromTaskOption = fromTaskOption;
	/**
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.match = 
	/*#__PURE__*/ ET.match(T.Functor);
	/**
	 * Less strict version of [`match`](#match).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchW = exports.match;
	/**
	 * The `E` suffix (short for **E**ffect) means that the handlers return an effect (`Task`).
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchE = ET.matchE(T.Monad);
	/**
	 * Alias of [`matchE`](#matche).
	 *
	 * @category pattern matching
	 * @since 2.0.0
	 */
	exports.fold = exports.matchE;
	/**
	 * Less strict version of [`matchE`](#matche).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchEW = exports.matchE;
	/**
	 * Alias of [`matchEW`](#matchew).
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.foldW = exports.matchEW;
	/**
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.getOrElse = 
	/*#__PURE__*/ ET.getOrElse(T.Monad);
	/**
	 * Less strict version of [`getOrElse`](#getorelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return type will be merged.
	 *
	 * @category error handling
	 * @since 2.6.0
	 */
	exports.getOrElseW = exports.getOrElse;
	/**
	 * Transforms a `Promise` that may reject to a `Promise` that never rejects and returns an `Either` instead.
	 *
	 * See also [`tryCatchK`](#trycatchk).
	 *
	 * @example
	 * import { left, right } from 'fp-ts/Either'
	 * import { tryCatch } from 'fp-ts/TaskEither'
	 *
	 * tryCatch(() => Promise.resolve(1), String)().then(result => {
	 *   assert.deepStrictEqual(result, right(1))
	 * })
	 * tryCatch(() => Promise.reject('error'), String)().then(result => {
	 *   assert.deepStrictEqual(result, left('error'))
	 * })
	 *
	 * @category interop
	 * @since 2.0.0
	 */
	var tryCatch = function (f, onRejected) {
	    return function () { return __awaiter(void 0, void 0, void 0, function () {
	        var reason_1;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    _a.trys.push([0, 2, , 3]);
	                    return [4 /*yield*/, f().then(_.right)];
	                case 1: return [2 /*return*/, _a.sent()];
	                case 2:
	                    reason_1 = _a.sent();
	                    return [2 /*return*/, _.left(onRejected(reason_1))];
	                case 3: return [2 /*return*/];
	            }
	        });
	    }); };
	};
	exports.tryCatch = tryCatch;
	/**
	 * Converts a function returning a `Promise` to one returning a `TaskEither`.
	 *
	 * @category interop
	 * @since 2.5.0
	 */
	var tryCatchK = function (f, onRejected) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return (0, exports.tryCatch)(function () { return f.apply(void 0, a); }, onRejected);
	    };
	};
	exports.tryCatchK = tryCatchK;
	/**
	 * @category conversions
	 * @since 2.10.0
	 */
	exports.toUnion = ET.toUnion(T.Functor);
	/**
	 * @category conversions
	 * @since 2.12.0
	 */
	exports.fromNullable = ET.fromNullable(T.Pointed);
	/**
	 * Use `liftNullable`.
	 *
	 * @category legacy
	 * @since 2.12.0
	 */
	exports.fromNullableK = ET.fromNullableK(T.Pointed);
	/**
	 * Use `flatMapNullable`.
	 *
	 * @category legacy
	 * @since 2.12.0
	 */
	exports.chainNullableK = 
	/*#__PURE__*/ ET.chainNullableK(T.Monad);
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * Returns `ma` if is a `Right` or the value returned by `onLeft` otherwise.
	 *
	 * See also [alt](#alt).
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as TE from 'fp-ts/TaskEither'
	 *
	 * async function test() {
	 *   const errorHandler = TE.orElse((error: string) => TE.right(`recovering from ${error}...`))
	 *   assert.deepStrictEqual(await pipe(TE.right('ok'), errorHandler)(), E.right('ok'))
	 *   assert.deepStrictEqual(await pipe(TE.left('ko'), errorHandler)(), E.right('recovering from ko...'))
	 * }
	 *
	 * test()
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.orElse = 
	/*#__PURE__*/ ET.orElse(T.Monad);
	/**
	 * Less strict version of [`orElse`](#orelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @category error handling
	 * @since 2.10.0
	 */
	exports.orElseW = exports.orElse;
	/**
	 * Returns an effect that effectfully "peeks" at the failure of this effect.
	 *
	 * @category error handling
	 * @since 2.15.0
	 */
	exports.tapError = (0, function_1.dual)(2, ET.tapError(T.Monad));
	/**
	 * @category error handling
	 * @since 2.12.0
	 */
	var orElseFirstIOK = function (onLeft) { return (0, exports.tapError)((0, exports.fromIOK)(onLeft)); };
	exports.orElseFirstIOK = orElseFirstIOK;
	/**
	 * @category error handling
	 * @since 2.12.0
	 */
	var orElseFirstTaskK = function (onLeft) { return (0, exports.tapError)((0, exports.fromTaskK)(onLeft)); };
	exports.orElseFirstTaskK = orElseFirstTaskK;
	/**
	 * @category error handling
	 * @since 2.11.0
	 */
	exports.orLeft = 
	/*#__PURE__*/ ET.orLeft(T.Monad);
	/**
	 * @since 2.0.0
	 */
	exports.swap = ET.swap(T.Functor);
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	var fromTaskOptionK = function (onNone) {
	    var from = (0, exports.fromTaskOption)(onNone);
	    return function (f) { return (0, function_1.flow)(f, from); };
	};
	exports.fromTaskOptionK = fromTaskOptionK;
	/**
	 * Use `flatMapTaskOption`.
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category legacy
	 * @since 2.12.3
	 */
	var chainTaskOptionKW = function (onNone) {
	    return function (f) {
	        return function (ma) {
	            return (0, exports.flatMap)(ma, (0, exports.fromTaskOptionK)(onNone)(f));
	        };
	    };
	};
	exports.chainTaskOptionKW = chainTaskOptionKW;
	/**
	 * Use `flatMapTaskOption`.
	 *
	 * @category legacy
	 * @since 2.11.0
	 */
	exports.chainTaskOptionK = exports.chainTaskOptionKW;
	/**
	 * @category lifting
	 * @since 2.4.0
	 */
	var fromIOEitherK = function (f) { return (0, function_1.flow)(f, exports.fromIOEither); };
	exports.fromIOEitherK = fromIOEitherK;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _apPar = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	var _apSeq = function (fab, fa) { return (0, exports.flatMap)(fab, function (f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); }); };
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	exports.map = ET.map(T.Functor);
	/**
	 * Returns a `TaskEither` whose failure and success channels have been mapped by the specified pair of functions, `f` and `g`.
	 *
	 * @example
	 * import * as TaskEither from 'fp-ts/TaskEither'
	 * import * as Either from 'fp-ts/Either'
	 *
	 * const f = (s: string) => new Error(s)
	 * const g = (n: number) => n * 2
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await TaskEither.mapBoth(TaskEither.right(1), f, g)(), Either.right(2))
	 *   assert.deepStrictEqual(await TaskEither.mapBoth(TaskEither.left('err'), f, g)(), Either.left(new Error('err')))
	 * }
	 *
	 * test()
	 *
	 * @category error handling
	 * @since 2.16.0
	 */
	exports.mapBoth = (0, function_1.dual)(3, ET.mapBoth(T.Functor));
	/**
	 * Alias of `mapBoth`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.bimap = exports.mapBoth;
	/**
	 * Returns a `TaskEither` with its error channel mapped using the specified function.
	 *
	 * @example
	 * import * as TaskEither from 'fp-ts/TaskEither'
	 * import * as Either from 'fp-ts/Either'
	 *
	 * const f = (s: string) => new Error(s)
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await TaskEither.mapError(TaskEither.right(1), f)(), Either.right(1))
	 *   assert.deepStrictEqual(await TaskEither.mapError(TaskEither.left('err'), f)(), Either.left(new Error('err')))
	 * }
	 *
	 * test()
	 *
	 * @category error handling
	 * @since 2.16.0
	 */
	exports.mapError = (0, function_1.dual)(2, ET.mapError(T.Functor));
	/**
	 * Alias of `mapError`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.mapLeft = exports.mapError;
	/**
	 * @since 2.0.0
	 */
	exports.ap = 
	/*#__PURE__*/ ET.ap(T.ApplyPar);
	/**
	 * Less strict version of [`ap`](#ap).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.8.0
	 */
	exports.apW = exports.ap;
	/**
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, ET.flatMap(T.Monad));
	/**
	 * Less strict version of [`flatten`](#flatten).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category sequencing
	 * @since 2.11.0
	 */
	exports.flattenW = 
	/*#__PURE__*/ (0, exports.flatMap)(function_1.identity);
	/**
	 * @category sequencing
	 * @since 2.0.0
	 */
	exports.flatten = exports.flattenW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `TaskEither` returns `fa` if is a `Right` or the value returned by `that` otherwise.
	 *
	 * See also [orElse](#orelse).
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as TE from 'fp-ts/TaskEither'
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(
	 *     await pipe(
	 *       TE.right(1),
	 *       TE.alt(() => TE.right(2))
	 *     )(),
	 *     E.right(1)
	 *   )
	 *   assert.deepStrictEqual(
	 *     await pipe(
	 *       TE.left('a'),
	 *       TE.alt(() => TE.right(2))
	 *     )(),
	 *     E.right(2)
	 *   )
	 *   assert.deepStrictEqual(
	 *     await pipe(
	 *       TE.left('a'),
	 *       TE.alt(() => TE.left('b'))
	 *     )(),
	 *     E.left('b')
	 *   )
	 * }
	 *
	 * test()
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.alt = 
	/*#__PURE__*/ ET.alt(T.Monad);
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the error and the return types will be merged.
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	exports.altW = exports.alt;
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.of = exports.right;
	/**
	 * @since 2.7.0
	 */
	exports.throwError = exports.left;
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'TaskEither';
	/**
	 * The default [`ApplicativePar`](#applicativepar) instance returns the first error, if you want to
	 * get all errors you need to provide a way to concatenate them via a `Semigroup`.
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as S from 'fp-ts/Semigroup'
	 * import * as string from 'fp-ts/string'
	 * import * as T from 'fp-ts/Task'
	 * import * as TE from 'fp-ts/TaskEither'
	 *
	 * interface User {
	 *   readonly id: string
	 *   readonly name: string
	 * }
	 *
	 * const remoteDatabase: ReadonlyArray<User> = [
	 *   { id: 'id1', name: 'John' },
	 *   { id: 'id2', name: 'Mary' },
	 *   { id: 'id3', name: 'Joey' }
	 * ]
	 *
	 * const fetchUser = (id: string): TE.TaskEither<string, User> =>
	 *   pipe(
	 *     remoteDatabase,
	 *     RA.findFirst((user) => user.id === id),
	 *     TE.fromOption(() => `${id} not found`)
	 *   )
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(
	 *     await pipe(['id4', 'id5'], RA.traverse(TE.ApplicativePar)(fetchUser))(),
	 *     E.left('id4 not found') // <= first error
	 *   )
	 *
	 *   const Applicative = TE.getApplicativeTaskValidation(
	 *     T.ApplyPar,
	 *     pipe(string.Semigroup, S.intercalate(', '))
	 *   )
	 *
	 *   assert.deepStrictEqual(
	 *     await pipe(['id4', 'id5'], RA.traverse(Applicative)(fetchUser))(),
	 *     E.left('id4 not found, id5 not found') // <= all errors
	 *   )
	 * }
	 *
	 * test()
	 *
	 * @category error handling
	 * @since 2.7.0
	 */
	function getApplicativeTaskValidation(A, S) {
	    var ap = (0, Apply_1.ap)(A, E.getApplicativeValidation(S));
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        ap: function (fab, fa) { return (0, function_1.pipe)(fab, ap(fa)); },
	        of: exports.of
	    };
	}
	exports.getApplicativeTaskValidation = getApplicativeTaskValidation;
	/**
	 * The default [`Alt`](#alt) instance returns the last error, if you want to
	 * get all errors you need to provide a way to concatenate them via a `Semigroup`.
	 *
	 * See [`getAltValidation`](./Either.ts.html#getaltvalidation).
	 *
	 * @category error handling
	 * @since 2.7.0
	 */
	function getAltTaskValidation(S) {
	    var alt = ET.altValidation(T.Monad, S);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        alt: function (fa, that) { return (0, function_1.pipe)(fa, alt(that)); }
	    };
	}
	exports.getAltTaskValidation = getAltTaskValidation;
	/**
	 * @category filtering
	 * @since 2.10.0
	 */
	var getCompactable = function (M) {
	    var C = E.getCompactable(M);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        compact: (0, Compactable_1.compact)(T.Functor, C),
	        separate: (0, Compactable_1.separate)(T.Functor, C, E.Functor)
	    };
	};
	exports.getCompactable = getCompactable;
	/**
	 * @category filtering
	 * @since 2.1.0
	 */
	function getFilterable(M) {
	    var F = E.getFilterable(M);
	    var C = (0, exports.getCompactable)(M);
	    var filter = (0, Filterable_1.filter)(T.Functor, F);
	    var filterMap = (0, Filterable_1.filterMap)(T.Functor, F);
	    var partition = (0, Filterable_1.partition)(T.Functor, F);
	    var partitionMap = (0, Filterable_1.partitionMap)(T.Functor, F);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        compact: C.compact,
	        separate: C.separate,
	        filter: function (fa, predicate) { return (0, function_1.pipe)(fa, filter(predicate)); },
	        filterMap: function (fa, f) { return (0, function_1.pipe)(fa, filterMap(f)); },
	        partition: function (fa, predicate) { return (0, function_1.pipe)(fa, partition(predicate)); },
	        partitionMap: function (fa, f) { return (0, function_1.pipe)(fa, partitionMap(f)); }
	    };
	}
	exports.getFilterable = getFilterable;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * Maps the `Right` value of this `TaskEither` to the specified constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.as = (0, function_1.dual)(2, (0, Functor_1.as)(exports.Functor));
	/**
	 * Maps the `Right` value of this `TaskEither` to the void constant value.
	 *
	 * @category mapping
	 * @since 2.16.0
	 */
	exports.asUnit = (0, Functor_1.asUnit)(exports.Functor);
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * Runs computations in parallel.
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.ApplyPar = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.0.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.ApplyPar);
	/**
	 * Less strict version of [`apFirst`](#apfirst).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.12.0
	 */
	exports.apFirstW = exports.apFirst;
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.0.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.ApplyPar);
	/**
	 * Less strict version of [`apSecond`](#apsecond).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.12.0
	 */
	exports.apSecondW = exports.apSecond;
	/**
	 * Runs computations in parallel.
	 *
	 * @category instances
	 * @since 2.7.0
	 */
	exports.ApplicativePar = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    of: exports.of
	};
	/**
	 * Runs computations sequentially.
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.ApplySeq = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apSeq
	};
	/**
	 * Runs computations sequentially.
	 *
	 * @category instances
	 * @since 2.7.0
	 */
	exports.ApplicativeSeq = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apSeq,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonadIO = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap,
	    of: exports.of,
	    fromIO: exports.fromIO
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonadTask = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap,
	    of: exports.of,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonadThrow = {
	    URI: exports.URI,
	    map: _map,
	    ap: _apPar,
	    chain: exports.flatMap,
	    of: exports.of,
	    throwError: exports.throwError
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromEither = {
	    URI: exports.URI,
	    fromEither: exports.fromEither
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromIO = {
	    URI: exports.URI,
	    fromIO: exports.fromIO
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.FromTask = {
	    URI: exports.URI,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask
	};
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @category combinators
	 * @since 2.15.0
	 */
	exports.tap = (0, function_1.dual)(2, chainable.tap(exports.Chain));
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import * as E from 'fp-ts/Either'
	 * import { pipe } from 'fp-ts/function'
	 * import * as TE from 'fp-ts/TaskEither'
	 *
	 * const checkString = (value: string) => pipe(
	 *   TE.of(value),
	 *   TE.tapEither(() => value.length > 0 ? E.right('ok') : E.left('error'))
	 * )
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await checkString('')(), E.left('error'))
	 *   assert.deepStrictEqual(await checkString('fp-ts')(), E.right('fp-ts'))
	 * }
	 *
	 * test()
	 *
	 * @category combinators
	 * @since 2.16.0
	 */
	exports.tapEither = (0, function_1.dual)(2, (0, FromEither_1.tapEither)(exports.FromEither, exports.Chain));
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as TE from 'fp-ts/TaskEither'
	 * import * as E from 'fp-ts/Either'
	 * import * as Console from 'fp-ts/Console'
	 *
	 *
	 * // Will produce `Hello, fp-ts` to the stdout
	 * const effectA = TE.tapIO(
	 *   TE.of(1),
	 *   (value) => Console.log(`Hello, ${value}`)
	 * )
	 *
	 * // No output to the stdout
	 * const effectB = pipe(
	 *   TE.left('error'),
	 *   TE.tapIO((value) => Console.log(`Hello, ${value}`))
	 * )
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await effectA(), E.of(1))
	 *   assert.deepStrictEqual(await effectB(), E.left('error'))
	 * }
	 *
	 * test()
	 *
	 * @category combinators
	 * @since 2.16.0
	 */
	exports.tapIO = (0, function_1.dual)(2, (0, FromIO_1.tapIO)(exports.FromIO, exports.Chain));
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import * as TE from 'fp-ts/TaskEither'
	 * import * as T from 'fp-ts/Task'
	 * import * as E from 'fp-ts/Either'
	 *
	 *
	 * const effect = TE.tapIO(
	 *   TE.of(1),
	 *   (value) => T.of(value + 1)
	 * )
	 *
	 * async function test() {
	 *   assert.deepStrictEqual(await effect(), E.of(1))
	 * }
	 *
	 * test()
	 *
	 * @category combinators
	 * @since 2.16.0
	 */
	exports.tapTask = (0, function_1.dual)(2, (0, FromTask_1.tapTask)(exports.FromTask, exports.Chain));
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Bifunctor = {
	    URI: exports.URI,
	    bimap: exports.mapBoth,
	    mapLeft: exports.mapError
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @category conversions
	 * @since 2.0.0
	 */
	exports.fromOption = 
	/*#__PURE__*/ (0, FromEither_1.fromOption)(exports.FromEither);
	/**
	 * Use `liftOption`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.fromOptionK = 
	/*#__PURE__*/ (0, FromEither_1.fromOptionK)(exports.FromEither);
	/**
	 * Use `flatMapOption`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainOptionK = (0, FromEither_1.chainOptionK)(exports.FromEither, exports.Chain);
	/**
	 * Use `flatMapOption`.
	 *
	 * @category legacy
	 * @since 2.13.2
	 */
	exports.chainOptionKW = 
	 exports.chainOptionK;
	/** @internal */
	var _FromEither = {
	    fromEither: exports.FromEither.fromEither
	};
	/**
	 * @category lifting
	 * @since 2.15.0
	 */
	exports.liftNullable = _.liftNullable(_FromEither);
	/**
	 * @category lifting
	 * @since 2.15.0
	 */
	exports.liftOption = _.liftOption(_FromEither);
	/** @internal */
	var _FlatMap = {
	    flatMap: exports.flatMap
	};
	/** @internal */
	var _FromIO = {
	    fromIO: exports.FromIO.fromIO
	};
	/** @internal */
	var _FromTask = {
	    fromTask: exports.fromTask
	};
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapNullable = _.flatMapNullable(_FromEither, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapOption = _.flatMapOption(_FromEither, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapEither = _.flatMapEither(_FromEither, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.15.0
	 */
	exports.flatMapIO = _.flatMapIO(_FromIO, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.16.0
	 */
	exports.flatMapTask = _.flatMapTask(_FromTask, _FlatMap);
	/**
	 * @category sequencing
	 * @since 2.16.0
	 */
	exports.flatMapIOEither = (0, function_1.dual)(2, function (self, f) {
	    return (0, exports.flatMap)(self, (0, exports.fromIOEitherK)(f));
	});
	/**
	 * @category sequencing
	 * @since 2.16.0
	 */
	exports.flatMapTaskOption = (0, function_1.dual)(3, function (self, f, onNone) {
	    return (0, exports.flatMap)(self, function (a) { return (0, exports.fromTaskOption)(function () { return onNone(a); })(f(a)); });
	});
	/**
	 * Alias of `flatMapEither`.
	 *
	 * @category legacy
	 * @since 2.4.0
	 */
	exports.chainEitherK = exports.flatMapEither;
	/**
	 * Alias of `flatMapEither`.
	 *
	 * @category legacy
	 * @since 2.6.1
	 */
	exports.chainEitherKW = exports.flatMapEither;
	/**
	 * Alias of `tapEither`.
	 *
	 * @category legacy
	 * @since 2.12.0
	 */
	exports.chainFirstEitherK = exports.tapEither;
	/**
	 * Alias of `tapEither`.
	 *
	 * Less strict version of [`chainFirstEitherK`](#chainfirsteitherk).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category legacy
	 * @since 2.12.0
	 */
	exports.chainFirstEitherKW = exports.tapEither;
	/**
	 * @category lifting
	 * @since 2.0.0
	 */
	exports.fromPredicate = (0, FromEither_1.fromPredicate)(exports.FromEither);
	/**
	 * @category filtering
	 * @since 2.0.0
	 */
	exports.filterOrElse = (0, FromEither_1.filterOrElse)(exports.FromEither, exports.Chain);
	/**
	 * Less strict version of [`filterOrElse`](#filterorelse).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category filtering
	 * @since 2.9.0
	 */
	exports.filterOrElseW = exports.filterOrElse;
	/**
	 * @category lifting
	 * @since 2.4.0
	 */
	exports.fromEitherK = (0, FromEither_1.fromEitherK)(exports.FromEither);
	/**
	 * @category lifting
	 * @since 2.10.0
	 */
	exports.fromIOK = (0, FromIO_1.fromIOK)(exports.FromIO);
	/**
	 * Alias of `flatMapIO`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainIOK = exports.flatMapIO;
	/**
	 * Alias of `tapIO`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainFirstIOK = exports.tapIO;
	/**
	 * @category lifting
	 * @since 2.10.0
	 */
	exports.fromTaskK = (0, FromTask_1.fromTaskK)(exports.FromTask);
	/**
	 * Alias of `flatMapTask`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainTaskK = exports.flatMapTask;
	/**
	 * Alias of `tapTask`.
	 *
	 * @category legacy
	 * @since 2.10.0
	 */
	exports.chainFirstTaskK = exports.tapTask;
	/**
	 * Alias of `flatMapIOEither`.
	 *
	 * Less strict version of [`chainIOEitherK`](#chainioeitherk).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category legacy
	 * @since 2.6.1
	 */
	exports.chainIOEitherKW = exports.flatMapIOEither;
	/**
	 * Alias of `flatMapIOEither`.
	 *
	 * @category legacy
	 * @since 2.4.0
	 */
	exports.chainIOEitherK = exports.flatMapIOEither;
	function taskify(f) {
	    return function () {
	        var args = Array.prototype.slice.call(arguments);
	        return function () {
	            return new Promise(function (resolve) {
	                var cbResolver = function (e, r) { return (e != null ? resolve(_.left(e)) : resolve(_.right(r))); };
	                f.apply(null, args.concat(cbResolver));
	            });
	        };
	    };
	}
	exports.taskify = taskify;
	/**
	 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
	 * whether the body action throws (\*) or returns.
	 *
	 * (\*) i.e. returns a `Left`
	 *
	 * @since 2.0.0
	 */
	var bracket = function (acquire, use, release) { return (0, exports.bracketW)(acquire, use, release); };
	exports.bracket = bracket;
	/**
	 * Less strict version of [`bracket`](#bracket).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @since 2.12.0
	 */
	var bracketW = function (acquire, use, release) {
	    return (0, exports.flatMap)(acquire, function (a) { return T.flatMap(use(a), function (e) { return (0, exports.flatMap)(release(a, e), function () { return T.of(e); }); }); });
	};
	exports.bracketW = bracketW;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = chainable.bind(exports.Chain);
	/**
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindW = exports.bind;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.ApplyPar);
	/**
	 * Less strict version of [`apS`](#aps).
	 *
	 * The `W` suffix (short for **W**idening) means that the error types will be merged.
	 *
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apSW = exports.apS;
	/**
	 * @since 2.11.0
	 */
	exports.ApT = (0, exports.of)(_.emptyReadonlyArray);
	// -------------------------------------------------------------------------------------
	// array utils
	// -------------------------------------------------------------------------------------
	/**
	 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(ApplicativePar)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndex = function (f) {
	    return (0, function_1.flow)(T.traverseReadonlyNonEmptyArrayWithIndex(f), T.map(E.traverseReadonlyNonEmptyArrayWithIndex(function_1.SK)));
	};
	exports.traverseReadonlyNonEmptyArrayWithIndex = traverseReadonlyNonEmptyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativePar)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndex = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndex)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndex = traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyNonEmptyArrayWithIndexSeq = function (f) {
	    return function (as) {
	        return function () {
	            return _.tail(as).reduce(function (acc, a, i) {
	                return acc.then(function (ebs) {
	                    return _.isLeft(ebs)
	                        ? acc
	                        : f(i + 1, a)().then(function (eb) {
	                            if (_.isLeft(eb)) {
	                                return eb;
	                            }
	                            ebs.right.push(eb.right);
	                            return ebs;
	                        });
	                });
	            }, f(0, _.head(as))().then(E.map(_.singleton)));
	        };
	    };
	};
	exports.traverseReadonlyNonEmptyArrayWithIndexSeq = traverseReadonlyNonEmptyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.11.0
	 */
	var traverseReadonlyArrayWithIndexSeq = function (f) {
	    var g = (0, exports.traverseReadonlyNonEmptyArrayWithIndexSeq)(f);
	    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
	};
	exports.traverseReadonlyArrayWithIndexSeq = traverseReadonlyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex;
	/**
	 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseArray = function (f) { return (0, exports.traverseReadonlyArrayWithIndex)(function (_, a) { return f(a); }); };
	exports.traverseArray = traverseArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceArray = 
	/*#__PURE__*/ (0, exports.traverseArray)(function_1.identity);
	/**
	 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.traverseSeqArrayWithIndex = exports.traverseReadonlyArrayWithIndexSeq;
	/**
	 * Equivalent to `ReadonlyArray#traverse(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	var traverseSeqArray = function (f) { return (0, exports.traverseReadonlyArrayWithIndexSeq)(function (_, a) { return f(a); }); };
	exports.traverseSeqArray = traverseSeqArray;
	/**
	 * Equivalent to `ReadonlyArray#sequence(ApplicativeSeq)`.
	 *
	 * @category traversing
	 * @since 2.9.0
	 */
	exports.sequenceSeqArray = 
	/*#__PURE__*/ (0, exports.traverseSeqArray)(function_1.identity);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.6.0
	 */
	exports.chainW = exports.flatMap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chainFirst = exports.tap;
	/**
	 * Alias of `tap`.
	 *
	 * @category legacy
	 * @since 2.8.0
	 */
	exports.chainFirstW = exports.tap;
	/**
	 * Alias of `tapError`.
	 *
	 * @category legacy
	 * @since 2.11.0
	 */
	exports.orElseFirst = exports.tapError;
	/**
	 * Alias of `tapError`.
	 *
	 * @category legacy
	 * @since 2.11.0
	 */
	exports.orElseFirstW = exports.tapError;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `TE.Functor` instead of `TE.taskEither`
	 * (where `TE` is from `import TE from 'fp-ts/TaskEither'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.taskEither = {
	    URI: exports.URI,
	    bimap: exports.mapBoth,
	    mapLeft: exports.mapError,
	    map: _map,
	    of: exports.of,
	    ap: _apPar,
	    chain: exports.flatMap,
	    alt: _alt,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask,
	    throwError: exports.throwError
	};
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `TE.Functor` instead of `TE.taskEitherSeq`
	 * (where `TE` is from `import TE from 'fp-ts/TaskEither'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.taskEitherSeq = {
	    URI: exports.URI,
	    bimap: exports.mapBoth,
	    mapLeft: exports.mapError,
	    map: _map,
	    of: exports.of,
	    ap: _apSeq,
	    chain: exports.flatMap,
	    alt: _alt,
	    fromIO: exports.fromIO,
	    fromTask: exports.fromTask,
	    throwError: exports.throwError
	};
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplySemigroup = 
	/*#__PURE__*/ (0, Apply_1.getApplySemigroup)(exports.ApplySeq);
	/**
	 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.getApplyMonoid = 
	/*#__PURE__*/ (0, Applicative_1.getApplicativeMonoid)(exports.ApplicativeSeq);
	/**
	 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var getSemigroup = function (S) {
	    return (0, Apply_1.getApplySemigroup)(T.ApplySeq)(E.getSemigroup(S));
	};
	exports.getSemigroup = getSemigroup;
	/**
	 * Use [`getApplicativeTaskValidation`](#getapplicativetaskvalidation) and [`getAltTaskValidation`](#getalttaskvalidation) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	function getTaskValidation(SE) {
	    var applicativeTaskValidation = getApplicativeTaskValidation(T.ApplicativePar, SE);
	    var altTaskValidation = getAltTaskValidation(SE);
	    return {
	        URI: exports.URI,
	        _E: undefined,
	        map: _map,
	        ap: applicativeTaskValidation.ap,
	        of: exports.of,
	        chain: exports.flatMap,
	        bimap: exports.mapBoth,
	        mapLeft: exports.mapError,
	        alt: altTaskValidation.alt,
	        fromIO: exports.fromIO,
	        fromTask: exports.fromTask,
	        throwError: exports.throwError
	    };
	}
	exports.getTaskValidation = getTaskValidation; 
} (TaskEither));

var __spreadArray$2 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * @since 2.0.0
 */
function identity$1(a) {
    return a;
}
/**
 * @since 2.0.0
 */
var unsafeCoerce = identity$1;
/**
 * @since 2.0.0
 */
function constant$1(a) {
    return function () { return a; };
}
/**
 * A thunk that returns always `null`.
 *
 * @since 2.0.0
 */
var constNull = /*#__PURE__*/ constant$1(null);
function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
    switch (arguments.length) {
        case 1:
            return ab;
        case 2:
            return function () {
                return bc(ab.apply(this, arguments));
            };
        case 3:
            return function () {
                return cd(bc(ab.apply(this, arguments)));
            };
        case 4:
            return function () {
                return de(cd(bc(ab.apply(this, arguments))));
            };
        case 5:
            return function () {
                return ef(de(cd(bc(ab.apply(this, arguments)))));
            };
        case 6:
            return function () {
                return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
            };
        case 7:
            return function () {
                return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
            };
        case 8:
            return function () {
                return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
            };
        case 9:
            return function () {
                return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
            };
    }
    return;
}
function pipe$1(a, ab, bc, cd, de, ef, fg, gh, hi) {
    switch (arguments.length) {
        case 1:
            return a;
        case 2:
            return ab(a);
        case 3:
            return bc(ab(a));
        case 4:
            return cd(bc(ab(a)));
        case 5:
            return de(cd(bc(ab(a))));
        case 6:
            return ef(de(cd(bc(ab(a)))));
        case 7:
            return fg(ef(de(cd(bc(ab(a))))));
        case 8:
            return gh(fg(ef(de(cd(bc(ab(a)))))));
        case 9:
            return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
        default: {
            var ret = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                ret = arguments[i](ret);
            }
            return ret;
        }
    }
}
/** @internal */
var dual = function (arity, body) {
    var isDataFirst = typeof arity === 'number' ? function (args) { return args.length >= arity; } : arity;
    return function () {
        var args = Array.from(arguments);
        if (isDataFirst(arguments)) {
            return body.apply(this, args);
        }
        return function (self) { return body.apply(void 0, __spreadArray$2([self], args, false)); };
    };
};

var __spreadArray$1 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/** @internal */
var none$1 = { _tag: 'None' };
/** @internal */
var some$2 = function (a) { return ({ _tag: 'Some', value: a }); };
// -------------------------------------------------------------------------------------
// Either
// -------------------------------------------------------------------------------------
/** @internal */
var isLeft$1 = function (ma) { return ma._tag === 'Left'; };
/** @internal */
var left$2 = function (e) { return ({ _tag: 'Left', left: e }); };
/** @internal */
var right$2 = function (a) { return ({ _tag: 'Right', right: a }); };
/** @internal */
var isNonEmpty$3 = function (as) { return as.length > 0; };
// -------------------------------------------------------------------------------------
// Record
// -------------------------------------------------------------------------------------
/** @internal */
var has = Object.prototype.hasOwnProperty;
// -------------------------------------------------------------------------------------
// NonEmptyArray
// -------------------------------------------------------------------------------------
/** @internal */
var fromReadonlyNonEmptyArray = function (as) { return __spreadArray$1([as[0]], as.slice(1), true); };

/**
 * ```ts
 * interface Separated<E, A> {
 *    readonly left: E
 *    readonly right: A
 * }
 * ```
 *
 * Represents a result of separating a whole into two parts.
 *
 * @since 2.10.0
 */
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.10.0
 */
var separated = function (left, right) { return ({ left: left, right: right }); };

function wiltDefault(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.separate); };
    };
}
function witherDefault(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.compact); };
    };
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure.
 *
 * @category constructors
 * @since 2.0.0
 */
var left$1 = left$2;
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure.
 *
 * @category constructors
 * @since 2.0.0
 */
var right$1 = right$2;
/**
 * @category mapping
 * @since 2.0.0
 */
var map$2 = function (f) { return function (fa) {
    return isLeft(fa) ? fa : right$1(f(fa.right));
}; };
// -------------------------------------------------------------------------------------
// refinements
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise.
 *
 * @category refinements
 * @since 2.0.0
 */
var isLeft = isLeft$1;

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * @category Decode error
 * @since 1.0.0
 */
var failures = left$1;
/**
 * @category Decode error
 * @since 1.0.0
 */
var failure = function (value, context, message) {
    return failures([{ value: value, context: context, message: message }]);
};
/**
 * @category Decode error
 * @since 1.0.0
 */
var success = right$1;
/**
 * @category Codec
 * @since 1.0.0
 */
var Type = /** @class */ (function () {
    function Type(
    /** a unique name for this codec */
    name, 
    /** a custom type guard */
    is, 
    /** succeeds if a value of type I can be decoded to a value of type A */
    validate, 
    /** converts a value of type A to a value of type O */
    encode) {
        this.name = name;
        this.is = is;
        this.validate = validate;
        this.encode = encode;
        this.decode = this.decode.bind(this);
    }
    /**
     * @since 1.0.0
     */
    Type.prototype.pipe = function (ab, name) {
        var _this = this;
        if (name === void 0) { name = "pipe(".concat(this.name, ", ").concat(ab.name, ")"); }
        return new Type(name, ab.is, function (i, c) {
            var e = _this.validate(i, c);
            if (isLeft(e)) {
                return e;
            }
            return ab.validate(e.right, c);
        }, this.encode === identity && ab.encode === identity ? identity : function (b) { return _this.encode(ab.encode(b)); });
    };
    /**
     * @since 1.0.0
     */
    Type.prototype.asDecoder = function () {
        return this;
    };
    /**
     * @since 1.0.0
     */
    Type.prototype.asEncoder = function () {
        return this;
    };
    /**
     * a version of `validate` with a default context
     * @since 1.0.0
     */
    Type.prototype.decode = function (i) {
        return this.validate(i, [{ key: '', type: this, actual: i }]);
    };
    return Type;
}());
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * @since 1.0.0
 */
var identity = function (a) { return a; };
/**
 * @since 1.0.0
 */
function getFunctionName(f) {
    return f.displayName || f.name || "<function".concat(f.length, ">");
}
/**
 * @since 1.0.0
 */
function appendContext(c, key, decoder, actual) {
    var len = c.length;
    var r = Array(len + 1);
    for (var i = 0; i < len; i++) {
        r[i] = c[i];
    }
    r[len] = { key: key, type: decoder, actual: actual };
    return r;
}
function pushAll(xs, ys) {
    var l = ys.length;
    for (var i = 0; i < l; i++) {
        xs.push(ys[i]);
    }
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
function getNameFromProps(props) {
    return Object.keys(props)
        .map(function (k) { return "".concat(k, ": ").concat(props[k].name); })
        .join(', ');
}
function useIdentity(codecs) {
    for (var i = 0; i < codecs.length; i++) {
        if (codecs[i].encode !== identity) {
            return false;
        }
    }
    return true;
}
function getInterfaceTypeName(props) {
    return "{ ".concat(getNameFromProps(props), " }");
}
function getPartialTypeName(inner) {
    return "Partial<".concat(inner, ">");
}
function getUnionName(codecs) {
    return '(' + codecs.map(function (type) { return type.name; }).join(' | ') + ')';
}
function getProps(codec) {
    switch (codec._tag) {
        case 'RefinementType':
        case 'ReadonlyType':
            return getProps(codec.type);
        case 'InterfaceType':
        case 'StrictType':
        case 'PartialType':
            return codec.props;
        case 'IntersectionType':
            return codec.types.reduce(function (props, type) { return Object.assign(props, getProps(type)); }, {});
    }
}
function stripKeys(o, props) {
    var keys = Object.getOwnPropertyNames(o);
    var shouldStrip = false;
    var r = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!hasOwnProperty.call(props, key)) {
            shouldStrip = true;
        }
        else {
            r[key] = o[key];
        }
    }
    return shouldStrip ? r : o;
}
function getExactTypeName(codec) {
    if (isTypeC(codec)) {
        return "{| ".concat(getNameFromProps(codec.props), " |}");
    }
    else if (isPartialC(codec)) {
        return getPartialTypeName("{| ".concat(getNameFromProps(codec.props), " |}"));
    }
    return "Exact<".concat(codec.name, ">");
}
function isNonEmpty$2(as) {
    return as.length > 0;
}
/**
 * @internal
 */
var emptyTags = {};
function intersect(a, b) {
    var r = [];
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var v = a_1[_i];
        if (b.indexOf(v) !== -1) {
            r.push(v);
        }
    }
    return r;
}
function mergeTags(a, b) {
    if (a === emptyTags) {
        return b;
    }
    if (b === emptyTags) {
        return a;
    }
    var r = Object.assign({}, a);
    for (var k in b) {
        if (hasOwnProperty.call(a, k)) {
            var intersection_1 = intersect(a[k], b[k]);
            if (isNonEmpty$2(intersection_1)) {
                r[k] = intersection_1;
            }
            else {
                r = emptyTags;
                break;
            }
        }
        else {
            r[k] = b[k];
        }
    }
    return r;
}
function intersectTags(a, b) {
    if (a === emptyTags || b === emptyTags) {
        return emptyTags;
    }
    var r = emptyTags;
    for (var k in a) {
        if (hasOwnProperty.call(b, k)) {
            var intersection_2 = intersect(a[k], b[k]);
            if (intersection_2.length === 0) {
                if (r === emptyTags) {
                    r = {};
                }
                r[k] = a[k].concat(b[k]);
            }
        }
    }
    return r;
}
function isLiteralC(codec) {
    return codec._tag === 'LiteralType';
}
function isTypeC(codec) {
    return codec._tag === 'InterfaceType';
}
function isPartialC(codec) {
    return codec._tag === 'PartialType';
}
// tslint:disable-next-line: deprecation
function isStrictC(codec) {
    return codec._tag === 'StrictType';
}
function isExactC(codec) {
    return codec._tag === 'ExactType';
}
// tslint:disable-next-line: deprecation
function isRefinementC(codec) {
    return codec._tag === 'RefinementType';
}
function isIntersectionC(codec) {
    return codec._tag === 'IntersectionType';
}
function isUnionC(codec) {
    return codec._tag === 'UnionType';
}
function isRecursiveC(codec) {
    return codec._tag === 'RecursiveType';
}
var lazyCodecs = [];
/**
 * @internal
 */
function getTags(codec) {
    if (lazyCodecs.indexOf(codec) !== -1) {
        return emptyTags;
    }
    if (isTypeC(codec) || isStrictC(codec)) {
        var index = emptyTags;
        // tslint:disable-next-line: forin
        for (var k in codec.props) {
            var prop = codec.props[k];
            if (isLiteralC(prop)) {
                if (index === emptyTags) {
                    index = {};
                }
                index[k] = [prop.value];
            }
        }
        return index;
    }
    else if (isExactC(codec) || isRefinementC(codec)) {
        return getTags(codec.type);
    }
    else if (isIntersectionC(codec)) {
        return codec.types.reduce(function (tags, codec) { return mergeTags(tags, getTags(codec)); }, emptyTags);
    }
    else if (isUnionC(codec)) {
        return codec.types.slice(1).reduce(function (tags, codec) { return intersectTags(tags, getTags(codec)); }, getTags(codec.types[0]));
    }
    else if (isRecursiveC(codec)) {
        lazyCodecs.push(codec);
        var tags = getTags(codec.type);
        lazyCodecs.pop();
        return tags;
    }
    return emptyTags;
}
/**
 * @internal
 */
function getIndex(codecs) {
    var tags = getTags(codecs[0]);
    var keys = Object.keys(tags);
    var len = codecs.length;
    var _loop_1 = function (k) {
        var all = tags[k].slice();
        var index = [tags[k]];
        for (var i = 1; i < len; i++) {
            var codec = codecs[i];
            var ctags = getTags(codec);
            var values = ctags[k];
            // tslint:disable-next-line: strict-type-predicates
            if (values === undefined) {
                return "continue-keys";
            }
            else {
                if (values.some(function (v) { return all.indexOf(v) !== -1; })) {
                    return "continue-keys";
                }
                else {
                    all.push.apply(all, values);
                    index.push(values);
                }
            }
        }
        return { value: [k, index] };
    };
    keys: for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var k = keys_1[_i];
        var state_1 = _loop_1(k);
        if (typeof state_1 === "object")
            return state_1.value;
        switch (state_1) {
            case "continue-keys": continue keys;
        }
    }
    return undefined;
}
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 1.0.0
 */
var NullType = /** @class */ (function (_super) {
    __extends(NullType, _super);
    function NullType() {
        var _this = _super.call(this, 'null', function (u) { return u === null; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NullType';
        return _this;
    }
    return NullType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
new NullType();
/**
 * @since 1.0.0
 */
var UndefinedType = /** @class */ (function (_super) {
    __extends(UndefinedType, _super);
    function UndefinedType() {
        var _this = _super.call(this, 'undefined', function (u) { return u === void 0; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UndefinedType';
        return _this;
    }
    return UndefinedType;
}(Type));
var undefinedType = new UndefinedType();
/**
 * @since 1.2.0
 */
var VoidType = /** @class */ (function (_super) {
    __extends(VoidType, _super);
    function VoidType() {
        var _this = _super.call(this, 'void', undefinedType.is, undefinedType.validate, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'VoidType';
        return _this;
    }
    return VoidType;
}(Type));
/**
 * @category primitives
 * @since 1.2.0
 */
new VoidType();
/**
 * @since 1.5.0
 */
var UnknownType = /** @class */ (function (_super) {
    __extends(UnknownType, _super);
    function UnknownType() {
        var _this = _super.call(this, 'unknown', function (_) { return true; }, success, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UnknownType';
        return _this;
    }
    return UnknownType;
}(Type));
/**
 * @category primitives
 * @since 1.5.0
 */
new UnknownType();
/**
 * @since 1.0.0
 */
var StringType = /** @class */ (function (_super) {
    __extends(StringType, _super);
    function StringType() {
        var _this = _super.call(this, 'string', function (u) { return typeof u === 'string'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'StringType';
        return _this;
    }
    return StringType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
var string$1 = new StringType();
/**
 * @since 1.0.0
 */
var NumberType = /** @class */ (function (_super) {
    __extends(NumberType, _super);
    function NumberType() {
        var _this = _super.call(this, 'number', function (u) { return typeof u === 'number'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NumberType';
        return _this;
    }
    return NumberType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
var number$1 = new NumberType();
/**
 * @since 2.1.0
 */
var BigIntType = /** @class */ (function (_super) {
    __extends(BigIntType, _super);
    function BigIntType() {
        var _this = _super.call(this, 'bigint', 
        // tslint:disable-next-line: valid-typeof
        function (u) { return typeof u === 'bigint'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'BigIntType';
        return _this;
    }
    return BigIntType;
}(Type));
/**
 * @category primitives
 * @since 2.1.0
 */
new BigIntType();
/**
 * @since 1.0.0
 */
var BooleanType = /** @class */ (function (_super) {
    __extends(BooleanType, _super);
    function BooleanType() {
        var _this = _super.call(this, 'boolean', function (u) { return typeof u === 'boolean'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'BooleanType';
        return _this;
    }
    return BooleanType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
new BooleanType();
/**
 * @since 1.0.0
 */
var AnyArrayType = /** @class */ (function (_super) {
    __extends(AnyArrayType, _super);
    function AnyArrayType() {
        var _this = _super.call(this, 'UnknownArray', Array.isArray, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyArrayType';
        return _this;
    }
    return AnyArrayType;
}(Type));
/**
 * @category primitives
 * @since 1.7.1
 */
var UnknownArray = new AnyArrayType();
/**
 * @since 1.0.0
 */
var AnyDictionaryType = /** @class */ (function (_super) {
    __extends(AnyDictionaryType, _super);
    function AnyDictionaryType() {
        var _this = _super.call(this, 'UnknownRecord', function (u) { return u !== null && typeof u === 'object' && !Array.isArray(u); }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyDictionaryType';
        return _this;
    }
    return AnyDictionaryType;
}(Type));
/**
 * @category primitives
 * @since 1.7.1
 */
var UnknownRecord = new AnyDictionaryType();
/**
 * @since 1.0.0
 */
var LiteralType = /** @class */ (function (_super) {
    __extends(LiteralType, _super);
    function LiteralType(name, is, validate, encode, value) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.value = value;
        /**
         * @since 1.0.0
         */
        _this._tag = 'LiteralType';
        return _this;
    }
    return LiteralType;
}(Type));
/**
 * @category constructors
 * @since 1.0.0
 */
function literal(value, name) {
    if (name === void 0) { name = JSON.stringify(value); }
    var is = function (u) { return u === value; };
    return new LiteralType(name, is, function (u, c) { return (is(u) ? success(value) : failure(u, c)); }, identity, value);
}
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(KeyofType, _super);
    function KeyofType(name, is, validate, encode, keys) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.keys = keys;
        /**
         * @since 1.0.0
         */
        _this._tag = 'KeyofType';
        return _this;
    }
    return KeyofType;
})(Type));
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 1.0.0
 */
var RefinementType = /** @class */ (function (_super) {
    __extends(RefinementType, _super);
    function RefinementType(name, is, validate, encode, type, predicate) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        _this.predicate = predicate;
        /**
         * @since 1.0.0
         */
        _this._tag = 'RefinementType';
        return _this;
    }
    return RefinementType;
}(Type));
/**
 * @category combinators
 * @since 1.8.1
 */
function brand(codec, predicate, name) {
    return refinement(codec, predicate, name);
}
/**
 * A branded codec representing an integer
 *
 * @category primitives
 * @since 1.8.1
 */
brand(number$1, function (n) { return Number.isInteger(n); }, 'Int');
/**
 * @since 1.0.0
 */
var RecursiveType = /** @class */ (function (_super) {
    __extends(RecursiveType, _super);
    function RecursiveType(name, is, validate, encode, runDefinition) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.runDefinition = runDefinition;
        /**
         * @since 1.0.0
         */
        _this._tag = 'RecursiveType';
        return _this;
    }
    return RecursiveType;
}(Type));
Object.defineProperty(RecursiveType.prototype, 'type', {
    get: function () {
        return this.runDefinition();
    },
    enumerable: true,
    configurable: true
});
/**
 * @since 1.0.0
 */
var ArrayType = /** @class */ (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ArrayType';
        return _this;
    }
    return ArrayType;
}(Type));
/**
 * @category combinators
 * @since 1.0.0
 */
function array(item, name) {
    if (name === void 0) { name = "Array<".concat(item.name, ">"); }
    return new ArrayType(name, function (u) { return UnknownArray.is(u) && u.every(item.is); }, function (u, c) {
        var e = UnknownArray.validate(u, c);
        if (isLeft(e)) {
            return e;
        }
        var us = e.right;
        var len = us.length;
        var as = us;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var ui = us[i];
            var result = item.validate(ui, appendContext(c, String(i), item, ui));
            if (isLeft(result)) {
                pushAll(errors, result.left);
            }
            else {
                var ai = result.right;
                if (ai !== ui) {
                    if (as === us) {
                        as = us.slice();
                    }
                    as[i] = ai;
                }
            }
        }
        return errors.length > 0 ? failures(errors) : success(as);
    }, item.encode === identity ? identity : function (a) { return a.map(item.encode); }, item);
}
/**
 * @since 1.0.0
 */
var InterfaceType = /** @class */ (function (_super) {
    __extends(InterfaceType, _super);
    function InterfaceType(name, is, validate, encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'InterfaceType';
        return _this;
    }
    return InterfaceType;
}(Type));
/**
 * @category combinators
 * @since 1.0.0
 */
function type(props, name) {
    if (name === void 0) { name = getInterfaceTypeName(props); }
    var keys = Object.keys(props);
    var types = keys.map(function (key) { return props[key]; });
    var len = keys.length;
    return new InterfaceType(name, function (u) {
        if (UnknownRecord.is(u)) {
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var uk = u[k];
                if ((uk === undefined && !hasOwnProperty.call(u, k)) || !types[i].is(uk)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }, function (u, c) {
        var e = UnknownRecord.validate(u, c);
        if (isLeft(e)) {
            return e;
        }
        var o = e.right;
        var a = o;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            var ak = a[k];
            var type_1 = types[i];
            var result = type_1.validate(ak, appendContext(c, k, type_1, ak));
            if (isLeft(result)) {
                pushAll(errors, result.left);
            }
            else {
                var vak = result.right;
                if (vak !== ak || (vak === undefined && !hasOwnProperty.call(a, k))) {
                    /* istanbul ignore next */
                    if (a === o) {
                        a = __assign({}, o);
                    }
                    a[k] = vak;
                }
            }
        }
        return errors.length > 0 ? failures(errors) : success(a);
    }, useIdentity(types)
        ? identity
        : function (a) {
            var s = __assign({}, a);
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var encode = types[i].encode;
                if (encode !== identity) {
                    s[k] = encode(a[k]);
                }
            }
            return s;
        }, props);
}
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(PartialType, _super);
    function PartialType(name, is, validate, encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'PartialType';
        return _this;
    }
    return PartialType;
})(Type));
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(DictionaryType, _super);
    function DictionaryType(name, is, validate, encode, domain, codomain) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.domain = domain;
        _this.codomain = codomain;
        /**
         * @since 1.0.0
         */
        _this._tag = 'DictionaryType';
        return _this;
    }
    return DictionaryType;
})(Type));
/**
 * @since 1.0.0
 */
var UnionType = /** @class */ (function (_super) {
    __extends(UnionType, _super);
    function UnionType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UnionType';
        return _this;
    }
    return UnionType;
}(Type));
/**
 * @category combinators
 * @since 1.0.0
 */
function union(codecs, name) {
    if (name === void 0) { name = getUnionName(codecs); }
    var index = getIndex(codecs);
    if (index !== undefined && codecs.length > 0) {
        var tag_1 = index[0], groups_1 = index[1];
        var len_1 = groups_1.length;
        var find_1 = function (value) {
            for (var i = 0; i < len_1; i++) {
                if (groups_1[i].indexOf(value) !== -1) {
                    return i;
                }
            }
            return undefined;
        };
        // tslint:disable-next-line: deprecation
        return new TaggedUnionType(name, function (u) {
            if (UnknownRecord.is(u)) {
                var i = find_1(u[tag_1]);
                return i !== undefined ? codecs[i].is(u) : false;
            }
            return false;
        }, function (u, c) {
            var e = UnknownRecord.validate(u, c);
            if (isLeft(e)) {
                return e;
            }
            var r = e.right;
            var i = find_1(r[tag_1]);
            if (i === undefined) {
                return failure(u, c);
            }
            var codec = codecs[i];
            return codec.validate(r, appendContext(c, String(i), codec, r));
        }, useIdentity(codecs)
            ? identity
            : function (a) {
                var i = find_1(a[tag_1]);
                if (i === undefined) {
                    // https://github.com/gcanti/io-ts/pull/305
                    throw new Error("no codec found to encode value in union codec ".concat(name));
                }
                else {
                    return codecs[i].encode(a);
                }
            }, codecs, tag_1);
    }
    else {
        return new UnionType(name, function (u) { return codecs.some(function (type) { return type.is(u); }); }, function (u, c) {
            var errors = [];
            for (var i = 0; i < codecs.length; i++) {
                var codec = codecs[i];
                var result = codec.validate(u, appendContext(c, String(i), codec, u));
                if (isLeft(result)) {
                    pushAll(errors, result.left);
                }
                else {
                    return success(result.right);
                }
            }
            return failures(errors);
        }, useIdentity(codecs)
            ? identity
            : function (a) {
                for (var _i = 0, codecs_1 = codecs; _i < codecs_1.length; _i++) {
                    var codec = codecs_1[_i];
                    if (codec.is(a)) {
                        return codec.encode(a);
                    }
                }
                // https://github.com/gcanti/io-ts/pull/305
                throw new Error("no codec found to encode value in union type ".concat(name));
            }, codecs);
    }
}
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'IntersectionType';
        return _this;
    }
    return IntersectionType;
})(Type));
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(TupleType, _super);
    function TupleType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'TupleType';
        return _this;
    }
    return TupleType;
})(Type));
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(ReadonlyType, _super);
    function ReadonlyType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ReadonlyType';
        return _this;
    }
    return ReadonlyType;
})(Type));
/**
 * @since 1.0.0
 */
/** @class */ ((function (_super) {
    __extends(ReadonlyArrayType, _super);
    function ReadonlyArrayType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ReadonlyArrayType';
        return _this;
    }
    return ReadonlyArrayType;
})(Type));
/**
 * Strips additional properties, equivalent to `exact(type(props))`.
 *
 * @category combinators
 * @since 1.0.0
 */
var strict = function (props, name) { return exact(type(props), name); };
/**
 * @since 1.1.0
 */
var ExactType = /** @class */ (function (_super) {
    __extends(ExactType, _super);
    function ExactType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ExactType';
        return _this;
    }
    return ExactType;
}(Type));
/**
 * Strips additional properties.
 *
 * @category combinators
 * @since 1.1.0
 */
function exact(codec, name) {
    if (name === void 0) { name = getExactTypeName(codec); }
    var props = getProps(codec);
    return new ExactType(name, codec.is, function (u, c) {
        var e = UnknownRecord.validate(u, c);
        if (isLeft(e)) {
            return e;
        }
        var ce = codec.validate(u, c);
        if (isLeft(ce)) {
            return ce;
        }
        return right$1(stripKeys(ce.right, props));
    }, function (a) { return codec.encode(stripKeys(a, props)); }, codec);
}
/**
 * @since 1.0.0
 */
var FunctionType = /** @class */ (function (_super) {
    __extends(FunctionType, _super);
    function FunctionType() {
        var _this = _super.call(this, 'Function', 
        // tslint:disable-next-line:strict-type-predicates
        function (u) { return typeof u === 'function'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'FunctionType';
        return _this;
    }
    return FunctionType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
new FunctionType();
/**
 * @since 1.0.0
 */
var NeverType = /** @class */ (function (_super) {
    __extends(NeverType, _super);
    function NeverType() {
        var _this = _super.call(this, 'never', function (_) { return false; }, function (u, c) { return failure(u, c); }, 
        /* istanbul ignore next */
        function () {
            throw new Error('cannot encode never');
        }) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NeverType';
        return _this;
    }
    return NeverType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
new NeverType();
/**
 * @since 1.0.0
 */
var AnyType = /** @class */ (function (_super) {
    __extends(AnyType, _super);
    function AnyType() {
        var _this = _super.call(this, 'any', function (_) { return true; }, success, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyType';
        return _this;
    }
    return AnyType;
}(Type));
/**
 * @category primitives
 * @since 1.0.0
 */
new AnyType();
function refinement(codec, predicate, name) {
    if (name === void 0) { name = "(".concat(codec.name, " | ").concat(getFunctionName(predicate), ")"); }
    return new RefinementType(name, function (u) { return codec.is(u) && predicate(u); }, function (i, c) {
        var e = codec.validate(i, c);
        if (isLeft(e)) {
            return e;
        }
        var a = e.right;
        return predicate(a) ? success(a) : failure(a, c);
    }, codec.encode, codec, predicate);
}
/**
 * @category primitives
 * @since 1.0.0
 */
refinement(number$1, Number.isInteger, 'Integer');
// -------------------------------------------------------------------------------------
// deprecated
// -------------------------------------------------------------------------------------
/**
 * @since 1.3.0
 * @deprecated
 */
var TaggedUnionType = /** @class */ (function (_super) {
    __extends(TaggedUnionType, _super);
    function TaggedUnionType(name, 
    // tslint:disable-next-line: deprecation
    is, 
    // tslint:disable-next-line: deprecation
    validate, 
    // tslint:disable-next-line: deprecation
    encode, codecs, tag) {
        var _this = _super.call(this, name, is, validate, encode, codecs) /* istanbul ignore next */ // <= workaround for https://github.com/Microsoft/TypeScript/issues/13455
         || this;
        _this.tag = tag;
        return _this;
    }
    return TaggedUnionType;
}(UnionType));
/**
 * @since 1.0.0
 * @deprecated
 */
var ObjectType = /** @class */ (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType() {
        var _this = _super.call(this, 'object', function (u) { return u !== null && typeof u === 'object'; }, function (u, c) { return (_this.is(u) ? success(u) : failure(u, c)); }, identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ObjectType';
        return _this;
    }
    return ObjectType;
}(Type));
/**
 * Use `UnknownRecord` instead.
 *
 * @category primitives
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
new ObjectType();
/**
 * @since 1.0.0
 * @deprecated
 */
/** @class */ ((function (_super) {
    __extends(StrictType, _super);
    function StrictType(name, 
    // tslint:disable-next-line: deprecation
    is, 
    // tslint:disable-next-line: deprecation
    validate, 
    // tslint:disable-next-line: deprecation
    encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'StrictType';
        return _this;
    }
    return StrictType;
})(Type));

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * @since 2.11.0
 */
var not = function (predicate) {
    return function (a) {
        return !predicate(a);
    };
};

/**
 * If a type `A` can form a `Semigroup` it has an **associative** binary operation.
 *
 * ```ts
 * interface Semigroup<A> {
 *   readonly concat: (x: A, y: A) => A
 * }
 * ```
 *
 * Associativity means the following equality must hold for any choice of `x`, `y`, and `z`.
 *
 * ```ts
 * concat(x, concat(y, z)) = concat(concat(x, y), z)
 * ```
 *
 * A common example of a semigroup is the type `string` with the operation `+`.
 *
 * ```ts
 * import { Semigroup } from 'fp-ts/Semigroup'
 *
 * const semigroupString: Semigroup<string> = {
 *   concat: (x, y) => x + y
 * }
 *
 * const x = 'x'
 * const y = 'y'
 * const z = 'z'
 *
 * semigroupString.concat(x, y) // 'xy'
 *
 * semigroupString.concat(x, semigroupString.concat(y, z)) // 'xyz'
 *
 * semigroupString.concat(semigroupString.concat(x, y), z) // 'xyz'
 * ```
 *
 * *Adapted from https://typelevel.org/cats*
 *
 * @since 2.0.0
 */
/**
 * @category constructors
 * @since 2.10.0
 */
var constant = function (a) { return ({
    concat: function () { return a; }
}); };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * Always return the first argument.
 *
 * @example
 * import * as S from 'fp-ts/Semigroup'
 *
 * assert.deepStrictEqual(S.first<number>().concat(1, 2), 1)
 *
 * @category instances
 * @since 2.10.0
 */
var first = function () { return ({ concat: identity$1 }); };
// -------------------------------------------------------------------------------------
// deprecated
// -------------------------------------------------------------------------------------
/**
 * Use `void` module instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var semigroupVoid = constant(undefined);
/**
 * Use [`SemigroupAll`](./boolean.ts.html#SemigroupAll) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var semigroupAll = {
    concat: function (x, y) { return x && y; }
};
/**
 * Use [`SemigroupAny`](./boolean.ts.html#SemigroupAny) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var semigroupAny = {
    concat: function (x, y) { return x || y; }
};

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * `None` doesn't have a constructor, instead you can use it directly as a value. Represents a missing value.
 *
 * @category constructors
 * @since 2.0.0
 */
var none = none$1;
/**
 * Constructs a `Some`. Represents an optional value that exists.
 *
 * @category constructors
 * @since 2.0.0
 */
var some$1 = some$2;
function fromPredicate$1(predicate) {
    return function (a) { return (predicate(a) ? some$1(a) : none); };
}
/**
 * Returns the `Left` value of an `Either` if possible.
 *
 * @example
 * import { getLeft, none, some } from 'fp-ts/Option'
 * import { right, left } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(getLeft(right(1)), none)
 * assert.deepStrictEqual(getLeft(left('a')), some('a'))
 *
 * @category constructors
 * @since 2.0.0
 */
var getLeft = function (ma) { return (ma._tag === 'Right' ? none : some$1(ma.left)); };
/**
 * Returns the `Right` value of an `Either` if possible.
 *
 * @example
 * import { getRight, none, some } from 'fp-ts/Option'
 * import { right, left } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(getRight(right(1)), some(1))
 * assert.deepStrictEqual(getRight(left('a')), none)
 *
 * @category constructors
 * @since 2.0.0
 */
var getRight = function (ma) { return (ma._tag === 'Left' ? none : some$1(ma.right)); };
var _map$1 = function (fa, f) { return pipe$1(fa, map$1(f)); };
var _ap = function (fab, fa) { return pipe$1(fab, ap(fa)); };
var _reduce = function (fa, b, f) { return pipe$1(fa, reduce(b, f)); };
var _foldMap = function (M) {
    var foldMapM = foldMap(M);
    return function (fa, f) { return pipe$1(fa, foldMapM(f)); };
};
var _reduceRight = function (fa, b, f) { return pipe$1(fa, reduceRight(b, f)); };
var _traverse = function (F) {
    var traverseF = traverse$1(F);
    return function (ta, f) { return pipe$1(ta, traverseF(f)); };
};
/* istanbul ignore next */
var _alt = function (fa, that) { return pipe$1(fa, alt(that)); };
var _filter = function (fa, predicate) { return pipe$1(fa, filter$2(predicate)); };
/* istanbul ignore next */
var _filterMap = function (fa, f) { return pipe$1(fa, filterMap(f)); };
/* istanbul ignore next */
var _extend = function (wa, f) { return pipe$1(wa, extend(f)); };
/* istanbul ignore next */
var _partition = function (fa, predicate) {
    return pipe$1(fa, partition(predicate));
};
/* istanbul ignore next */
var _partitionMap = function (fa, f) { return pipe$1(fa, partitionMap(f)); };
/**
 * @category type lambdas
 * @since 2.0.0
 */
var URI$2 = 'Option';
/**
 * Monoid returning the left-most non-`None` value. If both operands are `Some`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * | x       | y       | concat(x, y)       |
 * | ------- | ------- | ------------------ |
 * | none    | none    | none               |
 * | some(a) | none    | some(a)            |
 * | none    | some(b) | some(b)            |
 * | some(a) | some(b) | some(concat(a, b)) |
 *
 * @example
 * import { getMonoid, some, none } from 'fp-ts/Option'
 * import { SemigroupSum } from 'fp-ts/number'
 *
 * const M = getMonoid(SemigroupSum)
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(3))
 *
 * @category instances
 * @since 2.0.0
 */
var getMonoid$1 = function (S) { return ({
    concat: function (x, y) { return (isNone(x) ? y : isNone(y) ? x : some$1(S.concat(x.value, y.value))); },
    empty: none
}); };
/**
 * @category mapping
 * @since 2.0.0
 */
var map$1 = function (f) { return function (fa) {
    return isNone(fa) ? none : some$1(f(fa.value));
}; };
/**
 * @category constructors
 * @since 2.7.0
 */
var of$2 = some$1;
/**
 * @since 2.0.0
 */
var ap = function (fa) { return function (fab) {
    return isNone(fab) ? none : isNone(fa) ? none : some$1(fab.value(fa.value));
}; };
/**
 * @category sequencing
 * @since 2.14.0
 */
var flatMap = /*#__PURE__*/ dual(2, function (ma, f) { return (isNone(ma) ? none : f(ma.value)); });
/**
 * @category folding
 * @since 2.0.0
 */
var reduce = function (b, f) { return function (fa) {
    return isNone(fa) ? b : f(b, fa.value);
}; };
/**
 * @category folding
 * @since 2.0.0
 */
var foldMap = function (M) { return function (f) { return function (fa) {
    return isNone(fa) ? M.empty : f(fa.value);
}; }; };
/**
 * @category folding
 * @since 2.0.0
 */
var reduceRight = function (b, f) { return function (fa) {
    return isNone(fa) ? b : f(fa.value, b);
}; };
/**
 * Returns the provided `Option` `that` if `self` is `None`, otherwise returns `self`.
 *
 * @param self - The first `Option` to be checked.
 * @param that - The `Option` to return if `self` is `None`.
 *
 * @example
 * import * as O from "fp-ts/Option"
 *
 * assert.deepStrictEqual(O.orElse(O.none, () => O.none), O.none)
 * assert.deepStrictEqual(O.orElse(O.some(1), () => O.none), O.some(1))
 * assert.deepStrictEqual(O.orElse(O.none, () => O.some('b')), O.some('b'))
 * assert.deepStrictEqual(O.orElse(O.some(1), () => O.some('b')), O.some(1))
 *
 * @category error handling
 * @since 2.16.0
 */
var orElse = dual(2, function (self, that) { return (isNone(self) ? that() : self); });
/**
 * Alias of `orElse`.
 *
 * @category legacy
 * @since 2.0.0
 */
var alt = orElse;
/**
 * @since 2.7.0
 */
var zero = function () { return none; };
/**
 * @since 2.0.0
 */
var extend = function (f) { return function (wa) {
    return isNone(wa) ? none : some$1(f(wa));
}; };
/**
 * @category filtering
 * @since 2.0.0
 */
var compact = /*#__PURE__*/ flatMap(identity$1);
var defaultSeparated = /*#__PURE__*/ separated(none, none);
/**
 * @category filtering
 * @since 2.0.0
 */
var separate = function (ma) {
    return isNone(ma) ? defaultSeparated : separated(getLeft(ma.value), getRight(ma.value));
};
/**
 * @category instances
 * @since 2.7.0
 */
var Compactable = {
    URI: URI$2,
    compact: compact,
    separate: separate
};
/**
 * @category filtering
 * @since 2.0.0
 */
var filter$2 = function (predicate) {
    return function (fa) {
        return isNone(fa) ? none : predicate(fa.value) ? fa : none;
    };
};
/**
 * @category filtering
 * @since 2.0.0
 */
var filterMap = function (f) { return function (fa) {
    return isNone(fa) ? none : f(fa.value);
}; };
/**
 * @category filtering
 * @since 2.0.0
 */
var partition = function (predicate) {
    return function (fa) {
        return separated(_filter(fa, not(predicate)), _filter(fa, predicate));
    };
};
/**
 * @category filtering
 * @since 2.0.0
 */
var partitionMap = function (f) { return flow(map$1(f), separate); };
/**
 * @category traversing
 * @since 2.6.3
 */
var traverse$1 = function (F) {
    return function (f) {
        return function (ta) {
            return isNone(ta) ? F.of(none) : F.map(f(ta.value), some$1);
        };
    };
};
/**
 * @category traversing
 * @since 2.6.3
 */
var sequence = function (F) {
    return function (ta) {
        return isNone(ta) ? F.of(none) : F.map(ta.value, some$1);
    };
};
/**
 * @category instances
 * @since 2.7.0
 */
var Traversable = {
    URI: URI$2,
    map: _map$1,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: sequence
};
var _wither = /*#__PURE__*/ witherDefault(Traversable, Compactable);
var _wilt = /*#__PURE__*/ wiltDefault(Traversable, Compactable);
/**
 * @since 2.7.0
 */
var throwError = function () { return none; };
/**
 * Transforms an `Either` to an `Option` discarding the error.
 *
 * Alias of [getRight](#getright)
 *
 * @category conversions
 * @since 2.0.0
 */
var fromEither = getRight;
/**
 * Returns `true` if the option is `None`, `false` otherwise.
 *
 * @example
 * import { some, none, isNone } from 'fp-ts/Option'
 *
 * assert.strictEqual(isNone(some(1)), false)
 * assert.strictEqual(isNone(none), true)
 *
 * @category refinements
 * @since 2.0.0
 */
var isNone = function (fa) { return fa._tag === 'None'; };
/**
 * Less strict version of [`match`](#match).
 *
 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
 *
 * @category pattern matching
 * @since 2.10.0
 */
var matchW = function (onNone, onSome) {
    return function (ma) {
        return isNone(ma) ? onNone() : onSome(ma.value);
    };
};
/**
 * Takes a (lazy) default value, a function, and an `Option` value, if the `Option` value is `None` the default value is
 * returned, otherwise the function is applied to the value inside the `Some` and the result is returned.
 *
 * @example
 * import { some, none, match } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     match(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a some containing 1'
 * )
 *
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     match(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a none'
 * )
 *
 * @category pattern matching
 * @since 2.10.0
 */
var match$2 = matchW;
/**
 * Alias of [`match`](#match).
 *
 * @category pattern matching
 * @since 2.0.0
 */
var fold = match$2;
/**
 * Less strict version of [`getOrElse`](#getorelse).
 *
 * The `W` suffix (short for **W**idening) means that the handler return type will be merged.
 *
 * @category error handling
 * @since 2.6.0
 */
var getOrElseW = function (onNone) {
    return function (ma) {
        return isNone(ma) ? onNone() : ma.value;
    };
};
/**
 * Extracts the value out of the structure, if it exists. Otherwise returns the given default value
 *
 * @example
 * import { some, none, getOrElse } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     getOrElse(() => 0)
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     getOrElse(() => 0)
 *   ),
 *   0
 * )
 *
 * @category error handling
 * @since 2.0.0
 */
var getOrElse = getOrElseW;
/**
 * Constructs a new `Option` from a nullable type. If the value is `null` or `undefined`, returns `None`, otherwise
 * returns the value wrapped in a `Some`.
 *
 * @example
 * import { none, some, fromNullable } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(fromNullable(undefined), none)
 * assert.deepStrictEqual(fromNullable(null), none)
 * assert.deepStrictEqual(fromNullable(1), some(1))
 *
 * @category conversions
 * @since 2.0.0
 */
var fromNullable$1 = function (a) { return (a == null ? none : some$1(a)); };
/**
 * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
 *
 * @example
 * import { some, none, toNullable } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     toNullable
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     toNullable
 *   ),
 *   null
 * )
 *
 * @category conversions
 * @since 2.0.0
 */
var toNullable = /*#__PURE__*/ match$2(constNull, identity$1);
// -------------------------------------------------------------------------------------
// legacy
// -------------------------------------------------------------------------------------
/**
 * Alias of `flatMap`.
 *
 * @category legacy
 * @since 2.0.0
 */
var chain = flatMap;
/**
 * This instance is deprecated, use small, specific instances instead.
 * For example if a function needs a `Functor` instance, pass `O.Functor` instead of `O.option`
 * (where `O` is from `import O from 'fp-ts/Option'`)
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var option$1 = {
    URI: URI$2,
    map: _map$1,
    of: of$2,
    ap: _ap,
    chain: flatMap,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: sequence,
    zero: zero,
    alt: _alt,
    extend: _extend,
    compact: compact,
    separate: separate,
    filter: _filter,
    filterMap: _filterMap,
    partition: _partition,
    partitionMap: _partitionMap,
    wither: _wither,
    wilt: _wilt,
    throwError: throwError
};
/**
 * Use
 *
 * ```ts
 * import { first } from 'fp-ts/Semigroup'
 * import { getMonoid } from 'fp-ts/Option'
 *
 * getMonoid(first())
 * ```
 *
 * instead.
 *
 * Monoid returning the left-most non-`None` value
 *
 * | x       | y       | concat(x, y) |
 * | ------- | ------- | ------------ |
 * | none    | none    | none         |
 * | some(a) | none    | some(a)      |
 * | none    | some(b) | some(b)      |
 * | some(a) | some(b) | some(a)      |
 *
 * @example
 * import { getFirstMonoid, some, none } from 'fp-ts/Option'
 *
 * const M = getFirstMonoid<number>()
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(2)), some(2))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(1))
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var getFirstMonoid = function () { return getMonoid$1(first()); };

(undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * @internal
 */
var isNonEmpty$1 = isNonEmpty$3;
/**
 * @internal
 */
var isOutOfBound$1 = function (i, as) { return i < 0 || i >= as.length; };
/**
 * @internal
 */
var unsafeUpdateAt$2 = function (i, a, as) {
    if (as[i] === a) {
        return as;
    }
    else {
        var xs = fromReadonlyNonEmptyArray(as);
        xs[i] = a;
        return xs;
    }
};

(undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * @category constructors
 * @since 2.0.0
 */
var of$1 = function (a) { return [a]; };

(undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Test whether a `ReadonlyArray` is non empty.
 *
 * @category refinements
 * @since 2.5.0
 */
var isNonEmpty = isNonEmpty$1;
/**
 * Test whether an array contains a particular index
 *
 * @since 2.5.0
 */
var isOutOfBound = isOutOfBound$1;
function lookup$1(i, as) {
    return as === undefined ? function (as) { return lookup$1(i, as); } : isOutOfBound(i, as) ? none$1 : some$2(as[i]);
}
/**
 * Find the first index for which a predicate holds
 *
 * @example
 * import { findIndex } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
 *
 * @since 2.5.0
 */
var findIndex$1 = function (predicate) {
    return function (as) {
        for (var i = 0; i < as.length; i++) {
            if (predicate(as[i])) {
                return some$2(i);
            }
        }
        return none$1;
    };
};
function findFirst$1(predicate) {
    return function (as) {
        for (var i = 0; i < as.length; i++) {
            if (predicate(as[i])) {
                return some$2(as[i]);
            }
        }
        return none$1;
    };
}
/**
 * @category unsafe
 * @since 2.5.0
 */
var unsafeUpdateAt$1 = function (i, a, as) {
    return isNonEmpty(as) ? unsafeUpdateAt$2(i, a, as) : as;
};

/**
 * Given an element of the base type, `of` builds an `Array` containing just that
 * element of the base type (this is useful for building a `Monad`).
 *
 * @example
 * import { of } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(of("a"), ["a"]);
 *
 * @category constructors
 * @since 2.0.0
 */
var of = of$1;
/**
 * Get a `Semigroup` based on the concatenation of `Array`s.
 * See also [`getMonoid`](#getMonoid).
 *
 * @example
 * import { getSemigroup } from 'fp-ts/Array'
 *
 * const S = getSemigroup<number>();
 * assert.deepStrictEqual(S.concat([1, 2], [2, 3]), [1, 2, 2, 3]);
 *
 * @category instances
 * @since 2.10.0
 */
var getSemigroup = function () { return ({
    concat: function (first, second) { return first.concat(second); }
}); };
/**
 * Returns a `Monoid` for `Array<A>` based on the concatenation of `Array`s.
 *
 * @example
 * import { getMonoid } from 'fp-ts/Array'
 *
 * const M = getMonoid<number>()
 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
 *
 * @category instances
 * @since 2.0.0
 */
var getMonoid = function () { return ({
    concat: getSemigroup().concat,
    empty: []
}); };

/**
 * @category constructors
 * @since 2.0.0
 */
var make = unsafeCoerce;
/**
 * @category instances
 * @since 2.0.0
 */
function getApply(S) {
    return {
        URI: URI$1,
        _E: undefined,
        map: _map,
        ap: function (fab, fa) { return make(S.concat(fab, fa)); }
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: URI$1,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: function () { return make(M.empty); }
    };
}
/* istanbul ignore next */
var _map = function (fa, f) { return pipe$1(fa, map()); };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category mapping
 * @since 2.0.0
 */
var map = function () { return unsafeCoerce; };
/**
 * @category type lambdas
 * @since 2.0.0
 */
var URI$1 = 'Const';

// -------------------------------------------------------------------------------------
// deprecated
// -------------------------------------------------------------------------------------
/**
 * Use [`Monoid`](./void.ts.html#monoid) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
({
    concat: semigroupVoid.concat,
    empty: undefined
});
/**
 * Use [`MonoidAll`](./boolean.ts.html#monoidall) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var monoidAll = {
    concat: semigroupAll.concat,
    empty: true
};
/**
 * Use [`MonoidAny`](./boolean.ts.html#monoidany) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
var monoidAny = {
    concat: semigroupAny.concat,
    empty: false
};

/**
 * Use [`pipe`](https://gcanti.github.io/fp-ts/modules/function.ts.html#pipe) from `function` module instead.
 *
 * @since 2.0.0
 * @deprecated
 */
var pipe = pipe$1;

/**
 * Insert or replace a key/value pair in a `ReadonlyRecord`.
 *
 * @example
 * import { upsertAt } from 'fp-ts/ReadonlyRecord'
 *
 * assert.deepStrictEqual(upsertAt("a", 5)({ a: 1, b: 2 }), { a: 5, b: 2 });
 * assert.deepStrictEqual(upsertAt("c", 5)({ a: 1, b: 2 }), { a: 1, b: 2, c: 5 });
 *
 * @since 2.10.0
 */
var upsertAt = function (k, a) {
    return function (r) {
        if (has.call(r, k) && r[k] === a) {
            return r;
        }
        var out = Object.assign({}, r);
        out[k] = a;
        return out;
    };
};
function deleteAt(k) {
    return function (r) {
        if (!has.call(r, k)) {
            return r;
        }
        var out = Object.assign({}, r);
        delete out[k];
        return out;
    };
}
function lookup(k, r) {
    if (r === undefined) {
        return function (r) { return lookup(k, r); };
    }
    return has.call(r, k) ? some$2(r[k]) : none$1;
}
/**
 * Use [`upsertAt`](#upsertat) instead.
 *
 * @category zone of death
 * @since 2.5.0
 * @deprecated
 */
var insertAt = upsertAt;

var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// -------------------------------------------------------------------------------------
// Iso
// -------------------------------------------------------------------------------------
/** @internal */
var iso$2 = function (get, reverseGet) { return ({
    get: get,
    reverseGet: reverseGet
}); };
/** @internal */
var isoAsLens = function (sa) { return lens$2(sa.get, flow(sa.reverseGet, constant$1)); };
/** @internal */
var isoAsPrism = function (sa) { return prism(flow(sa.get, some$1), sa.reverseGet); };
/** @internal */
var isoAsOptional = function (sa) {
    return optional(flow(sa.get, some$1), flow(sa.reverseGet, constant$1));
};
/** @internal */
var isoAsTraversal = function (sa) {
    return traversal(function (F) { return function (f) { return function (s) {
        return F.map(f(sa.get(s)), function (a) { return sa.reverseGet(a); });
    }; }; });
};
// -------------------------------------------------------------------------------------
// Lens
// -------------------------------------------------------------------------------------
/** @internal */
var lens$2 = function (get, set) { return ({ get: get, set: set }); };
/** @internal */
var lensAsOptional = function (sa) { return optional(flow(sa.get, some$1), sa.set); };
/** @internal */
var lensAsTraversal = function (sa) {
    return traversal(function (F) { return function (f) { return function (s) { return F.map(f(sa.get(s)), function (a) { return sa.set(a)(s); }); }; }; });
};
/** @internal */
var lensComposeLens = function (ab) { return function (sa) {
    return lens$2(function (s) { return ab.get(sa.get(s)); }, function (b) { return function (s) { return sa.set(ab.set(b)(sa.get(s)))(s); }; });
}; };
/** @internal */
var prismComposePrism = function (ab) { return function (sa) {
    return prism(flow(sa.getOption, chain(ab.getOption)), flow(ab.reverseGet, sa.reverseGet));
}; };
/** @internal */
var lensComposePrism = function (ab) { return function (sa) {
    return optionalComposeOptional(prismAsOptional(ab))(lensAsOptional(sa));
}; };
/** @internal */
var lensId = function () { return lens$2(identity$1, constant$1); };
/** @internal */
var lensProp = function (prop) { return function (sa) {
    return lens$2(function (s) { return sa.get(s)[prop]; }, function (ap) { return function (s) {
        var _a;
        var oa = sa.get(s);
        if (ap === oa[prop]) {
            return s;
        }
        return sa.set(Object.assign({}, oa, (_a = {}, _a[prop] = ap, _a)))(s);
    }; });
}; };
/** @internal */
var lensProps = function () {
    var props = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        props[_i] = arguments[_i];
    }
    return function (sa) {
        return lens$2(function (s) {
            var a = sa.get(s);
            var r = {};
            for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
                var k = props_1[_i];
                r[k] = a[k];
            }
            return r;
        }, function (a) { return function (s) {
            var oa = sa.get(s);
            for (var _i = 0, props_2 = props; _i < props_2.length; _i++) {
                var k = props_2[_i];
                if (a[k] !== oa[k]) {
                    return sa.set(Object.assign({}, oa, a))(s);
                }
            }
            return s;
        }; });
    };
};
/** @internal */
var lensComponent = function (prop) { return function (sa) {
    return lens$2(function (s) { return sa.get(s)[prop]; }, function (ap) { return function (s) {
        var oa = sa.get(s);
        if (ap === oa[prop]) {
            return s;
        }
        var copy = oa.slice();
        copy[prop] = ap;
        return sa.set(copy)(s);
    }; });
}; };
/** @internal */
var lensAtKey = function (key) { return function (sa) {
    return pipe(sa, lensComposeLens(atReadonlyRecord().at(key)));
}; };
// -------------------------------------------------------------------------------------
// Prism
// -------------------------------------------------------------------------------------
/** @internal */
var prism = function (getOption, reverseGet) { return ({ getOption: getOption, reverseGet: reverseGet }); };
/** @internal */
var prismAsOptional = function (sa) { return optional(sa.getOption, function (a) { return prismSet(a)(sa); }); };
/** @internal */
var prismAsTraversal = function (sa) {
    return traversal(function (F) { return function (f) { return function (s) {
        return pipe(sa.getOption(s), fold(function () { return F.of(s); }, function (a) { return F.map(f(a), function (a) { return prismSet(a)(sa)(s); }); }));
    }; }; });
};
/** @internal */
var prismModifyOption = function (f) { return function (sa) { return function (s) {
    return pipe(sa.getOption(s), map$1(function (o) {
        var n = f(o);
        return n === o ? s : sa.reverseGet(n);
    }));
}; }; };
/** @internal */
var prismModify = function (f) { return function (sa) {
    var g = prismModifyOption(f)(sa);
    return function (s) {
        return pipe(g(s), getOrElse(function () { return s; }));
    };
}; };
/** @internal */
var prismSet = function (a) { return prismModify(function () { return a; }); };
/** @internal */
var prismComposeLens = function (ab) { return function (sa) {
    return optionalComposeOptional(lensAsOptional(ab))(prismAsOptional(sa));
}; };
/** @internal */
var prismFromNullable = function () { return prism(fromNullable$1, identity$1); };
/** @internal */
var prismFromPredicate = function (predicate) {
    return prism(fromPredicate$1(predicate), identity$1);
};
/** @internal */
var prismSome = function () { return prism(identity$1, some$1); };
/** @internal */
var prismRight = function () { return prism(fromEither, right$1); };
/** @internal */
var prismLeft = function () {
    return prism(function (s) { return (isLeft(s) ? some$1(s.left) : none); }, // TODO: replace with E.getLeft in v3
    left$1);
};
// -------------------------------------------------------------------------------------
// Optional
// -------------------------------------------------------------------------------------
/** @internal */
var optional = function (getOption, set) { return ({
    getOption: getOption,
    set: set
}); };
/** @internal */
var optionalAsTraversal = function (sa) {
    return traversal(function (F) { return function (f) { return function (s) {
        return pipe(sa.getOption(s), fold(function () { return F.of(s); }, function (a) { return F.map(f(a), function (a) { return sa.set(a)(s); }); }));
    }; }; });
};
/** @internal */
var optionalModifyOption = function (f) { return function (optional) { return function (s) {
    return pipe(optional.getOption(s), map$1(function (a) {
        var n = f(a);
        return n === a ? s : optional.set(n)(s);
    }));
}; }; };
/** @internal */
var optionalModify = function (f) { return function (optional) {
    var g = optionalModifyOption(f)(optional);
    return function (s) {
        return pipe(g(s), getOrElse(function () { return s; }));
    };
}; };
/** @internal */
var optionalComposeOptional = function (ab) { return function (sa) {
    return optional(flow(sa.getOption, chain(ab.getOption)), function (b) { return optionalModify(ab.set(b))(sa); });
}; };
/** @internal */
var optionalIndex = function (i) { return function (sa) {
    return pipe(sa, optionalComposeOptional(indexReadonlyArray().index(i)));
}; };
/** @internal */
var optionalIndexNonEmpty = function (i) { return function (sa) { return pipe(sa, optionalComposeOptional(indexReadonlyNonEmptyArray().index(i))); }; };
/** @internal */
var optionalKey = function (key) { return function (sa) {
    return pipe(sa, optionalComposeOptional(indexReadonlyRecord().index(key)));
}; };
/** @internal */
var optionalFindFirst = function (predicate) {
    return optional(findFirst$1(predicate), function (a) { return function (s) {
        return pipe(findIndex$1(predicate)(s), fold(function () { return s; }, function (i) { return unsafeUpdateAt$1(i, a, s); }));
    }; });
};
var unsafeUpdateAt = function (i, a, as) {
    if (as[i] === a) {
        return as;
    }
    else {
        var xs = __spreadArray([as[0]], as.slice(1), true);
        xs[i] = a;
        return xs;
    }
};
/** @internal */
var optionalFindFirstNonEmpty = function (predicate) {
    return optional(findFirst$1(predicate), function (a) { return function (as) {
        return pipe(findIndex$1(predicate)(as), fold(function () { return as; }, function (i) { return unsafeUpdateAt(i, a, as); }));
    }; });
};
// -------------------------------------------------------------------------------------
// Traversal
// -------------------------------------------------------------------------------------
/** @internal */
var traversal = function (modifyF) { return ({
    modifyF: modifyF
}); };
/** @internal */
function traversalComposeTraversal(ab) {
    return function (sa) { return traversal(function (F) { return function (f) { return sa.modifyF(F)(ab.modifyF(F)(f)); }; }); };
}
/** @internal */
var ApplicativeIdentity = {
    URI: 'Identity',
    map: function (fa, f) { return f(fa); },
    of: identity$1,
    ap: 
    /* istanbul ignore next */
    function (fab, fa) { return fab(fa); }
};
var isIdentity = function (F) { return F.URI === 'Identity'; };
function fromTraversable(T) {
    return function () {
        return traversal(function (F) {
            // if `F` is `Identity` then `traverseF = map`
            var traverseF = isIdentity(F)
                ? T.map
                : T.traverse(F);
            return function (f) { return function (s) { return traverseF(s, f); }; };
        });
    };
}
/** @internal */
function traversalTraverse(T) {
    return traversalComposeTraversal(fromTraversable(T)());
}
// -------------------------------------------------------------------------------------
// Ix
// -------------------------------------------------------------------------------------
/** @internal */
var index$1 = function (index) { return ({ index: index }); };
/** @internal */
var indexReadonlyArray = function () {
    return index$1(function (i) {
        return optional(function (as) { return lookup$1(i, as); }, function (a) { return function (as) {
            return pipe(lookup$1(i, as), fold(function () { return as; }, function () { return unsafeUpdateAt$1(i, a, as); }));
        }; });
    });
};
/** @internal */
var indexReadonlyNonEmptyArray = function () {
    return index$1(function (i) {
        return optional(function (as) { return lookup$1(i, as); }, function (a) { return function (as) {
            return pipe(lookup$1(i, as), fold(function () { return as; }, function () { return unsafeUpdateAt(i, a, as); }));
        }; });
    });
};
/** @internal */
var indexReadonlyRecord = function () {
    return index$1(function (k) {
        return optional(function (r) { return lookup(k, r); }, function (a) { return function (r) {
            if (r[k] === a || isNone(lookup(k, r))) {
                return r;
            }
            return insertAt(k, a)(r);
        }; });
    });
};
// -------------------------------------------------------------------------------------
// At
// -------------------------------------------------------------------------------------
/** @internal */
var at = function (at) { return ({ at: at }); };
/** @internal */
function atReadonlyRecord() {
    return at(function (key) {
        return lens$2(function (r) { return lookup(key, r); }, fold(function () { return deleteAt(key); }, function (a) { return insertAt(key, a); }));
    });
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.8
 */
var iso$1 = iso$2;
// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------
/**
 * View an `Iso` as a `Lens`.
 *
 * @category converters
 * @since 2.3.0
 */
var asLens = isoAsLens;
/**
 * View an `Iso` as a `Prism`.
 *
 * @category converters
 * @since 2.3.0
 */
var asPrism = isoAsPrism;
/**
 * View an `Iso` as a `Optional`.
 *
 * @category converters
 * @since 2.3.0
 */
var asOptional$2 = isoAsOptional;
/**
 * View an `Iso` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
var asTraversal$3 = isoAsTraversal;
// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
/**
 * Compose an `Iso` with an `Iso`.
 *
 * @category compositions
 * @since 2.3.0
 */
var compose$4 = function (ab) { return function (sa) {
    return iso$1(flow(sa.get, ab.get), flow(ab.reverseGet, sa.reverseGet));
}; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.0
 */
var reverse = function (sa) { return iso$1(sa.reverseGet, sa.get); };
/**
 * @category combinators
 * @since 2.3.0
 */
var modify$3 = function (f) { return function (sa) { return function (s) {
    return sa.reverseGet(f(sa.get(s)));
}; }; };

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.8
 */
var lens = lens$2;
/**
 * @category constructors
 * @since 2.3.0
 */
var id = lensId;
// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------
/**
 * View a `Lens` as a `Optional`.
 *
 * @category converters
 * @since 2.3.0
 */
var asOptional$1 = lensAsOptional;
/**
 * View a `Lens` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
var asTraversal$2 = lensAsTraversal;
// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
/**
 * Compose a `Lens` with a `Lens`.
 *
 * @category compositions
 * @since 2.3.0
 */
var compose$3 = lensComposeLens;
/**
 * Alias of `compose`.
 *
 * @category compositions
 * @since 2.3.8
 */
var composeLens$1 = compose$3;
/**
 * Compose a `Lens` with a `Iso`.
 *
 * @category compositions
 * @since 2.3.8
 */
var composeIso = 
/*#__PURE__*/
flow(isoAsLens, compose$3);
/**
 * Compose a `Lens` with a `Prism`.
 *
 * @category compositions
 * @since 2.3.0
 */
var composePrism = lensComposePrism;
/**
 * Compose a `Lens` with an `Optional`.
 *
 * @category compositions
 * @since 2.3.0
 */
var composeOptional = function (ab) {
    return flow(asOptional$1, optionalComposeOptional(ab));
};
/**
 * Compose a `Lens` with an `Traversal`.
 *
 * @category compositions
 * @since 2.3.8
 */
var composeTraversal = function (ab) {
    return flow(asTraversal$2, traversalComposeTraversal(ab));
};
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.3.0
 */
var modify$2 = function (f) { return function (sa) { return function (s) {
    var o = sa.get(s);
    var n = f(o);
    return o === n ? s : sa.set(n)(s);
}; }; };
function modifyF(F) {
    return function (f) { return function (sa) { return function (s) { return pipe(sa.get(s), f, function (fa) { return F.map(fa, function (a) { return sa.set(a)(s); }); }); }; }; };
}
/**
 * Return a `Optional` from a `Lens` focused on a nullable value.
 *
 * @category combinators
 * @since 2.3.0
 */
var fromNullable = function (sa) {
    return composePrism(prismFromNullable())(sa);
};
function filter$1(predicate) {
    return composePrism(prismFromPredicate(predicate));
}
/**
 * Return a `Lens` from a `Lens` and a prop.
 *
 * @category combinators
 * @since 2.3.0
 */
var prop = lensProp;
/**
 * Return a `Lens` from a `Lens` and a list of props.
 *
 * @category combinators
 * @since 2.3.0
 */
var props = lensProps;
/**
 * Return a `Lens` from a `Lens` focused on a component of a tuple.
 *
 * @category combinators
 * @since 2.3.0
 */
var component = lensComponent;
/**
 * Return a `Optional` from a `Lens` focused on an index of a `ReadonlyArray`.
 *
 * @category combinators
 * @since 2.3.0
 */
var index = function (i) {
    return flow(asOptional$1, optionalIndex(i));
};
/**
 * Return a `Optional` from a `Lens` focused on an index of a `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 2.3.8
 */
var indexNonEmpty = function (i) {
    return flow(asOptional$1, optionalIndexNonEmpty(i));
};
/**
 * Return a `Optional` from a `Lens` focused on a key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
var key = function (key) {
    return flow(asOptional$1, optionalKey(key));
};
/**
 * Return a `Lens` from a `Lens` focused on a required key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
var atKey = lensAtKey;
/**
 * Return a `Optional` from a `Lens` focused on the `Some` of a `Option` type.
 *
 * @category combinators
 * @since 2.3.0
 */
var some = 
/*#__PURE__*/
composePrism(/*#__PURE__*/ prismSome());
/**
 * Return a `Optional` from a `Lens` focused on the `Right` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
var right = 
/*#__PURE__*/
composePrism(/*#__PURE__*/ prismRight());
/**
 * Return a `Optional` from a `Lens` focused on the `Left` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
var left = 
/*#__PURE__*/
composePrism(/*#__PURE__*/ prismLeft());
/**
 * Return a `Traversal` from a `Lens` focused on a `Traversable`.
 *
 * @category combinators
 * @since 2.3.0
 */
function traverse(T) {
    return flow(asTraversal$2, traversalTraverse(T));
}
function findFirst(predicate) {
    return composeOptional(optionalFindFirst(predicate));
}
function findFirstNonEmpty(predicate) {
    return composeOptional(optionalFindFirstNonEmpty(predicate));
}
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Invariant
 * @since 2.3.0
 */
var imap = function (f, g) { return function (ea) {
    return imap_(ea, f, g);
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
var imap_ = function (ea, ab, ba) { return lens(flow(ea.get, ab), flow(ba, ea.set)); };
/**
 * @category instances
 * @since 2.3.0
 */
var URI = 'monocle-ts/Lens';
/**
 * @category instances
 * @since 2.3.0
 */
var Invariant = {
    URI: URI,
    imap: imap_
};
/**
 * @category instances
 * @since 2.3.8
 */
var Semigroupoid = {
    URI: URI,
    compose: function (ab, ea) { return compose$3(ab)(ea); }
};
/**
 * @category instances
 * @since 2.3.0
 */
var Category = {
    URI: URI,
    compose: Semigroupoid.compose,
    id: id
};

var lens$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Category: Category,
	Invariant: Invariant,
	Semigroupoid: Semigroupoid,
	URI: URI,
	asOptional: asOptional$1,
	asTraversal: asTraversal$2,
	atKey: atKey,
	component: component,
	compose: compose$3,
	composeIso: composeIso,
	composeLens: composeLens$1,
	composeOptional: composeOptional,
	composePrism: composePrism,
	composeTraversal: composeTraversal,
	filter: filter$1,
	findFirst: findFirst,
	findFirstNonEmpty: findFirstNonEmpty,
	fromNullable: fromNullable,
	id: id,
	imap: imap,
	index: index,
	indexNonEmpty: indexNonEmpty,
	key: key,
	left: left,
	lens: lens,
	modify: modify$2,
	modifyF: modifyF,
	prop: prop,
	props: props,
	right: right,
	some: some,
	traverse: traverse
});

// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------
/**
 * View a `Optional` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
var asTraversal$1 = optionalAsTraversal;
// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
/**
 * Compose a `Optional` with a `Optional`.
 *
 * @category compositions
 * @since 2.3.0
 */
var compose$2 = optionalComposeOptional;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.3.0
 */
var modifyOption = optionalModifyOption;
/**
 * @category combinators
 * @since 2.3.0
 */
var modify$1 = optionalModify;

/**
 * @category constructors
 * @since 2.3.0
 */
var fromPredicate = prismFromPredicate;
// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------
/**
 * View a `Prism` as a `Optional`.
 *
 * @category converters
 * @since 2.3.0
 */
var asOptional = prismAsOptional;
/**
 * View a `Prism` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
var asTraversal = prismAsTraversal;
// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
/**
 * Compose a `Prism` with a `Prism`.
 *
 * @category compositions
 * @since 2.3.0
 */
var compose$1 = prismComposePrism;
/**
 * Compose a `Prism` with a `Lens`.
 *
 * @category compositions
 * @since 2.3.0
 */
var composeLens = prismComposeLens;

// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
/**
 * Compose a `Traversal` with a `Traversal`.
 *
 * @category compositions
 * @since 2.3.0
 */
var compose = traversalComposeTraversal;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.3.0
 */
var modify = function (f) { return function (sa) {
    return sa.modifyF(ApplicativeIdentity)(f);
}; };
/**
 * @category combinators
 * @since 2.3.0
 */
var set = function (a) { return modify(function () { return a; }); };
function filter(predicate) {
    return compose(prismAsTraversal(prismFromPredicate(predicate)));
}

/**
 * @since 1.0.0
 */
//
// compat
//
var fromIso = function (iso) { return new Iso(iso.get, iso.reverseGet); };
var fromLens = function (lens) { return new Lens(lens.get, lens.set); };
var fromPrism = function (prism) { return new Prism(prism.getOption, prism.reverseGet); };
var fromOptional = function (optional) {
    return new Optional(optional.getOption, optional.set);
};
var fromTraversal = function (traversal) { return new Traversal(traversal.modifyF); };
//
// old APIs
//
var update = function (o, k, a) {
    var _a;
    return a === o[k] ? o : Object.assign({}, o, (_a = {}, _a[k] = a, _a));
};
/**
 * Laws:
 * 1. `reverseGet(get(s)) = s`
 * 2. `get(reversetGet(a)) = a`
 *
 * @category constructor
 * @since 1.0.0
 */
var Iso = /** @class */ (function () {
    function Iso(get, reverseGet) {
        this.get = get;
        this.reverseGet = reverseGet;
        /**
         * @since 1.0.0
         */
        this._tag = 'Iso';
        /**
         * @since 1.0.0
         */
        this.unwrap = this.get;
        /**
         * @since 1.0.0
         */
        this.to = this.get;
        /**
         * @since 1.0.0
         */
        this.wrap = this.reverseGet;
        /**
         * @since 1.0.0
         */
        this.from = this.reverseGet;
    }
    /**
     * reverse the `Iso`: the source becomes the target and the target becomes the source
     * @since 1.0.0
     */
    Iso.prototype.reverse = function () {
        return fromIso(reverse(this));
    };
    /**
     * @since 1.0.0
     */
    Iso.prototype.modify = function (f) {
        return modify$3(f)(this);
    };
    /**
     * view an `Iso` as a `Lens`
     *
     * @since 1.0.0
     */
    Iso.prototype.asLens = function () {
        return fromLens(asLens(this));
    };
    /**
     * view an `Iso` as a `Prism`
     *
     * @since 1.0.0
     */
    Iso.prototype.asPrism = function () {
        return fromPrism(asPrism(this));
    };
    /**
     * view an `Iso` as a `Optional`
     *
     * @since 1.0.0
     */
    Iso.prototype.asOptional = function () {
        return fromOptional(asOptional$2(this));
    };
    /**
     * view an `Iso` as a `Traversal`
     *
     * @since 1.0.0
     */
    Iso.prototype.asTraversal = function () {
        return fromTraversal(asTraversal$3(this));
    };
    /**
     * view an `Iso` as a `Fold`
     *
     * @since 1.0.0
     */
    Iso.prototype.asFold = function () {
        var _this = this;
        return new Fold(function () { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /**
     * view an `Iso` as a `Getter`
     *
     * @since 1.0.0
     */
    Iso.prototype.asGetter = function () {
        var _this = this;
        return new Getter(function (s) { return _this.get(s); });
    };
    /**
     * view an `Iso` as a `Setter`
     *
     * @since 1.0.0
     */
    Iso.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /**
     * compose an `Iso` with an `Iso`
     *
     * @since 1.0.0
     */
    Iso.prototype.compose = function (ab) {
        return fromIso(compose$4(ab)(this));
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeIso = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose an `Iso` with a `Lens `
     *
     * @since 1.0.0
     */
    Iso.prototype.composeLens = function (ab) {
        return fromLens(pipe(this, asLens, compose$3(ab)));
    };
    /**
     * compose an `Iso` with a `Prism`
     *
     * @since 1.0.0
     */
    Iso.prototype.composePrism = function (ab) {
        return fromPrism(pipe(this, asPrism, compose$1(ab)));
    };
    /**
     * compose an `Iso` with an `Optional`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeOptional = function (ab) {
        return fromOptional(pipe(this, asOptional$2, compose$2(ab)));
    };
    /**
     * compose an `Iso` with a `Traversal`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeTraversal = function (ab) {
        return fromTraversal(pipe(this, asTraversal$3, compose(ab)));
    };
    /**
     * compose an `Iso` with a `Fold`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose an `Iso` with a `Getter`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeGetter = function (ab) {
        return this.asGetter().compose(ab);
    };
    /**
     * compose an `Iso` with a `Setter`
     *
     * @since 1.0.0
     */
    Iso.prototype.composeSetter = function (ab) {
        return this.asSetter().compose(ab);
    };
    return Iso;
}());
/**
 * Laws:
 * 1. `get(set(a)(s)) = a`
 * 2. `set(get(s))(s) = s`
 * 3. `set(a)(set(a)(s)) = set(a)(s)`
 *
 * @category constructor
 * @since 1.0.0
 */
var Lens = /** @class */ (function () {
    function Lens(get, set) {
        this.get = get;
        this.set = set;
        /**
         * @since 1.0.0
         */
        this._tag = 'Lens';
    }
    /**
     * @example
     * import { Lens } from 'monocle-ts'
     *
     * type Person = {
     *   name: string
     *   age: number
     *   address: {
     *     city: string
     *   }
     * }
     *
     * const city = Lens.fromPath<Person>()(['address', 'city'])
     *
     * const person: Person = { name: 'Giulio', age: 43, address: { city: 'Milan' } }
     *
     * assert.strictEqual(city.get(person), 'Milan')
     * assert.deepStrictEqual(city.set('London')(person), { name: 'Giulio', age: 43, address: { city: 'London' } })
     *
     * @since 1.0.0
     */
    Lens.fromPath = function () {
        var fromProp = Lens.fromProp();
        return function (path) {
            var lens = fromProp(path[0]);
            return path.slice(1).reduce(function (acc, prop) { return acc.compose(fromProp(prop)); }, lens);
        };
    };
    /**
     * Returns a `Lens` from a type and a prop
     *
     * @example
     * import { Lens } from 'monocle-ts'
     *
     * type Person = {
     *   name: string
     *   age: number
     * }
     *
     * const age = Lens.fromProp<Person>()('age')
     *
     * const person: Person = { name: 'Giulio', age: 43 }
     *
     * assert.strictEqual(age.get(person), 43)
     * assert.deepStrictEqual(age.set(44)(person), { name: 'Giulio', age: 44 })
     *
     * @since 1.0.0
     */
    Lens.fromProp = function () {
        return function (prop$1) { return fromLens(pipe(id(), prop(prop$1))); };
    };
    Lens.fromProps = function () {
        return function (props$1) { return fromLens(pipe(id(), props.apply(lens$1, props$1))); };
    };
    /**
     * Returns a `Lens` from a nullable (`A | null | undefined`) prop
     *
     * @example
     * import { Lens } from 'monocle-ts'
     *
     * interface Outer {
     *   inner?: Inner
     * }
     *
     * interface Inner {
     *   value: number
     *   foo: string
     * }
     *
     * const inner = Lens.fromNullableProp<Outer>()('inner', { value: 0, foo: 'foo' })
     * const value = Lens.fromProp<Inner>()('value')
     * const lens = inner.compose(value)
     *
     * assert.deepStrictEqual(lens.set(1)({}), { inner: { value: 1, foo: 'foo' } })
     * assert.strictEqual(lens.get({}), 0)
     * assert.deepStrictEqual(lens.set(1)({ inner: { value: 1, foo: 'bar' } }), { inner: { value: 1, foo: 'bar' } })
     * assert.strictEqual(lens.get({ inner: { value: 1, foo: 'bar' } }), 1)
     *
     * @since 1.0.0
     */
    Lens.fromNullableProp = function () {
        return function (k, defaultValue) {
            return new Lens(function (s) {
                var osk = fromNullable$1(s[k]);
                if (isNone(osk)) {
                    return defaultValue;
                }
                else {
                    return osk.value;
                }
            }, function (a) { return function (s) { return update(s, k, a); }; });
        };
    };
    /**
     * @since 1.0.0
     */
    Lens.prototype.modify = function (f) {
        return modify$2(f)(this);
    };
    /**
     * view a `Lens` as a Optional
     *
     * @since 1.0.0
     */
    Lens.prototype.asOptional = function () {
        return fromOptional(asOptional$1(this));
    };
    /**
     * view a `Lens` as a `Traversal`
     *
     * @since 1.0.0
     */
    Lens.prototype.asTraversal = function () {
        return fromTraversal(asTraversal$2(this));
    };
    /**
     * view a `Lens` as a `Setter`
     *
     * @since 1.0.0
     */
    Lens.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /**
     * view a `Lens` as a `Getter`
     *
     * @since 1.0.0
     */
    Lens.prototype.asGetter = function () {
        var _this = this;
        return new Getter(function (s) { return _this.get(s); });
    };
    /**
     * view a `Lens` as a `Fold`
     *
     * @since 1.0.0
     */
    Lens.prototype.asFold = function () {
        var _this = this;
        return new Fold(function () { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /**
     * compose a `Lens` with a `Lens`
     *
     * @since 1.0.0
     */
    Lens.prototype.compose = function (ab) {
        return fromLens(compose$3(ab)(this));
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeLens = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Lens` with a `Getter`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeGetter = function (ab) {
        return this.asGetter().compose(ab);
    };
    /**
     * compose a `Lens` with a `Fold`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose a `Lens` with an `Optional`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeOptional = function (ab) {
        return fromOptional(pipe(this, asOptional$1, compose$2(ab)));
    };
    /**
     * compose a `Lens` with an `Traversal`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeTraversal = function (ab) {
        return fromTraversal(pipe(this, asTraversal$2, compose(ab)));
    };
    /**
     * compose a `Lens` with an `Setter`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeSetter = function (ab) {
        return this.asSetter().compose(ab);
    };
    /**
     * compose a `Lens` with an `Iso`
     *
     * @since 1.0.0
     */
    Lens.prototype.composeIso = function (ab) {
        return fromLens(pipe(this, compose$3(pipe(ab, asLens))));
    };
    /**
     * compose a `Lens` with a `Prism`
     *
     * @since 1.0.0
     */
    Lens.prototype.composePrism = function (ab) {
        return fromOptional(composePrism(ab)(this));
    };
    return Lens;
}());
/**
 * Laws:
 * 1. `pipe(getOption(s), fold(() => s, reverseGet)) = s`
 * 2. `getOption(reverseGet(a)) = some(a)`
 *
 * @category constructor
 * @since 1.0.0
 */
var Prism = /** @class */ (function () {
    function Prism(getOption, reverseGet) {
        this.getOption = getOption;
        this.reverseGet = reverseGet;
        /**
         * @since 1.0.0
         */
        this._tag = 'Prism';
    }
    Prism.fromPredicate = function (predicate) {
        return fromPrism(fromPredicate(predicate));
    };
    /**
     * @since 1.0.0
     */
    Prism.some = function () {
        return somePrism;
    };
    /**
     * @since 1.0.0
     */
    Prism.prototype.modify = function (f) {
        var _this = this;
        return function (s) {
            var os = _this.modifyOption(f)(s);
            if (isNone(os)) {
                return s;
            }
            else {
                return os.value;
            }
        };
    };
    /**
     * @since 1.0.0
     */
    Prism.prototype.modifyOption = function (f) {
        var _this = this;
        return function (s) {
            return option$1.map(_this.getOption(s), function (v) {
                var n = f(v);
                return n === v ? s : _this.reverseGet(n);
            });
        };
    };
    /**
     * set the target of a `Prism` with a value
     *
     * @since 1.0.0
     */
    Prism.prototype.set = function (a) {
        return this.modify(function () { return a; });
    };
    /**
     * view a `Prism` as a `Optional`
     *
     * @since 1.0.0
     */
    Prism.prototype.asOptional = function () {
        return fromOptional(asOptional(this));
    };
    /**
     * view a `Prism` as a `Traversal`
     *
     * @since 1.0.0
     */
    Prism.prototype.asTraversal = function () {
        return fromTraversal(asTraversal(this));
    };
    /**
     * view a `Prism` as a `Setter`
     *
     * @since 1.0.0
     */
    Prism.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /**
     * view a `Prism` as a `Fold`
     *
     * @since 1.0.0
     */
    Prism.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) { return function (s) {
            var oa = _this.getOption(s);
            return isNone(oa) ? M.empty : f(oa.value);
        }; }; });
    };
    /**
     * compose a `Prism` with a `Prism`
     *
     * @since 1.0.0
     */
    Prism.prototype.compose = function (ab) {
        return fromPrism(compose$1(ab)(this));
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Prism.prototype.composePrism = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Prism` with a `Optional`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeOptional = function (ab) {
        return fromOptional(pipe(this, asOptional, compose$2(ab)));
    };
    /**
     * compose a `Prism` with a `Traversal`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeTraversal = function (ab) {
        return fromTraversal(pipe(this, asTraversal, compose(ab)));
    };
    /**
     * compose a `Prism` with a `Fold`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose a `Prism` with a `Setter`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeSetter = function (ab) {
        return this.asSetter().compose(ab);
    };
    /**
     * compose a `Prism` with a `Iso`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeIso = function (ab) {
        return fromPrism(pipe(this, compose$1(pipe(ab, asPrism))));
    };
    /**
     * compose a `Prism` with a `Lens`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeLens = function (ab) {
        return fromOptional(composeLens(ab)(this));
    };
    /**
     * compose a `Prism` with a `Getter`
     *
     * @since 1.0.0
     */
    Prism.prototype.composeGetter = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    return Prism;
}());
var somePrism = 
/*#__PURE__*/
new Prism(identity$1, some$1);
/**
 * Laws:
 * 1. `pipe(getOption(s), fold(() => s, a => set(a)(s))) = s`
 * 2. `getOption(set(a)(s)) = pipe(getOption(s), map(_ => a))`
 * 3. `set(a)(set(a)(s)) = set(a)(s)`
 *
 * @category constructor
 * @since 1.0.0
 */
var Optional = /** @class */ (function () {
    function Optional(getOption, set) {
        this.getOption = getOption;
        this.set = set;
        /**
         * @since 1.0.0
         */
        this._tag = 'Optional';
    }
    /**
     * Returns an `Optional` from a nullable (`A | null | undefined`) prop
     *
     * @example
     * import { Optional } from 'monocle-ts'
     *
     * interface Phone {
     *   number: string
     * }
     * interface Employment {
     *   phone?: Phone
     * }
     * interface Info {
     *   employment?: Employment
     * }
     * interface Response {
     *   info?: Info
     * }
     *
     * const numberFromResponse = Optional.fromPath<Response>()(['info', 'employment', 'phone', 'number'])
     *
     * const response1: Response = {
     *   info: {
     *     employment: {
     *       phone: {
     *         number: '555-1234'
     *       }
     *     }
     *   }
     * }
     * const response2: Response = {
     *   info: {
     *     employment: {}
     *   }
     * }
     *
     * numberFromResponse.getOption(response1) // some('555-1234')
     * numberFromResponse.getOption(response2) // none
     *
     * @since 2.1.0
     */
    Optional.fromPath = function () {
        var fromNullableProp = Optional.fromNullableProp();
        return function (path) {
            var optional = fromNullableProp(path[0]);
            return path.slice(1).reduce(function (acc, prop) { return acc.compose(fromNullableProp(prop)); }, optional);
        };
    };
    /**
     * @example
     * import { Optional } from 'monocle-ts'
     *
     * interface S {
     *   a: number | undefined | null
     * }
     *
     * const optional = Optional.fromNullableProp<S>()('a')
     *
     * const s1: S = { a: undefined }
     * const s2: S = { a: null }
     * const s3: S = { a: 1 }
     *
     * assert.deepStrictEqual(optional.set(2)(s1), s1)
     * assert.deepStrictEqual(optional.set(2)(s2), s2)
     * assert.deepStrictEqual(optional.set(2)(s3), { a: 2 })
     *
     * @since 1.0.0
     */
    Optional.fromNullableProp = function () {
        return function (k) {
            return new Optional(function (s) { return fromNullable$1(s[k]); }, function (a) { return function (s) { return (s[k] == null ? s : update(s, k, a)); }; });
        };
    };
    /**
     * Returns an `Optional` from an option (`Option<A>`) prop
     *
     * @example
     * import { Optional } from 'monocle-ts'
     * import * as O from 'fp-ts/Option'
     *
     * interface S {
     *   a: O.Option<number>
     * }
     *
     * const optional = Optional.fromOptionProp<S>()('a')
     * const s1: S = { a: O.none }
     * const s2: S = { a: O.some(1) }
     * assert.deepStrictEqual(optional.set(2)(s1), s1)
     * assert.deepStrictEqual(optional.set(2)(s2), { a: O.some(2) })
     *
     * @since 1.0.0
     */
    Optional.fromOptionProp = function () {
        var formProp = Lens.fromProp();
        return function (prop) { return formProp(prop).composePrism(somePrism); };
    };
    /**
     * @since 1.0.0
     */
    Optional.prototype.modify = function (f) {
        return modify$1(f)(this);
    };
    /**
     * @since 1.0.0
     */
    Optional.prototype.modifyOption = function (f) {
        return modifyOption(f)(this);
    };
    /**
     * view a `Optional` as a `Traversal`
     *
     * @since 1.0.0
     */
    Optional.prototype.asTraversal = function () {
        return fromTraversal(asTraversal$1(this));
    };
    /**
     * view an `Optional` as a `Fold`
     *
     * @since 1.0.0
     */
    Optional.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) { return function (s) {
            var oa = _this.getOption(s);
            return isNone(oa) ? M.empty : f(oa.value);
        }; }; });
    };
    /**
     * view an `Optional` as a `Setter`
     *
     * @since 1.0.0
     */
    Optional.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /**
     * compose a `Optional` with a `Optional`
     *
     * @since 1.0.0
     */
    Optional.prototype.compose = function (ab) {
        return fromOptional(compose$2(ab)(this));
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeOptional = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose an `Optional` with a `Traversal`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeTraversal = function (ab) {
        return fromTraversal(pipe(this, asTraversal$1, compose(ab)));
    };
    /**
     * compose an `Optional` with a `Fold`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose an `Optional` with a `Setter`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeSetter = function (ab) {
        return this.asSetter().compose(ab);
    };
    /**
     * compose an `Optional` with a `Lens`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeLens = function (ab) {
        return fromOptional(pipe(this, compose$2(pipe(ab, asOptional$1))));
    };
    /**
     * compose an `Optional` with a `Prism`
     *
     * @since 1.0.0
     */
    Optional.prototype.composePrism = function (ab) {
        return fromOptional(pipe(this, compose$2(pipe(ab, asOptional))));
    };
    /**
     * compose an `Optional` with a `Iso`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeIso = function (ab) {
        return fromOptional(pipe(this, compose$2(pipe(ab, asOptional$2))));
    };
    /**
     * compose an `Optional` with a `Getter`
     *
     * @since 1.0.0
     */
    Optional.prototype.composeGetter = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    return Optional;
}());
/**
 * @category constructor
 * @since 1.0.0
 */
var Traversal = /** @class */ (function () {
    function Traversal(
    // Van Laarhoven representation
    modifyF) {
        this.modifyF = modifyF;
        /**
         * @since 1.0.0
         */
        this._tag = 'Traversal';
    }
    /**
     * @since 1.0.0
     */
    Traversal.prototype.modify = function (f) {
        return modify(f)(this);
    };
    /**
     * @since 1.0.0
     */
    Traversal.prototype.set = function (a) {
        return set(a)(this);
    };
    Traversal.prototype.filter = function (predicate) {
        return fromTraversal(filter(predicate)(this));
    };
    /**
     * view a `Traversal` as a `Fold`
     *
     * @since 1.0.0
     */
    Traversal.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) {
            return _this.modifyF(getApplicative(M))(function (a) { return make(f(a)); });
        }; });
    };
    /**
     * view a `Traversal` as a `Setter`
     *
     * @since 1.0.0
     */
    Traversal.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /**
     * compose a `Traversal` with a `Traversal`
     *
     * @since 1.0.0
     */
    Traversal.prototype.compose = function (ab) {
        return fromTraversal(compose(ab)(this));
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeTraversal = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Traversal` with a `Fold`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose a `Traversal` with a `Setter`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeSetter = function (ab) {
        return this.asSetter().compose(ab);
    };
    /**
     * compose a `Traversal` with a `Optional`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeOptional = function (ab) {
        return this.compose(ab.asTraversal());
    };
    /**
     * compose a `Traversal` with a `Lens`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeLens = function (ab) {
        return fromTraversal(pipe(this, compose(pipe(ab, asTraversal$2))));
    };
    /**
     * compose a `Traversal` with a `Prism`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composePrism = function (ab) {
        return fromTraversal(pipe(this, compose(pipe(ab, asTraversal))));
    };
    /**
     * compose a `Traversal` with a `Iso`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeIso = function (ab) {
        return fromTraversal(pipe(this, compose(pipe(ab, asTraversal$3))));
    };
    /**
     * compose a `Traversal` with a `Getter`
     *
     * @since 1.0.0
     */
    Traversal.prototype.composeGetter = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    return Traversal;
}());
/**
 * @category constructor
 * @since 1.0.0
 */
var Getter = /** @class */ (function () {
    function Getter(get) {
        this.get = get;
        /**
         * @since 1.0.0
         */
        this._tag = 'Getter';
    }
    /**
     * view a `Getter` as a `Fold`
     *
     * @since 1.0.0
     */
    Getter.prototype.asFold = function () {
        var _this = this;
        return new Fold(function () { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /**
     * compose a `Getter` with a `Getter`
     *
     * @since 1.0.0
     */
    Getter.prototype.compose = function (ab) {
        var _this = this;
        return new Getter(function (s) { return ab.get(_this.get(s)); });
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeGetter = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Getter` with a `Fold`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /**
     * compose a `Getter` with a `Lens`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeLens = function (ab) {
        return this.compose(ab.asGetter());
    };
    /**
     * compose a `Getter` with a `Iso`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeIso = function (ab) {
        return this.compose(ab.asGetter());
    };
    /**
     * compose a `Getter` with a `Optional`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeTraversal = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    /**
     * compose a `Getter` with a `Optional`
     *
     * @since 1.0.0
     */
    Getter.prototype.composeOptional = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    /**
     * compose a `Getter` with a `Prism`
     *
     * @since 1.0.0
     */
    Getter.prototype.composePrism = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    return Getter;
}());
/**
 * @category constructor
 * @since 1.0.0
 */
var Fold = /** @class */ (function () {
    function Fold(foldMap) {
        this.foldMap = foldMap;
        /**
         * @since 1.0.0
         */
        this._tag = 'Fold';
        this.getAll = foldMap(getMonoid())(of);
        this.exist = foldMap(monoidAny);
        this.all = foldMap(monoidAll);
        this.foldMapFirst = foldMap(getFirstMonoid());
    }
    /**
     * compose a `Fold` with a `Fold`
     *
     * @since 1.0.0
     */
    Fold.prototype.compose = function (ab) {
        var _this = this;
        return new Fold(function (M) { return function (f) { return _this.foldMap(M)(ab.foldMap(M)(f)); }; });
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeFold = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Fold` with a `Getter`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeGetter = function (ab) {
        return this.compose(ab.asFold());
    };
    /**
     * compose a `Fold` with a `Traversal`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeTraversal = function (ab) {
        return this.compose(ab.asFold());
    };
    /**
     * compose a `Fold` with a `Optional`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeOptional = function (ab) {
        return this.compose(ab.asFold());
    };
    /**
     * compose a `Fold` with a `Lens`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeLens = function (ab) {
        return this.compose(ab.asFold());
    };
    /**
     * compose a `Fold` with a `Prism`
     *
     * @since 1.0.0
     */
    Fold.prototype.composePrism = function (ab) {
        return this.compose(ab.asFold());
    };
    /**
     * compose a `Fold` with a `Iso`
     *
     * @since 1.0.0
     */
    Fold.prototype.composeIso = function (ab) {
        return this.compose(ab.asFold());
    };
    Fold.prototype.find = function (p) {
        return this.foldMapFirst(fromPredicate$1(p));
    };
    /**
     * get the first target of a `Fold`
     *
     * @since 1.0.0
     */
    Fold.prototype.headOption = function (s) {
        return this.find(function () { return true; })(s);
    };
    return Fold;
}());
/**
 * @category constructor
 * @since 1.0.0
 */
var Setter = /** @class */ (function () {
    function Setter(modify) {
        this.modify = modify;
        /**
         * @since 1.0.0
         */
        this._tag = 'Setter';
    }
    /**
     * @since 1.0.0
     */
    Setter.prototype.set = function (a) {
        return this.modify(constant$1(a));
    };
    /**
     * compose a `Setter` with a `Setter`
     *
     * @since 1.0.0
     */
    Setter.prototype.compose = function (ab) {
        var _this = this;
        return new Setter(function (f) { return _this.modify(ab.modify(f)); });
    };
    /**
     * Alias of `compose`
     *
     * @since 1.0.0
     */
    Setter.prototype.composeSetter = function (ab) {
        return this.compose(ab);
    };
    /**
     * compose a `Setter` with a `Traversal`
     *
     * @since 1.0.0
     */
    Setter.prototype.composeTraversal = function (ab) {
        return this.compose(ab.asSetter());
    };
    /**
     * compose a `Setter` with a `Optional`
     *
     * @since 1.0.0
     */
    Setter.prototype.composeOptional = function (ab) {
        return this.compose(ab.asSetter());
    };
    /**
     * compose a `Setter` with a `Lens`
     *
     * @since 1.0.0
     */
    Setter.prototype.composeLens = function (ab) {
        return this.compose(ab.asSetter());
    };
    /**
     * compose a `Setter` with a `Prism`
     *
     * @since 1.0.0
     */
    Setter.prototype.composePrism = function (ab) {
        return this.compose(ab.asSetter());
    };
    /**
     * compose a `Setter` with a `Iso`
     *
     * @since 1.0.0
     */
    Setter.prototype.composeIso = function (ab) {
        return this.compose(ab.asSetter());
    };
    return Setter;
}());

//
// isos
//
var anyIso = 
/*#__PURE__*/
new Iso(unsafeCoerce, unsafeCoerce);
/**
 * @since 0.2.0
 */
function iso() {
    return anyIso;
}

/**
 * @since 0.5.2
 */
/**
 * Returns a codec from a newtype
 *
 * @example
 * import { fromNewtype } from 'io-ts-types/es6/fromNewtype'
 * import * as t from 'io-ts'
 * import { right } from 'fp-ts/es6/Either'
 * import { PathReporter } from 'io-ts/es6/PathReporter'
 * import { Newtype, iso } from 'newtype-ts'
 *
 * interface Token extends Newtype<{ readonly Token: unique symbol }, string> {}
 *
 * const T = fromNewtype<Token>(t.string)
 *
 * assert.deepStrictEqual(T.decode('sometoken'), right(iso<Token>().wrap('sometoken')))
 * assert.deepStrictEqual(PathReporter.report(T.decode(42)), ['Invalid value 42 supplied to : fromNewtype(string)'])
 *
 * @since 0.5.2
 */
function fromNewtype(codec, name) {
    if (name === void 0) { name = "fromNewtype(" + codec.name + ")"; }
    var i = iso();
    return new Type(name, function (u) { return codec.is(u); }, function (u, c) {
        return pipe(codec.validate(u, c), map$2(i.wrap));
    }, function (a) { return codec.encode(i.unwrap(a)); });
}

var None = strict({
    _tag: literal('None')
}, 'None');
var someLiteral = literal('Some');
/**
 * @since 0.5.0
 */
function option(codec, name) {
    if (name === void 0) { name = "Option<" + codec.name + ">"; }
    return union([
        None,
        strict({
            _tag: someLiteral,
            value: codec
        }, "Some<" + codec.name + ">")
    ], name);
}

/**
 * @since 0.5.0
 */
/**
 * @since 0.5.0
 */
function optionFromNullable(codec, name) {
    if (name === void 0) { name = "Option<" + codec.name + ">"; }
    return new Type(name, option(codec).is, function (u, c) {
        return u == null
            ? success(none)
            : pipe(codec.validate(u, c), map$2(some$1));
    }, function (a) {
        return toNullable(pipe(a, map$1(codec.encode)));
    });
}

var string = {};

var ReadonlyNonEmptyArray = {};

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reduceRight = exports.foldMap = exports.reduce = exports.mapWithIndex = exports.map = exports.flatten = exports.duplicate = exports.extend = exports.flatMap = exports.ap = exports.alt = exports.altW = exports.of = exports.chunksOf = exports.splitAt = exports.chop = exports.chainWithIndex = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = exports.modifyAt = exports.updateAt = exports.sort = exports.groupBy = exports.group = exports.reverse = exports.concat = exports.concatW = exports.fromArray = exports.unappend = exports.unprepend = exports.range = exports.replicate = exports.makeBy = exports.fromReadonlyArray = exports.rotate = exports.union = exports.sortBy = exports.uniq = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.append = exports.appendW = exports.prepend = exports.prependW = exports.isOutOfBound = exports.isNonEmpty = exports.empty = void 0;
	exports.groupSort = exports.chain = exports.intercalate = exports.updateLast = exports.modifyLast = exports.updateHead = exports.modifyHead = exports.matchRight = exports.matchLeft = exports.concatAll = exports.max = exports.min = exports.init = exports.last = exports.tail = exports.head = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.chainFirst = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getUnionSemigroup = exports.getEq = exports.getSemigroup = exports.getShow = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = void 0;
	exports.readonlyNonEmptyArray = exports.fold = exports.prependToAll = exports.insertAt = exports.snoc = exports.cons = exports.unsnoc = exports.uncons = exports.filterWithIndex = exports.filter = void 0;
	var Apply_1 = Apply;
	var Chain_1 = Chain;
	var Eq_1 = Eq;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var Ord_1 = Ord;
	var Se = __importStar(Semigroup);
	// -------------------------------------------------------------------------------------
	// internal
	// -------------------------------------------------------------------------------------
	/**
	 * @internal
	 */
	exports.empty = _.emptyReadonlyArray;
	/**
	 * @internal
	 */
	exports.isNonEmpty = _.isNonEmpty;
	/**
	 * @internal
	 */
	var isOutOfBound = function (i, as) { return i < 0 || i >= as.length; };
	exports.isOutOfBound = isOutOfBound;
	/**
	 * @internal
	 */
	var prependW = function (head) {
	    return function (tail) {
	        return __spreadArray([head], tail, true);
	    };
	};
	exports.prependW = prependW;
	/**
	 * @internal
	 */
	exports.prepend = exports.prependW;
	/**
	 * @internal
	 */
	var appendW = function (end) {
	    return function (init) {
	        return __spreadArray(__spreadArray([], init, true), [end], false);
	    };
	};
	exports.appendW = appendW;
	/**
	 * @internal
	 */
	exports.append = exports.appendW;
	/**
	 * @internal
	 */
	var unsafeInsertAt = function (i, a, as) {
	    if ((0, exports.isNonEmpty)(as)) {
	        var xs = _.fromReadonlyNonEmptyArray(as);
	        xs.splice(i, 0, a);
	        return xs;
	    }
	    return [a];
	};
	exports.unsafeInsertAt = unsafeInsertAt;
	/**
	 * @internal
	 */
	var unsafeUpdateAt = function (i, a, as) {
	    if (as[i] === a) {
	        return as;
	    }
	    else {
	        var xs = _.fromReadonlyNonEmptyArray(as);
	        xs[i] = a;
	        return xs;
	    }
	};
	exports.unsafeUpdateAt = unsafeUpdateAt;
	/**
	 * Remove duplicates from a `ReadonlyNonEmptyArray`, keeping the first occurrence of an element.
	 *
	 * @example
	 * import { uniq } from 'fp-ts/ReadonlyNonEmptyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(uniq(N.Eq)([1, 2, 1]), [1, 2])
	 *
	 * @since 2.11.0
	 */
	var uniq = function (E) {
	    return function (as) {
	        if (as.length === 1) {
	            return as;
	        }
	        var out = [(0, exports.head)(as)];
	        var rest = (0, exports.tail)(as);
	        var _loop_1 = function (a) {
	            if (out.every(function (o) { return !E.equals(o, a); })) {
	                out.push(a);
	            }
	        };
	        for (var _i = 0, rest_1 = rest; _i < rest_1.length; _i++) {
	            var a = rest_1[_i];
	            _loop_1(a);
	        }
	        return out;
	    };
	};
	exports.uniq = uniq;
	/**
	 * Sort the elements of a `ReadonlyNonEmptyArray` in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
	 * etc...
	 *
	 * @example
	 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { contramap } from 'fp-ts/Ord'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * interface Person {
	 *   name: string
	 *   age: number
	 * }
	 *
	 * const byName = pipe(S.Ord, contramap((p: Person) => p.name))
	 *
	 * const byAge = pipe(N.Ord, contramap((p: Person) => p.age))
	 *
	 * const sortByNameByAge = RNEA.sortBy([byName, byAge])
	 *
	 * const persons: RNEA.ReadonlyNonEmptyArray<Person> = [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 },
	 *   { name: 'b', age: 2 }
	 * ]
	 *
	 * assert.deepStrictEqual(sortByNameByAge(persons), [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 2 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 }
	 * ])
	 *
	 * @since 2.11.0
	 */
	var sortBy = function (ords) {
	    if ((0, exports.isNonEmpty)(ords)) {
	        var M = (0, Ord_1.getMonoid)();
	        return (0, exports.sort)(ords.reduce(M.concat, M.empty));
	    }
	    return function_1.identity;
	};
	exports.sortBy = sortBy;
	/**
	 * @since 2.11.0
	 */
	var union = function (E) {
	    var uniqE = (0, exports.uniq)(E);
	    return function (second) { return function (first) { return uniqE((0, function_1.pipe)(first, concat(second))); }; };
	};
	exports.union = union;
	/**
	 * Rotate a `ReadonlyNonEmptyArray` by `n` steps.
	 *
	 * @example
	 * import { rotate } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
	 * assert.deepStrictEqual(rotate(-2)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])
	 *
	 * @since 2.11.0
	 */
	var rotate = function (n) {
	    return function (as) {
	        var len = as.length;
	        var m = Math.round(n) % len;
	        if ((0, exports.isOutOfBound)(Math.abs(m), as) || m === 0) {
	            return as;
	        }
	        if (m < 0) {
	            var _a = (0, exports.splitAt)(-m)(as), f = _a[0], s = _a[1];
	            return (0, function_1.pipe)(s, concat(f));
	        }
	        else {
	            return (0, exports.rotate)(m - len)(as);
	        }
	    };
	};
	exports.rotate = rotate;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * Return a `ReadonlyNonEmptyArray` from a `ReadonlyArray` returning `none` if the input is empty.
	 *
	 * @category conversions
	 * @since 2.5.0
	 */
	var fromReadonlyArray = function (as) {
	    return (0, exports.isNonEmpty)(as) ? _.some(as) : _.none;
	};
	exports.fromReadonlyArray = fromReadonlyArray;
	/**
	 * Return a `ReadonlyNonEmptyArray` of length `n` with element `i` initialized with `f(i)`.
	 *
	 * **Note**. `n` is normalized to a natural number.
	 *
	 * @example
	 * import { makeBy } from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const double = (n: number): number => n * 2
	 * assert.deepStrictEqual(pipe(5, makeBy(double)), [0, 2, 4, 6, 8])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var makeBy = function (f) {
	    return function (n) {
	        var j = Math.max(0, Math.floor(n));
	        var out = [f(0)];
	        for (var i = 1; i < j; i++) {
	            out.push(f(i));
	        }
	        return out;
	    };
	};
	exports.makeBy = makeBy;
	/**
	 * Create a `ReadonlyNonEmptyArray` containing a value repeated the specified number of times.
	 *
	 * **Note**. `n` is normalized to a natural number.
	 *
	 * @example
	 * import { replicate } from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(3, replicate('a')), ['a', 'a', 'a'])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var replicate = function (a) { return (0, exports.makeBy)(function () { return a; }); };
	exports.replicate = replicate;
	/**
	 * Create a `ReadonlyNonEmptyArray` containing a range of integers, including both endpoints.
	 *
	 * @example
	 * import { range } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var range = function (start, end) {
	    return start <= end ? (0, exports.makeBy)(function (i) { return start + i; })(end - start + 1) : [start];
	};
	exports.range = range;
	/**
	 * Return the tuple of the `head` and the `tail`.
	 *
	 * @example
	 * import { unprepend } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(unprepend([1, 2, 3, 4]), [1, [2, 3, 4]])
	 *
	 * @since 2.9.0
	 */
	var unprepend = function (as) { return [(0, exports.head)(as), (0, exports.tail)(as)]; };
	exports.unprepend = unprepend;
	/**
	 * Return the tuple of the `init` and the `last`.
	 *
	 * @example
	 * import { unappend } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(unappend([1, 2, 3, 4]), [[1, 2, 3], 4])
	 *
	 * @since 2.9.0
	 */
	var unappend = function (as) { return [(0, exports.init)(as), (0, exports.last)(as)]; };
	exports.unappend = unappend;
	/**
	 * @category conversions
	 * @since 2.5.0
	 */
	var fromArray = function (as) { return (0, exports.fromReadonlyArray)(as.slice()); };
	exports.fromArray = fromArray;
	function concatW(second) {
	    return function (first) { return first.concat(second); };
	}
	exports.concatW = concatW;
	function concat(x, y) {
	    return y ? x.concat(y) : function (y) { return y.concat(x); };
	}
	exports.concat = concat;
	/**
	 * @since 2.5.0
	 */
	var reverse = function (as) {
	    return as.length === 1 ? as : __spreadArray([(0, exports.last)(as)], as.slice(0, -1).reverse(), true);
	};
	exports.reverse = reverse;
	function group(E) {
	    return function (as) {
	        var len = as.length;
	        if (len === 0) {
	            return exports.empty;
	        }
	        var out = [];
	        var head = as[0];
	        var nea = [head];
	        for (var i = 1; i < len; i++) {
	            var a = as[i];
	            if (E.equals(a, head)) {
	                nea.push(a);
	            }
	            else {
	                out.push(nea);
	                head = a;
	                nea = [head];
	            }
	        }
	        out.push(nea);
	        return out;
	    };
	}
	exports.group = group;
	/**
	 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
	 * function on each element, and grouping the results according to values returned
	 *
	 * @example
	 * import { groupBy } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['a', 'b', 'ab']), {
	 *   '1': ['a', 'b'],
	 *   '2': ['ab']
	 * })
	 *
	 * @since 2.5.0
	 */
	var groupBy = function (f) {
	    return function (as) {
	        var out = {};
	        for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
	            var a = as_1[_i];
	            var k = f(a);
	            if (_.has.call(out, k)) {
	                out[k].push(a);
	            }
	            else {
	                out[k] = [a];
	            }
	        }
	        return out;
	    };
	};
	exports.groupBy = groupBy;
	/**
	 * @since 2.5.0
	 */
	var sort = function (O) {
	    return function (as) {
	        return as.length === 1 ? as : as.slice().sort(O.compare);
	    };
	};
	exports.sort = sort;
	/**
	 * @since 2.5.0
	 */
	var updateAt = function (i, a) {
	    return (0, exports.modifyAt)(i, function () { return a; });
	};
	exports.updateAt = updateAt;
	/**
	 * @since 2.5.0
	 */
	var modifyAt = function (i, f) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeUpdateAt)(i, f(as[i]), as));
	    };
	};
	exports.modifyAt = modifyAt;
	/**
	 * @since 2.5.1
	 */
	var zipWith = function (as, bs, f) {
	    var cs = [f(as[0], bs[0])];
	    var len = Math.min(as.length, bs.length);
	    for (var i = 1; i < len; i++) {
	        cs[i] = f(as[i], bs[i]);
	    }
	    return cs;
	};
	exports.zipWith = zipWith;
	function zip(as, bs) {
	    if (bs === undefined) {
	        return function (bs) { return zip(bs, as); };
	    }
	    return (0, exports.zipWith)(as, bs, function (a, b) { return [a, b]; });
	}
	exports.zip = zip;
	/**
	 * @since 2.5.1
	 */
	var unzip = function (abs) {
	    var fa = [abs[0][0]];
	    var fb = [abs[0][1]];
	    for (var i = 1; i < abs.length; i++) {
	        fa[i] = abs[i][0];
	        fb[i] = abs[i][1];
	    }
	    return [fa, fb];
	};
	exports.unzip = unzip;
	/**
	 * Prepend an element to every member of a `ReadonlyNonEmptyArray`.
	 *
	 * @example
	 * import { prependAll } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(prependAll(9)([1, 2, 3, 4]), [9, 1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.10.0
	 */
	var prependAll = function (middle) {
	    return function (as) {
	        var out = [middle, as[0]];
	        for (var i = 1; i < as.length; i++) {
	            out.push(middle, as[i]);
	        }
	        return out;
	    };
	};
	exports.prependAll = prependAll;
	/**
	 * Places an element in between members of a `ReadonlyNonEmptyArray`.
	 *
	 * @example
	 * import { intersperse } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(intersperse(9)([1, 2, 3, 4]), [1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.9.0
	 */
	var intersperse = function (middle) {
	    return function (as) {
	        var rest = (0, exports.tail)(as);
	        return (0, exports.isNonEmpty)(rest) ? (0, function_1.pipe)(rest, (0, exports.prependAll)(middle), (0, exports.prepend)((0, exports.head)(as))) : as;
	    };
	};
	exports.intersperse = intersperse;
	/**
	 * @category sequencing
	 * @since 2.10.0
	 */
	var chainWithIndex = function (f) {
	    return function (as) {
	        var out = _.fromReadonlyNonEmptyArray(f(0, (0, exports.head)(as)));
	        for (var i = 1; i < as.length; i++) {
	            out.push.apply(out, f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.chainWithIndex = chainWithIndex;
	/**
	 * A useful recursion pattern for processing a `ReadonlyNonEmptyArray` to produce a new `ReadonlyNonEmptyArray`, often used for "chopping" up the input
	 * `ReadonlyNonEmptyArray`. Typically `chop` is called with some function that will consume an initial prefix of the `ReadonlyNonEmptyArray` and produce a
	 * value and the tail of the `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.10.0
	 */
	var chop = function (f) {
	    return function (as) {
	        var _a = f(as), b = _a[0], rest = _a[1];
	        var out = [b];
	        var next = rest;
	        while ((0, exports.isNonEmpty)(next)) {
	            var _b = f(next), b_1 = _b[0], rest_2 = _b[1];
	            out.push(b_1);
	            next = rest_2;
	        }
	        return out;
	    };
	};
	exports.chop = chop;
	/**
	 * Splits a `ReadonlyNonEmptyArray` into two pieces, the first piece has max `n` elements.
	 *
	 * @since 2.10.0
	 */
	var splitAt = function (n) {
	    return function (as) {
	        var m = Math.max(1, n);
	        return m >= as.length ? [as, exports.empty] : [(0, function_1.pipe)(as.slice(1, m), (0, exports.prepend)((0, exports.head)(as))), as.slice(m)];
	    };
	};
	exports.splitAt = splitAt;
	/**
	 * Splits a `ReadonlyNonEmptyArray` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
	 * the `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.10.0
	 */
	var chunksOf = function (n) { return (0, exports.chop)((0, exports.splitAt)(n)); };
	exports.chunksOf = chunksOf;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	/* istanbul ignore next */
	var _mapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapWithIndex)(f)); };
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	/* istanbul ignore next */
	var _extend = function (wa, f) { return (0, function_1.pipe)(wa, (0, exports.extend)(f)); };
	/* istanbul ignore next */
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	/* istanbul ignore next */
	var _foldMap = function (M) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	/* istanbul ignore next */
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	/* istanbul ignore next */
	var _reduceWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _foldMapWithIndex = function (M) {
	    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapWithIndexM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRightWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _traverseWithIndex = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseWithIndexF(f)); };
	};
	/**
	 * @category constructors
	 * @since 2.5.0
	 */
	exports.of = _.singleton;
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @example
	 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3] as RNEA.ReadonlyNonEmptyArray<number>,
	 *     RNEA.altW(() => ['a', 'b'])
	 *   ),
	 *   [1, 2, 3, 'a', 'b']
	 * )
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	var altW = function (that) {
	    return function (as) {
	        return (0, function_1.pipe)(as, concatW(that()));
	    };
	};
	exports.altW = altW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `ReadonlyNonEmptyArray` concatenates the inputs into a single array.
	 *
	 * @example
	 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RNEA.alt(() => [4, 5])
	 *   ),
	 *   [1, 2, 3, 4, 5]
	 * )
	 *
	 * @category error handling
	 * @since 2.6.2
	 */
	exports.alt = exports.altW;
	/**
	 * @since 2.5.0
	 */
	var ap = function (as) { return (0, exports.flatMap)(function (f) { return (0, function_1.pipe)(as, (0, exports.map)(f)); }); };
	exports.ap = ap;
	/**
	 * @example
	 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RNEA.flatMap((n) => [`a${n}`, `b${n}`])
	 *   ),
	 *   ['a1', 'b1', 'a2', 'b2', 'a3', 'b3']
	 * )
	 *
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) {
	    return (0, function_1.pipe)(ma, (0, exports.chainWithIndex)(function (i, a) { return f(a, i); }));
	});
	/**
	 * @since 2.5.0
	 */
	var extend = function (f) {
	    return function (as) {
	        var next = (0, exports.tail)(as);
	        var out = [f(as)];
	        while ((0, exports.isNonEmpty)(next)) {
	            out.push(f(next));
	            next = (0, exports.tail)(next);
	        }
	        return out;
	    };
	};
	exports.extend = extend;
	/**
	 * @since 2.5.0
	 */
	exports.duplicate = 
	/*#__PURE__*/ (0, exports.extend)(function_1.identity);
	/**
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.flatten = 
	/*#__PURE__*/ (0, exports.flatMap)(function_1.identity);
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.5.0
	 */
	var map = function (f) {
	    return (0, exports.mapWithIndex)(function (_, a) { return f(a); });
	};
	exports.map = map;
	/**
	 * @category mapping
	 * @since 2.5.0
	 */
	var mapWithIndex = function (f) {
	    return function (as) {
	        var out = [f(0, (0, exports.head)(as))];
	        for (var i = 1; i < as.length; i++) {
	            out.push(f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.mapWithIndex = mapWithIndex;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduce = function (b, f) {
	    return (0, exports.reduceWithIndex)(b, function (_, b, a) { return f(b, a); });
	};
	exports.reduce = reduce;
	/**
	 * **Note**. The constraint is relaxed: a `Semigroup` instead of a `Monoid`.
	 *
	 * @category folding
	 * @since 2.5.0
	 */
	var foldMap = function (S) {
	    return function (f) {
	        return function (as) {
	            return as.slice(1).reduce(function (s, a) { return S.concat(s, f(a)); }, f(as[0]));
	        };
	    };
	};
	exports.foldMap = foldMap;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceRight = function (b, f) {
	    return (0, exports.reduceRightWithIndex)(b, function (_, b, a) { return f(b, a); });
	};
	exports.reduceRight = reduceRight;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceWithIndex = function (b, f) {
	    return function (as) {
	        return as.reduce(function (b, a, i) { return f(i, b, a); }, b);
	    };
	};
	exports.reduceWithIndex = reduceWithIndex;
	/**
	 * **Note**. The constraint is relaxed: a `Semigroup` instead of a `Monoid`.
	 *
	 * @category folding
	 * @since 2.5.0
	 */
	var foldMapWithIndex = function (S) {
	    return function (f) {
	        return function (as) {
	            return as.slice(1).reduce(function (s, a, i) { return S.concat(s, f(i + 1, a)); }, f(0, as[0]));
	        };
	    };
	};
	exports.foldMapWithIndex = foldMapWithIndex;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceRightWithIndex = function (b, f) {
	    return function (as) {
	        return as.reduceRight(function (b, a, i) { return f(i, a, b); }, b);
	    };
	};
	exports.reduceRightWithIndex = reduceRightWithIndex;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
	};
	exports.traverse = traverse;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) { return (0, exports.traverseWithIndex)(F)(function_1.SK); };
	exports.sequence = sequence;
	/**
	 * @category sequencing
	 * @since 2.6.3
	 */
	var traverseWithIndex = function (F) {
	    return function (f) {
	        return function (as) {
	            var out = F.map(f(0, (0, exports.head)(as)), exports.of);
	            for (var i = 1; i < as.length; i++) {
	                out = F.ap(F.map(out, function (bs) { return function (b) { return (0, function_1.pipe)(bs, (0, exports.append)(b)); }; }), f(i, as[i]));
	            }
	            return out;
	        };
	    };
	};
	exports.traverseWithIndex = traverseWithIndex;
	/**
	 * @category Comonad
	 * @since 2.6.3
	 */
	exports.extract = _.head;
	/**
	 * @category type lambdas
	 * @since 2.5.0
	 */
	exports.URI = 'ReadonlyNonEmptyArray';
	/**
	 * @category instances
	 * @since 2.5.0
	 */
	var getShow = function (S) { return ({
	    show: function (as) { return "[".concat(as.map(S.show).join(', '), "]"); }
	}); };
	exports.getShow = getShow;
	/**
	 * Builds a `Semigroup` instance for `ReadonlyNonEmptyArray`
	 *
	 * @category instances
	 * @since 2.5.0
	 */
	var getSemigroup = function () { return ({
	    concat: concat
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * @example
	 * import { getEq } from 'fp-ts/ReadonlyNonEmptyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * const E = getEq(N.Eq)
	 * assert.strictEqual(E.equals([1, 2], [1, 2]), true)
	 * assert.strictEqual(E.equals([1, 2], [1, 3]), false)
	 *
	 * @category instances
	 * @since 2.5.0
	 */
	var getEq = function (E) {
	    return (0, Eq_1.fromEquals)(function (xs, ys) { return xs.length === ys.length && xs.every(function (x, i) { return E.equals(x, ys[i]); }); });
	};
	exports.getEq = getEq;
	/**
	 * @since 2.11.0
	 */
	var getUnionSemigroup = function (E) {
	    var unionE = (0, exports.union)(E);
	    return {
	        concat: function (first, second) { return unionE(second)(first); }
	    };
	};
	exports.getUnionSemigroup = getUnionSemigroup;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FunctorWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.5.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.5.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.chainFirst(() => ['a', 'b'])
	 *   ),
	 *   [1, 1, 2, 2, 3, 3]
	 * )
	 *
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.chainFirst = (0, Chain_1.chainFirst)(exports.Chain);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FoldableWithIndex = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.TraversableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Comonad = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend,
	    extract: exports.extract
	};
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = (0, Chain_1.bind)(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.5.0
	 */
	exports.head = exports.extract;
	/**
	 * @since 2.5.0
	 */
	exports.tail = _.tail;
	/**
	 * @since 2.5.0
	 */
	var last = function (as) { return as[as.length - 1]; };
	exports.last = last;
	/**
	 * Get all but the last element of a non empty array, creating a new array.
	 *
	 * @example
	 * import { init } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
	 * assert.deepStrictEqual(init([1]), [])
	 *
	 * @since 2.5.0
	 */
	var init = function (as) { return as.slice(0, -1); };
	exports.init = init;
	/**
	 * @since 2.5.0
	 */
	var min = function (O) {
	    var S = Se.min(O);
	    return function (as) { return as.reduce(S.concat); };
	};
	exports.min = min;
	/**
	 * @since 2.5.0
	 */
	var max = function (O) {
	    var S = Se.max(O);
	    return function (as) { return as.reduce(S.concat); };
	};
	exports.max = max;
	/**
	 * @since 2.10.0
	 */
	var concatAll = function (S) {
	    return function (as) {
	        return as.reduce(S.concat);
	    };
	};
	exports.concatAll = concatAll;
	/**
	 * Break a `ReadonlyArray` into its first element and remaining elements.
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchLeft = function (f) {
	    return function (as) {
	        return f((0, exports.head)(as), (0, exports.tail)(as));
	    };
	};
	exports.matchLeft = matchLeft;
	/**
	 * Break a `ReadonlyArray` into its initial elements and the last element.
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchRight = function (f) {
	    return function (as) {
	        return f((0, exports.init)(as), (0, exports.last)(as));
	    };
	};
	exports.matchRight = matchRight;
	/**
	 * Apply a function to the head, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var modifyHead = function (f) {
	    return function (as) {
	        return __spreadArray([f((0, exports.head)(as))], (0, exports.tail)(as), true);
	    };
	};
	exports.modifyHead = modifyHead;
	/**
	 * Change the head, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var updateHead = function (a) { return (0, exports.modifyHead)(function () { return a; }); };
	exports.updateHead = updateHead;
	/**
	 * Apply a function to the last element, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var modifyLast = function (f) {
	    return function (as) {
	        return (0, function_1.pipe)((0, exports.init)(as), (0, exports.append)(f((0, exports.last)(as))));
	    };
	};
	exports.modifyLast = modifyLast;
	/**
	 * Change the last element, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var updateLast = function (a) { return (0, exports.modifyLast)(function () { return a; }); };
	exports.updateLast = updateLast;
	/**
	 * Places an element in between members of a `ReadonlyNonEmptyArray`, then folds the results using the provided `Semigroup`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { intercalate } from 'fp-ts/ReadonlyNonEmptyArray'
	 *
	 * assert.deepStrictEqual(intercalate(S.Semigroup)('-')(['a', 'b', 'c']), 'a-b-c')
	 *
	 * @since 2.12.0
	 */
	var intercalate = function (S) {
	    var concatAllS = (0, exports.concatAll)(S);
	    return function (middle) { return (0, function_1.flow)((0, exports.intersperse)(middle), concatAllS); };
	};
	exports.intercalate = intercalate;
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.5.0
	 */
	exports.chain = exports.flatMap;
	function groupSort(O) {
	    var sortO = (0, exports.sort)(O);
	    var groupO = group(O);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? groupO(sortO(as)) : exports.empty); };
	}
	exports.groupSort = groupSort;
	function filter(predicate) {
	    return (0, exports.filterWithIndex)(function (_, a) { return predicate(a); });
	}
	exports.filter = filter;
	/**
	 * Use [`filterWithIndex`](./ReadonlyArray.ts.html#filterwithindex) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	var filterWithIndex = function (predicate) {
	    return function (as) {
	        return (0, exports.fromReadonlyArray)(as.filter(function (a, i) { return predicate(i, a); }));
	    };
	};
	exports.filterWithIndex = filterWithIndex;
	/**
	 * Use [`unprepend`](#unprepend) instead.
	 *
	 * @category zone of death
	 * @since 2.10.0
	 * @deprecated
	 */
	exports.uncons = exports.unprepend;
	/**
	 * Use [`unappend`](#unappend) instead.
	 *
	 * @category zone of death
	 * @since 2.10.0
	 * @deprecated
	 */
	exports.unsnoc = exports.unappend;
	function cons(head, tail) {
	    return tail === undefined ? (0, exports.prepend)(head) : (0, function_1.pipe)(tail, (0, exports.prepend)(head));
	}
	exports.cons = cons;
	/**
	 * Use [`append`](./ReadonlyArray.ts.html#append) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	var snoc = function (init, end) { return (0, function_1.pipe)(init, concat([end])); };
	exports.snoc = snoc;
	/**
	 * Use [`insertAt`](./ReadonlyArray.ts.html#insertat) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	var insertAt = function (i, a) {
	    return function (as) {
	        return i < 0 || i > as.length ? _.none : _.some((0, exports.unsafeInsertAt)(i, a, as));
	    };
	};
	exports.insertAt = insertAt;
	/**
	 * Use [`prependAll`](#prependall) instead.
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.prependToAll = exports.prependAll;
	/**
	 * Use [`concatAll`](#concatall) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.fold = exports.concatAll;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `RNEA.Functor` instead of `RNEA.readonlyNonEmptyArray`
	 * (where `RNEA` is from `import RNEA from 'fp-ts/ReadonlyNonEmptyArray'`)
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.readonlyNonEmptyArray = {
	    URI: exports.URI,
	    of: exports.of,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    ap: _ap,
	    chain: exports.flatMap,
	    extend: _extend,
	    extract: exports.extract,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex,
	    alt: _alt
	}; 
} (ReadonlyNonEmptyArray));

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.endsWith = exports.startsWith = exports.includes = exports.split = exports.size = exports.isEmpty = exports.slice = exports.trimRight = exports.trimLeft = exports.trim = exports.replace = exports.toLowerCase = exports.toUpperCase = exports.isString = exports.Show = exports.Ord = exports.Monoid = exports.empty = exports.Semigroup = exports.Eq = void 0;
	var ReadonlyNonEmptyArray_1 = ReadonlyNonEmptyArray;
	// -------------------------------------------------------------------------------------
	// instances
	// -------------------------------------------------------------------------------------
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.Eq.equals('a', 'a'), true)
	 * assert.deepStrictEqual(S.Eq.equals('a', 'b'), false)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Eq = {
	    equals: function (first, second) { return first === second; }
	};
	/**
	 * `string` semigroup under concatenation.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.Semigroup.concat('a', 'b'), 'ab')
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Semigroup = {
	    concat: function (first, second) { return first + second; }
	};
	/**
	 * An empty `string`.
	 *
	 * @since 2.10.0
	 */
	exports.empty = '';
	/**
	 * `string` monoid under concatenation.
	 *
	 * The `empty` value is `''`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.Monoid.concat('a', 'b'), 'ab')
	 * assert.deepStrictEqual(S.Monoid.concat('a', S.Monoid.empty), 'a')
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Monoid = {
	    concat: exports.Semigroup.concat,
	    empty: exports.empty
	};
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.Ord.compare('a', 'a'), 0)
	 * assert.deepStrictEqual(S.Ord.compare('a', 'b'), -1)
	 * assert.deepStrictEqual(S.Ord.compare('b', 'a'), 1)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Ord = {
	    equals: exports.Eq.equals,
	    compare: function (first, second) { return (first < second ? -1 : first > second ? 1 : 0); }
	};
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.Show.show('a'), '"a"')
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Show = {
	    show: function (s) { return JSON.stringify(s); }
	};
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 *
	 * assert.deepStrictEqual(S.isString('a'), true)
	 * assert.deepStrictEqual(S.isString(1), false)
	 *
	 * @category refinements
	 * @since 2.11.0
	 */
	var isString = function (u) { return typeof u === 'string'; };
	exports.isString = isString;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('a', S.toUpperCase), 'A')
	 *
	 * @since 2.11.0
	 */
	var toUpperCase = function (s) { return s.toUpperCase(); };
	exports.toUpperCase = toUpperCase;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('A', S.toLowerCase), 'a')
	 *
	 * @since 2.11.0
	 */
	var toLowerCase = function (s) { return s.toLowerCase(); };
	exports.toLowerCase = toLowerCase;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.replace('b', 'd')), 'adc')
	 *
	 * @since 2.11.0
	 */
	var replace = function (searchValue, replaceValue) {
	    return function (s) {
	        return s.replace(searchValue, replaceValue);
	    };
	};
	exports.replace = replace;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(' a ', S.trim), 'a')
	 *
	 * @since 2.11.0
	 */
	var trim = function (s) { return s.trim(); };
	exports.trim = trim;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(' a ', S.trimLeft), 'a ')
	 *
	 * @since 2.11.0
	 */
	var trimLeft = function (s) { return s.trimLeft(); };
	exports.trimLeft = trimLeft;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(' a ', S.trimRight), ' a')
	 *
	 * @since 2.11.0
	 */
	var trimRight = function (s) { return s.trimRight(); };
	exports.trimRight = trimRight;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abcd', S.slice(1, 3)), 'bc')
	 *
	 * @since 2.11.0
	 */
	var slice = function (start, end) {
	    return function (s) {
	        return s.slice(start, end);
	    };
	};
	exports.slice = slice;
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * Test whether a `string` is empty.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('', S.isEmpty), true)
	 * assert.deepStrictEqual(pipe('a', S.isEmpty), false)
	 *
	 * @since 2.10.0
	 */
	var isEmpty = function (s) { return s.length === 0; };
	exports.isEmpty = isEmpty;
	/**
	 * Calculate the number of characters in a `string`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.size), 3)
	 *
	 * @since 2.10.0
	 */
	var size = function (s) { return s.length; };
	exports.size = size;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.split('')), ['a', 'b', 'c'])
	 * assert.deepStrictEqual(pipe('', S.split('')), [''])
	 *
	 * @since 2.11.0
	 */
	var split = function (separator) {
	    return function (s) {
	        var out = s.split(separator);
	        return (0, ReadonlyNonEmptyArray_1.isNonEmpty)(out) ? out : [s];
	    };
	};
	exports.split = split;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.includes('b')), true)
	 * assert.deepStrictEqual(pipe('abc', S.includes('d')), false)
	 *
	 * @since 2.11.0
	 */
	var includes = function (searchString, position) {
	    return function (s) {
	        return s.includes(searchString, position);
	    };
	};
	exports.includes = includes;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.startsWith('a')), true)
	 * assert.deepStrictEqual(pipe('bc', S.startsWith('a')), false)
	 *
	 * @since 2.11.0
	 */
	var startsWith = function (searchString, position) {
	    return function (s) {
	        return s.startsWith(searchString, position);
	    };
	};
	exports.startsWith = startsWith;
	/**
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe('abc', S.endsWith('c')), true)
	 * assert.deepStrictEqual(pipe('ab', S.endsWith('c')), false)
	 *
	 * @since 2.11.0
	 */
	var endsWith = function (searchString, position) {
	    return function (s) {
	        return s.endsWith(searchString, position);
	    };
	};
	exports.endsWith = endsWith; 
} (string));

fromNewtype(string$1);
const unContractId = iso().unwrap;
iso().wrap;
const idToTxId$2 = (contractId) => _function.pipe(contractId, unContractId, string.split('#'), ReadonlyNonEmptyArray.head);

fromNewtype(string$1);
const unTransactionId = iso().unwrap;
iso().wrap;
const idToTxId$1 = (transactionId) => _function.pipe(transactionId, unTransactionId);

fromNewtype(string$1);
const unWithdrawalId = iso().unwrap;
iso().wrap;
const idToTxId = (withdrawalId) => _function.pipe(withdrawalId, unWithdrawalId);

const TxOutRef = fromNewtype(string$1);
iso().unwrap;
iso().wrap;

// dnt-shim-ignore
const isNode = typeof window === "undefined";
if (isNode) {
    const fetch = await import(/* webpackIgnore: true */ './index-b519edce.js');
    const { Crypto } = await import(
    /* webpackIgnore: true */ './webcrypto.es-9963e3bd.js');
    const { WebSocket } = await import(
    /* webpackIgnore: true */ './browser-5b5d3616.js').then(function (n) { return n.b; });
    // @ts-ignore : global
    if (!global.WebSocket)
        global.WebSocket = WebSocket;
    // @ts-ignore : global
    if (!global.crypto)
        global.crypto = new Crypto();
    // @ts-ignore : global
    if (!global.fetch)
        global.fetch = fetch.default;
    // @ts-ignore : global
    if (!global.Headers)
        global.Headers = fetch.Headers;
    // @ts-ignore : global
    if (!global.Request)
        global.Request = fetch.Request;
    // @ts-ignore : global
    if (!global.Response)
        global.Response = fetch.Response;
}
async function importForEnvironmentCore() {
    try {
        if (isNode) {
            return (await import(
            /* webpackIgnore: true */
            './cardano_multiplatform_lib-399e245a.js').then(function (n) { return n.c; }));
        }
        const pkg = await import('./cardano_multiplatform_lib-230143bc.js');
        await pkg.default(await fetch(new URL("./wasm_modules/cardano_multiplatform_lib_web/cardano_multiplatform_lib_bg.wasm", import.meta.url)));
        return pkg;
    }
    catch (_e) {
        // This only ever happens during SSR rendering
        return null;
    }
}
async function importForEnvironmentMessage() {
    try {
        if (isNode) {
            return (await import(
            /* webpackIgnore: true */
            './cardano_message_signing-43ee123c.js').then(function (n) { return n.c; }));
        }
        const pkg = await import('./cardano_message_signing-8f5bf350.js');
        await pkg.default(await fetch(new URL("./wasm_modules/cardano_message_signing_web/cardano_message_signing_bg.wasm", import.meta.url)));
        return pkg;
    }
    catch (_e) {
        // This only ever happens during SSR rendering
        return null;
    }
}
await Promise.all([
    importForEnvironmentCore(),
    importForEnvironmentMessage(),
]);

// Ported from Go
// https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
new TextEncoder().encode("0123456789abcdef");

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
(undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
(undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};

const AddressBech32 = fromNewtype(string$1);
iso().unwrap;
iso().wrap;

type({ changeAddress: AddressBech32,
    usedAddresses: optionFromNullable(array(AddressBech32)),
    collateralUTxOs: optionFromNullable(array(TxOutRef))
});
const getAddressesAndCollaterals = (walletAPI) => _function.pipe(Task.Do, Task.bind('changeAddress', () => walletAPI.getChangeAddress), Task.bind('usedAddresses', () => walletAPI.getUsedAddresses), Task.bind('collateralUTxOs', () => walletAPI.getCollaterals), Task.map(({ changeAddress, usedAddresses, collateralUTxOs }) => ({ changeAddress: changeAddress,
    usedAddresses: usedAddresses.length == 0 ? Option.none : Option.some(usedAddresses),
    collateralUTxOs: collateralUTxOs.length == 0 ? Option.none : Option.some(collateralUTxOs) })));

const initialise = (client) => (wallet) => (payload) => _function.pipe(getAddressesAndCollaterals(wallet), TaskEither.fromTask, TaskEither.chain((addressesAndCollaterals) => client.contracts.post(({ contract: payload.contract,
    version: "v1",
    roles: payload.roles,
    tags: payload.tags ? payload.tags : {},
    metadata: payload.metadata ? payload.metadata : {},
    minUTxODeposit: payload.minUTxODeposit ? payload.minUTxODeposit : 3000000 }), addressesAndCollaterals)), TaskEither.chainW((contractTextEnvelope) => _function.pipe(wallet.signTxTheCIP30Way(contractTextEnvelope.tx.cborHex), TaskEither.chain((hexTransactionWitnessSet) => client.contracts.contract.put(contractTextEnvelope.contractId, hexTransactionWitnessSet)), TaskEither.map(() => contractTextEnvelope.contractId))), TaskEither.chainFirstW((contractId) => wallet.waitConfirmation(_function.pipe(contractId, idToTxId$2))));
const applyInputs = (client) => (wallet) => (contractId) => (payload) => _function.pipe(getAddressesAndCollaterals(wallet), TaskEither.fromTask, TaskEither.chain((addressesAndCollaterals) => client.contracts.contract.transactions.post(contractId, { inputs: payload.inputs,
    version: "v1",
    tags: payload.tags ? payload.tags : {},
    metadata: payload.metadata ? payload.metadata : {},
    invalidBefore: payload.invalidBefore,
    invalidHereafter: payload.invalidHereafter }, addressesAndCollaterals)), TaskEither.chainW((transactionTextEnvelope) => _function.pipe(wallet.signTxTheCIP30Way(transactionTextEnvelope.tx.cborHex), TaskEither.chain((hexTransactionWitnessSet) => client.contracts.contract.transactions.transaction.put(contractId, transactionTextEnvelope.transactionId, hexTransactionWitnessSet)), TaskEither.map(() => transactionTextEnvelope.transactionId))), TaskEither.chainFirstW((transactionId) => wallet.waitConfirmation(_function.pipe(transactionId, idToTxId$1))), TaskEither.map(() => contractId));
const withdraw = (client) => (wallet) => (payload) => _function.pipe(getAddressesAndCollaterals(wallet), TaskEither.fromTask, TaskEither.chain((addressesAndCollaterals) => client.withdrawals.post(payload, addressesAndCollaterals)), TaskEither.chainW((withdrawalTextEnvelope) => _function.pipe(wallet.signTxTheCIP30Way(withdrawalTextEnvelope.tx.cborHex), TaskEither.chain((hexTransactionWitnessSet) => client.withdrawals.withdrawal.put(withdrawalTextEnvelope.withdrawalId, hexTransactionWitnessSet)), TaskEither.map(() => withdrawalTextEnvelope.withdrawalId))), TaskEither.chainFirstW((withdrawalId) => wallet.waitConfirmation(_function.pipe(withdrawalId, idToTxId))), TaskEither.chainW((withdrawalId) => client.withdrawals.withdrawal.get(withdrawalId)));

var _Array = {};

var NonEmptyArray = {};

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mapWithIndex = exports.map = exports.flatten = exports.duplicate = exports.extend = exports.flatMap = exports.ap = exports.alt = exports.altW = exports.chunksOf = exports.splitAt = exports.chop = exports.chainWithIndex = exports.foldMap = exports.foldMapWithIndex = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = exports.of = exports.copy = exports.modifyAt = exports.updateAt = exports.insertAt = exports.sort = exports.groupBy = exports.group = exports.reverse = exports.concat = exports.concatW = exports.unappend = exports.unprepend = exports.range = exports.replicate = exports.makeBy = exports.fromArray = exports.fromReadonlyNonEmptyArray = exports.rotate = exports.union = exports.sortBy = exports.uniq = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.append = exports.appendW = exports.prepend = exports.prependW = exports.isOutOfBound = exports.isNonEmpty = void 0;
	exports.chain = exports.intercalate = exports.updateLast = exports.modifyLast = exports.updateHead = exports.modifyHead = exports.matchRight = exports.matchLeft = exports.concatAll = exports.max = exports.min = exports.init = exports.last = exports.tail = exports.head = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.chainFirst = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getUnionSemigroup = exports.getEq = exports.getSemigroup = exports.getShow = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = void 0;
	exports.nonEmptyArray = exports.fold = exports.prependToAll = exports.snoc = exports.cons = exports.unsnoc = exports.uncons = exports.filterWithIndex = exports.filter = exports.groupSort = void 0;
	var Apply_1 = Apply;
	var Chain_1 = Chain;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var Ord_1 = Ord;
	var RNEA = __importStar(ReadonlyNonEmptyArray);
	// -------------------------------------------------------------------------------------
	// internal
	// -------------------------------------------------------------------------------------
	/**
	 * @internal
	 */
	var isNonEmpty = function (as) { return as.length > 0; };
	exports.isNonEmpty = isNonEmpty;
	/**
	 * @internal
	 */
	var isOutOfBound = function (i, as) { return i < 0 || i >= as.length; };
	exports.isOutOfBound = isOutOfBound;
	/**
	 * @internal
	 */
	var prependW = function (head) {
	    return function (tail) {
	        return __spreadArray([head], tail, true);
	    };
	};
	exports.prependW = prependW;
	/**
	 * @internal
	 */
	exports.prepend = exports.prependW;
	/**
	 * @internal
	 */
	var appendW = function (end) {
	    return function (init) {
	        return __spreadArray(__spreadArray([], init, true), [end], false);
	    };
	};
	exports.appendW = appendW;
	/**
	 * @internal
	 */
	exports.append = exports.appendW;
	/**
	 * @internal
	 */
	var unsafeInsertAt = function (i, a, as) {
	    if ((0, exports.isNonEmpty)(as)) {
	        var xs = (0, exports.fromReadonlyNonEmptyArray)(as);
	        xs.splice(i, 0, a);
	        return xs;
	    }
	    return [a];
	};
	exports.unsafeInsertAt = unsafeInsertAt;
	/**
	 * @internal
	 */
	var unsafeUpdateAt = function (i, a, as) {
	    var xs = (0, exports.fromReadonlyNonEmptyArray)(as);
	    xs[i] = a;
	    return xs;
	};
	exports.unsafeUpdateAt = unsafeUpdateAt;
	/**
	 * Remove duplicates from a `NonEmptyArray`, keeping the first occurrence of an element.
	 *
	 * @example
	 * import { uniq } from 'fp-ts/NonEmptyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(uniq(N.Eq)([1, 2, 1]), [1, 2])
	 *
	 * @since 2.11.0
	 */
	var uniq = function (E) {
	    return function (as) {
	        if (as.length === 1) {
	            return (0, exports.copy)(as);
	        }
	        var out = [(0, exports.head)(as)];
	        var rest = (0, exports.tail)(as);
	        var _loop_1 = function (a) {
	            if (out.every(function (o) { return !E.equals(o, a); })) {
	                out.push(a);
	            }
	        };
	        for (var _i = 0, rest_1 = rest; _i < rest_1.length; _i++) {
	            var a = rest_1[_i];
	            _loop_1(a);
	        }
	        return out;
	    };
	};
	exports.uniq = uniq;
	/**
	 * Sort the elements of a `NonEmptyArray` in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
	 * etc...
	 *
	 * @example
	 * import * as NEA from 'fp-ts/NonEmptyArray'
	 * import { contramap } from 'fp-ts/Ord'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * interface Person {
	 *   name: string
	 *   age: number
	 * }
	 *
	 * const byName = pipe(S.Ord, contramap((p: Person) => p.name))
	 *
	 * const byAge = pipe(N.Ord, contramap((p: Person) => p.age))
	 *
	 * const sortByNameByAge = NEA.sortBy([byName, byAge])
	 *
	 * const persons: NEA.NonEmptyArray<Person> = [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 },
	 *   { name: 'b', age: 2 }
	 * ]
	 *
	 * assert.deepStrictEqual(sortByNameByAge(persons), [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 2 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 }
	 * ])
	 *
	 * @since 2.11.0
	 */
	var sortBy = function (ords) {
	    if ((0, exports.isNonEmpty)(ords)) {
	        var M = (0, Ord_1.getMonoid)();
	        return (0, exports.sort)(ords.reduce(M.concat, M.empty));
	    }
	    return exports.copy;
	};
	exports.sortBy = sortBy;
	/**
	 * @since 2.11.0
	 */
	var union = function (E) {
	    var uniqE = (0, exports.uniq)(E);
	    return function (second) { return function (first) { return uniqE((0, function_1.pipe)(first, concat(second))); }; };
	};
	exports.union = union;
	/**
	 * Rotate a `NonEmptyArray` by `n` steps.
	 *
	 * @example
	 * import { rotate } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
	 * assert.deepStrictEqual(rotate(-2)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])
	 *
	 * @since 2.11.0
	 */
	var rotate = function (n) {
	    return function (as) {
	        var len = as.length;
	        var m = Math.round(n) % len;
	        if ((0, exports.isOutOfBound)(Math.abs(m), as) || m === 0) {
	            return (0, exports.copy)(as);
	        }
	        if (m < 0) {
	            var _a = (0, exports.splitAt)(-m)(as), f = _a[0], s = _a[1];
	            return (0, function_1.pipe)(s, concat(f));
	        }
	        else {
	            return (0, exports.rotate)(m - len)(as);
	        }
	    };
	};
	exports.rotate = rotate;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * @category conversions
	 * @since 2.10.0
	 */
	exports.fromReadonlyNonEmptyArray = _.fromReadonlyNonEmptyArray;
	/**
	 * Builds a `NonEmptyArray` from an `Array` returning `none` if `as` is an empty array
	 *
	 * @category conversions
	 * @since 2.0.0
	 */
	var fromArray = function (as) { return ((0, exports.isNonEmpty)(as) ? _.some(as) : _.none); };
	exports.fromArray = fromArray;
	/**
	 * Return a `NonEmptyArray` of length `n` with element `i` initialized with `f(i)`.
	 *
	 * **Note**. `n` is normalized to a natural number.
	 *
	 * @example
	 * import { makeBy } from 'fp-ts/NonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const double = (n: number): number => n * 2
	 * assert.deepStrictEqual(pipe(5, makeBy(double)), [0, 2, 4, 6, 8])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var makeBy = function (f) {
	    return function (n) {
	        var j = Math.max(0, Math.floor(n));
	        var out = [f(0)];
	        for (var i = 1; i < j; i++) {
	            out.push(f(i));
	        }
	        return out;
	    };
	};
	exports.makeBy = makeBy;
	/**
	 * Create a `NonEmptyArray` containing a value repeated the specified number of times.
	 *
	 * **Note**. `n` is normalized to a natural number.
	 *
	 * @example
	 * import { replicate } from 'fp-ts/NonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(3, replicate('a')), ['a', 'a', 'a'])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var replicate = function (a) { return (0, exports.makeBy)(function () { return a; }); };
	exports.replicate = replicate;
	/**
	 * Create a `NonEmptyArray` containing a range of integers, including both endpoints.
	 *
	 * @example
	 * import { range } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
	 *
	 * @category constructors
	 * @since 2.11.0
	 */
	var range = function (start, end) {
	    return start <= end ? (0, exports.makeBy)(function (i) { return start + i; })(end - start + 1) : [start];
	};
	exports.range = range;
	/**
	 * Return the tuple of the `head` and the `tail`.
	 *
	 * @example
	 * import { unprepend } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(unprepend([1, 2, 3]), [1, [2, 3]])
	 *
	 * @since 2.9.0
	 */
	var unprepend = function (as) { return [(0, exports.head)(as), (0, exports.tail)(as)]; };
	exports.unprepend = unprepend;
	/**
	 * Return the tuple of the `init` and the `last`.
	 *
	 * @example
	 * import { unappend } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(unappend([1, 2, 3, 4]), [[1, 2, 3], 4])
	 *
	 * @since 2.9.0
	 */
	var unappend = function (as) { return [(0, exports.init)(as), (0, exports.last)(as)]; };
	exports.unappend = unappend;
	function concatW(second) {
	    return function (first) { return first.concat(second); };
	}
	exports.concatW = concatW;
	function concat(x, y) {
	    return y ? x.concat(y) : function (y) { return y.concat(x); };
	}
	exports.concat = concat;
	/**
	 * @since 2.0.0
	 */
	var reverse = function (as) { return __spreadArray([(0, exports.last)(as)], as.slice(0, -1).reverse(), true); };
	exports.reverse = reverse;
	function group(E) {
	    return function (as) {
	        var len = as.length;
	        if (len === 0) {
	            return [];
	        }
	        var out = [];
	        var head = as[0];
	        var nea = [head];
	        for (var i = 1; i < len; i++) {
	            var a = as[i];
	            if (E.equals(a, head)) {
	                nea.push(a);
	            }
	            else {
	                out.push(nea);
	                head = a;
	                nea = [head];
	            }
	        }
	        out.push(nea);
	        return out;
	    };
	}
	exports.group = group;
	/**
	 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
	 * function on each element, and grouping the results according to values returned
	 *
	 * @example
	 * import { groupBy } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['a', 'b', 'ab']), {
	 *   '1': ['a', 'b'],
	 *   '2': ['ab']
	 * })
	 *
	 * @since 2.0.0
	 */
	var groupBy = function (f) {
	    return function (as) {
	        var out = {};
	        for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
	            var a = as_1[_i];
	            var k = f(a);
	            if (_.has.call(out, k)) {
	                out[k].push(a);
	            }
	            else {
	                out[k] = [a];
	            }
	        }
	        return out;
	    };
	};
	exports.groupBy = groupBy;
	/**
	 * @since 2.0.0
	 */
	var sort = function (O) {
	    return function (as) {
	        return as.slice().sort(O.compare);
	    };
	};
	exports.sort = sort;
	/**
	 * @since 2.0.0
	 */
	var insertAt = function (i, a) {
	    return function (as) {
	        return i < 0 || i > as.length ? _.none : _.some((0, exports.unsafeInsertAt)(i, a, as));
	    };
	};
	exports.insertAt = insertAt;
	/**
	 * @since 2.0.0
	 */
	var updateAt = function (i, a) {
	    return (0, exports.modifyAt)(i, function () { return a; });
	};
	exports.updateAt = updateAt;
	/**
	 * @since 2.0.0
	 */
	var modifyAt = function (i, f) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeUpdateAt)(i, f(as[i]), as));
	    };
	};
	exports.modifyAt = modifyAt;
	/**
	 * @since 2.0.0
	 */
	exports.copy = exports.fromReadonlyNonEmptyArray;
	/**
	 * @category constructors
	 * @since 2.0.0
	 */
	var of = function (a) { return [a]; };
	exports.of = of;
	/**
	 * @since 2.5.1
	 */
	var zipWith = function (as, bs, f) {
	    var cs = [f(as[0], bs[0])];
	    var len = Math.min(as.length, bs.length);
	    for (var i = 1; i < len; i++) {
	        cs[i] = f(as[i], bs[i]);
	    }
	    return cs;
	};
	exports.zipWith = zipWith;
	function zip(as, bs) {
	    if (bs === undefined) {
	        return function (bs) { return zip(bs, as); };
	    }
	    return (0, exports.zipWith)(as, bs, function (a, b) { return [a, b]; });
	}
	exports.zip = zip;
	/**
	 * @since 2.5.1
	 */
	var unzip = function (abs) {
	    var fa = [abs[0][0]];
	    var fb = [abs[0][1]];
	    for (var i = 1; i < abs.length; i++) {
	        fa[i] = abs[i][0];
	        fb[i] = abs[i][1];
	    }
	    return [fa, fb];
	};
	exports.unzip = unzip;
	/**
	 * Prepend an element to every member of an array
	 *
	 * @example
	 * import { prependAll } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(prependAll(9)([1, 2, 3, 4]), [9, 1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.10.0
	 */
	var prependAll = function (middle) {
	    return function (as) {
	        var out = [middle, as[0]];
	        for (var i = 1; i < as.length; i++) {
	            out.push(middle, as[i]);
	        }
	        return out;
	    };
	};
	exports.prependAll = prependAll;
	/**
	 * Places an element in between members of an array
	 *
	 * @example
	 * import { intersperse } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(intersperse(9)([1, 2, 3, 4]), [1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.9.0
	 */
	var intersperse = function (middle) {
	    return function (as) {
	        var rest = (0, exports.tail)(as);
	        return (0, exports.isNonEmpty)(rest) ? (0, function_1.pipe)(rest, (0, exports.prependAll)(middle), (0, exports.prepend)((0, exports.head)(as))) : (0, exports.copy)(as);
	    };
	};
	exports.intersperse = intersperse;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.foldMapWithIndex = RNEA.foldMapWithIndex;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.foldMap = RNEA.foldMap;
	/**
	 * @category sequencing
	 * @since 2.10.0
	 */
	var chainWithIndex = function (f) {
	    return function (as) {
	        var out = (0, exports.fromReadonlyNonEmptyArray)(f(0, (0, exports.head)(as)));
	        for (var i = 1; i < as.length; i++) {
	            out.push.apply(out, f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.chainWithIndex = chainWithIndex;
	/**
	 * @since 2.10.0
	 */
	var chop = function (f) {
	    return function (as) {
	        var _a = f(as), b = _a[0], rest = _a[1];
	        var out = [b];
	        var next = rest;
	        while ((0, exports.isNonEmpty)(next)) {
	            var _b = f(next), b_1 = _b[0], rest_2 = _b[1];
	            out.push(b_1);
	            next = rest_2;
	        }
	        return out;
	    };
	};
	exports.chop = chop;
	/**
	 * Splits a `NonEmptyArray` into two pieces, the first piece has max `n` elements.
	 *
	 * @since 2.10.0
	 */
	var splitAt = function (n) {
	    return function (as) {
	        var m = Math.max(1, n);
	        return m >= as.length ? [(0, exports.copy)(as), []] : [(0, function_1.pipe)(as.slice(1, m), (0, exports.prepend)((0, exports.head)(as))), as.slice(m)];
	    };
	};
	exports.splitAt = splitAt;
	/**
	 * @since 2.10.0
	 */
	var chunksOf = function (n) { return (0, exports.chop)((0, exports.splitAt)(n)); };
	exports.chunksOf = chunksOf;
	/* istanbul ignore next */
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	/* istanbul ignore next */
	var _mapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapWithIndex)(f)); };
	/* istanbul ignore next */
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	/* istanbul ignore next */
	var _extend = function (wa, f) { return (0, function_1.pipe)(wa, (0, exports.extend)(f)); };
	/* istanbul ignore next */
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	/* istanbul ignore next */
	var _foldMap = function (M) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	/* istanbul ignore next */
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	/* istanbul ignore next */
	var _reduceWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _foldMapWithIndex = function (M) {
	    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapWithIndexM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRightWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _traverseWithIndex = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseWithIndexF(f)); };
	};
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @example
	 * import * as NEA from 'fp-ts/NonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3] as NEA.NonEmptyArray<number>,
	 *     NEA.altW(() => ['a', 'b'])
	 *   ),
	 *   [1, 2, 3, 'a', 'b']
	 * )
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	var altW = function (that) {
	    return function (as) {
	        return (0, function_1.pipe)(as, concatW(that()));
	    };
	};
	exports.altW = altW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `NonEmptyArray` concatenates the inputs into a single array.
	 *
	 * @example
	 * import * as NEA from 'fp-ts/NonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     NEA.alt(() => [4, 5])
	 *   ),
	 *   [1, 2, 3, 4, 5]
	 * )
	 *
	 * @category error handling
	 * @since 2.6.2
	 */
	exports.alt = exports.altW;
	/**
	 * Apply a function to an argument under a type constructor.
	 *
	 * @since 2.0.0
	 */
	var ap = function (as) {
	    return (0, exports.flatMap)(function (f) { return (0, function_1.pipe)(as, (0, exports.map)(f)); });
	};
	exports.ap = ap;
	/**
	 * @example
	 * import * as NEA from 'fp-ts/NonEmptyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     NEA.flatMap((n) => [`a${n}`, `b${n}`])
	 *   ),
	 *   ['a1', 'b1', 'a2', 'b2', 'a3', 'b3']
	 * )
	 *
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) {
	    return (0, function_1.pipe)(ma, (0, exports.chainWithIndex)(function (i, a) { return f(a, i); }));
	});
	/**
	 * @since 2.0.0
	 */
	var extend = function (f) {
	    return function (as) {
	        var next = (0, exports.tail)(as);
	        var out = [f(as)];
	        while ((0, exports.isNonEmpty)(next)) {
	            out.push(f(next));
	            next = (0, exports.tail)(next);
	        }
	        return out;
	    };
	};
	exports.extend = extend;
	/**
	 * @since 2.5.0
	 */
	exports.duplicate = (0, exports.extend)(function_1.identity);
	/**
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.flatten = (0, exports.flatMap)(function_1.identity);
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	var map = function (f) { return (0, exports.mapWithIndex)(function (_, a) { return f(a); }); };
	exports.map = map;
	/**
	 * @category mapping
	 * @since 2.0.0
	 */
	var mapWithIndex = function (f) {
	    return function (as) {
	        var out = [f(0, (0, exports.head)(as))];
	        for (var i = 1; i < as.length; i++) {
	            out.push(f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.mapWithIndex = mapWithIndex;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduce = RNEA.reduce;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceWithIndex = RNEA.reduceWithIndex;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceRight = RNEA.reduceRight;
	/**
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceRightWithIndex = RNEA.reduceRightWithIndex;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
	};
	exports.traverse = traverse;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) { return (0, exports.traverseWithIndex)(F)(function (_, a) { return a; }); };
	exports.sequence = sequence;
	/**
	 * @category sequencing
	 * @since 2.6.3
	 */
	var traverseWithIndex = function (F) {
	    return function (f) {
	        return function (as) {
	            var out = F.map(f(0, (0, exports.head)(as)), exports.of);
	            for (var i = 1; i < as.length; i++) {
	                out = F.ap(F.map(out, function (bs) { return function (b) { return (0, function_1.pipe)(bs, (0, exports.append)(b)); }; }), f(i, as[i]));
	            }
	            return out;
	        };
	    };
	};
	exports.traverseWithIndex = traverseWithIndex;
	/**
	 * @since 2.7.0
	 */
	exports.extract = RNEA.head;
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'NonEmptyArray';
	/**
	 * @category instances
	 * @since 2.0.0
	 */
	exports.getShow = RNEA.getShow;
	/**
	 * Builds a `Semigroup` instance for `NonEmptyArray`
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getSemigroup = function () { return ({
	    concat: concat
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * @example
	 * import { getEq } from 'fp-ts/NonEmptyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * const E = getEq(N.Eq)
	 * assert.strictEqual(E.equals([1, 2], [1, 2]), true)
	 * assert.strictEqual(E.equals([1, 2], [1, 3]), false)
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	exports.getEq = RNEA.getEq;
	/**
	 * @since 2.11.0
	 */
	var getUnionSemigroup = function (E) {
	    var unionE = (0, exports.union)(E);
	    return {
	        concat: function (first, second) { return unionE(second)(first); }
	    };
	};
	exports.getUnionSemigroup = getUnionSemigroup;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FunctorWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.5.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.5.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.chainFirst = 
	/*#__PURE__*/ (0, Chain_1.chainFirst)(exports.Chain);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FoldableWithIndex = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.TraversableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Comonad = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend,
	    extract: exports.extract
	};
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = (0, Chain_1.bind)(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * @since 2.0.0
	 */
	exports.head = RNEA.head;
	/**
	 * @since 2.0.0
	 */
	var tail = function (as) { return as.slice(1); };
	exports.tail = tail;
	/**
	 * @since 2.0.0
	 */
	exports.last = RNEA.last;
	/**
	 * Get all but the last element of a non empty array, creating a new array.
	 *
	 * @example
	 * import { init } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
	 * assert.deepStrictEqual(init([1]), [])
	 *
	 * @since 2.2.0
	 */
	var init = function (as) { return as.slice(0, -1); };
	exports.init = init;
	/**
	 * @since 2.0.0
	 */
	exports.min = RNEA.min;
	/**
	 * @since 2.0.0
	 */
	exports.max = RNEA.max;
	/**
	 * @since 2.10.0
	 */
	var concatAll = function (S) {
	    return function (as) {
	        return as.reduce(S.concat);
	    };
	};
	exports.concatAll = concatAll;
	/**
	 * Break an `Array` into its first element and remaining elements.
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchLeft = function (f) {
	    return function (as) {
	        return f((0, exports.head)(as), (0, exports.tail)(as));
	    };
	};
	exports.matchLeft = matchLeft;
	/**
	 * Break an `Array` into its initial elements and the last element.
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchRight = function (f) {
	    return function (as) {
	        return f((0, exports.init)(as), (0, exports.last)(as));
	    };
	};
	exports.matchRight = matchRight;
	/**
	 * Apply a function to the head, creating a new `NonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var modifyHead = function (f) {
	    return function (as) {
	        return __spreadArray([f((0, exports.head)(as))], (0, exports.tail)(as), true);
	    };
	};
	exports.modifyHead = modifyHead;
	/**
	 * Change the head, creating a new `NonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var updateHead = function (a) { return (0, exports.modifyHead)(function () { return a; }); };
	exports.updateHead = updateHead;
	/**
	 * Apply a function to the last element, creating a new `NonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var modifyLast = function (f) {
	    return function (as) {
	        return (0, function_1.pipe)((0, exports.init)(as), (0, exports.append)(f((0, exports.last)(as))));
	    };
	};
	exports.modifyLast = modifyLast;
	/**
	 * Change the last element, creating a new `NonEmptyArray`.
	 *
	 * @since 2.11.0
	 */
	var updateLast = function (a) { return (0, exports.modifyLast)(function () { return a; }); };
	exports.updateLast = updateLast;
	/**
	 * Places an element in between members of a `NonEmptyArray`, then folds the results using the provided `Semigroup`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { intercalate } from 'fp-ts/NonEmptyArray'
	 *
	 * assert.deepStrictEqual(intercalate(S.Semigroup)('-')(['a', 'b', 'c']), 'a-b-c')
	 *
	 * @since 2.12.0
	 */
	exports.intercalate = RNEA.intercalate;
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	function groupSort(O) {
	    var sortO = (0, exports.sort)(O);
	    var groupO = group(O);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? groupO(sortO(as)) : []); };
	}
	exports.groupSort = groupSort;
	function filter(predicate) {
	    return (0, exports.filterWithIndex)(function (_, a) { return predicate(a); });
	}
	exports.filter = filter;
	/**
	 * Use [`filterWithIndex`](./Array.ts.html#filterwithindex) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var filterWithIndex = function (predicate) {
	    return function (as) {
	        return (0, exports.fromArray)(as.filter(function (a, i) { return predicate(i, a); }));
	    };
	};
	exports.filterWithIndex = filterWithIndex;
	/**
	 * Use [`unprepend`](#unprepend) instead.
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.uncons = exports.unprepend;
	/**
	 * Use [`unappend`](#unappend) instead.
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.unsnoc = exports.unappend;
	function cons(head, tail) {
	    return tail === undefined ? (0, exports.prepend)(head) : (0, function_1.pipe)(tail, (0, exports.prepend)(head));
	}
	exports.cons = cons;
	/**
	 * Use [`append`](./Array.ts.html#append) instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	var snoc = function (init, end) { return (0, function_1.pipe)(init, (0, exports.append)(end)); };
	exports.snoc = snoc;
	/**
	 * Use [`prependAll`](#prependall) instead.
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.prependToAll = exports.prependAll;
	/**
	 * Use [`concatAll`](#concatall) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.fold = RNEA.concatAll;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `NEA.Functor` instead of `NEA.nonEmptyArray`
	 * (where `NEA` is from `import NEA from 'fp-ts/NonEmptyArray'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.nonEmptyArray = {
	    URI: exports.URI,
	    of: exports.of,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    ap: _ap,
	    chain: exports.flatMap,
	    extend: _extend,
	    extract: exports.extract,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex,
	    alt: _alt
	}; 
} (NonEmptyArray));

var ReadonlyArray = {};

var number = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Field = exports.MonoidProduct = exports.MonoidSum = exports.SemigroupProduct = exports.SemigroupSum = exports.MagmaSub = exports.Show = exports.Bounded = exports.Ord = exports.Eq = exports.isNumber = void 0;
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * @category refinements
	 * @since 2.11.0
	 */
	var isNumber = function (u) { return typeof u === 'number'; };
	exports.isNumber = isNumber;
	// -------------------------------------------------------------------------------------
	// instances
	// -------------------------------------------------------------------------------------
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Eq = {
	    equals: function (first, second) { return first === second; }
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Ord = {
	    equals: exports.Eq.equals,
	    compare: function (first, second) { return (first < second ? -1 : first > second ? 1 : 0); }
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Bounded = {
	    equals: exports.Eq.equals,
	    compare: exports.Ord.compare,
	    top: Infinity,
	    bottom: -Infinity
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Show = {
	    show: function (n) { return JSON.stringify(n); }
	};
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.MagmaSub = {
	    concat: function (first, second) { return first - second; }
	};
	/**
	 * `number` semigroup under addition.
	 *
	 * @example
	 * import { SemigroupSum } from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(SemigroupSum.concat(2, 3), 5)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.SemigroupSum = {
	    concat: function (first, second) { return first + second; }
	};
	/**
	 * `number` semigroup under multiplication.
	 *
	 * @example
	 * import { SemigroupProduct } from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(SemigroupProduct.concat(2, 3), 6)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.SemigroupProduct = {
	    concat: function (first, second) { return first * second; }
	};
	/**
	 * `number` monoid under addition.
	 *
	 * The `empty` value is `0`.
	 *
	 * @example
	 * import { MonoidSum } from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(MonoidSum.concat(2, MonoidSum.empty), 2)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonoidSum = {
	    concat: exports.SemigroupSum.concat,
	    empty: 0
	};
	/**
	 * `number` monoid under multiplication.
	 *
	 * The `empty` value is `1`.
	 *
	 * @example
	 * import { MonoidProduct } from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(MonoidProduct.concat(2, MonoidProduct.empty), 2)
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	exports.MonoidProduct = {
	    concat: exports.SemigroupProduct.concat,
	    empty: 1
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Field = {
	    add: exports.SemigroupSum.concat,
	    zero: 0,
	    mul: exports.SemigroupProduct.concat,
	    one: 1,
	    sub: exports.MagmaSub.concat,
	    degree: function (_) { return 1; },
	    div: function (first, second) { return first / second; },
	    mod: function (first, second) { return first % second; }
	}; 
} (number));

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sort = exports.lefts = exports.rights = exports.reverse = exports.modifyAt = exports.deleteAt = exports.updateAt = exports.insertAt = exports.findLastIndex = exports.findLastMap = exports.findLast = exports.findFirstMap = exports.findFirst = exports.findIndex = exports.dropLeftWhile = exports.dropRight = exports.dropLeft = exports.spanLeft = exports.takeLeftWhile = exports.takeRight = exports.takeLeft = exports.init = exports.tail = exports.last = exports.head = exports.lookup = exports.isOutOfBound = exports.size = exports.scanRight = exports.scanLeft = exports.chainWithIndex = exports.foldRight = exports.matchRight = exports.matchRightW = exports.foldLeft = exports.matchLeft = exports.matchLeftW = exports.match = exports.matchW = exports.fromEither = exports.fromOption = exports.fromPredicate = exports.replicate = exports.makeBy = exports.appendW = exports.append = exports.prependW = exports.prepend = exports.isNonEmpty = exports.isEmpty = void 0;
	exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.foldMap = exports.reduce = exports.foldMapWithIndex = exports.duplicate = exports.extend = exports.filterWithIndex = exports.partitionMapWithIndex = exports.partitionMap = exports.partitionWithIndex = exports.partition = exports.compact = exports.filterMap = exports.filterMapWithIndex = exports.filter = exports.separate = exports.mapWithIndex = exports.map = exports.flatten = exports.flatMap = exports.ap = exports.alt = exports.altW = exports.zero = exports.of = exports._chainRecBreadthFirst = exports._chainRecDepthFirst = exports.difference = exports.intersection = exports.union = exports.concat = exports.concatW = exports.comprehension = exports.fromOptionK = exports.chunksOf = exports.splitAt = exports.chop = exports.sortBy = exports.uniq = exports.elem = exports.rotate = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = void 0;
	exports.toArray = exports.unsafeDeleteAt = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.fromEitherK = exports.FromEither = exports.filterE = exports.Witherable = exports.ChainRecBreadthFirst = exports.chainRecBreadthFirst = exports.ChainRecDepthFirst = exports.chainRecDepthFirst = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.guard = exports.Zero = exports.Alt = exports.Unfoldable = exports.chainFirst = exports.Monad = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getDifferenceMagma = exports.getIntersectionSemigroup = exports.getUnionMonoid = exports.getUnionSemigroup = exports.getOrd = exports.getEq = exports.getMonoid = exports.getSemigroup = exports.getShow = exports.URI = exports.unfold = exports.wilt = exports.wither = exports.traverseWithIndex = void 0;
	exports.readonlyArray = exports.prependToAll = exports.snoc = exports.cons = exports.range = exports.chain = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.intercalate = exports.exists = exports.some = exports.every = exports.empty = exports.fromArray = void 0;
	var Apply_1 = Apply;
	var Chain_1 = Chain;
	var Eq_1 = Eq;
	var FromEither_1 = FromEither;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var N = __importStar(number);
	var Ord_1 = Ord;
	var RNEA = __importStar(ReadonlyNonEmptyArray);
	var Separated_1 = Separated;
	var Witherable_1 = Witherable;
	var Zero_1 = Zero;
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * Test whether a `ReadonlyArray` is empty.
	 *
	 * @example
	 * import { isEmpty } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.strictEqual(isEmpty([]), true)
	 *
	 * @category refinements
	 * @since 2.5.0
	 */
	var isEmpty = function (as) { return as.length === 0; };
	exports.isEmpty = isEmpty;
	/**
	 * Test whether a `ReadonlyArray` is non empty.
	 *
	 * @category refinements
	 * @since 2.5.0
	 */
	exports.isNonEmpty = RNEA.isNonEmpty;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * Prepend an element to the front of a `ReadonlyArray`, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @example
	 * import { prepend } from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([2, 3, 4], prepend(1)), [1, 2, 3, 4])
	 *
	 * @since 2.10.0
	 */
	exports.prepend = RNEA.prepend;
	/**
	 * Less strict version of [`prepend`](#prepend).
	 *
	 * @since 2.11.0
	 */
	exports.prependW = RNEA.prependW;
	/**
	 * Append an element to the end of a `ReadonlyArray`, creating a new `ReadonlyNonEmptyArray`.
	 *
	 * @example
	 * import { append } from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([1, 2, 3], append(4)), [1, 2, 3, 4])
	 *
	 * @since 2.10.0
	 */
	exports.append = RNEA.append;
	/**
	 * Less strict version of [`append`](#append).
	 *
	 * @since 2.11.0
	 */
	exports.appendW = RNEA.appendW;
	/**
	 * Return a `ReadonlyArray` of length `n` with element `i` initialized with `f(i)`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { makeBy } from 'fp-ts/ReadonlyArray'
	 *
	 * const double = (n: number): number => n * 2
	 * assert.deepStrictEqual(makeBy(5, double), [0, 2, 4, 6, 8])
	 *
	 * @category constructors
	 * @since 2.5.0
	 */
	var makeBy = function (n, f) { return (n <= 0 ? exports.empty : RNEA.makeBy(f)(n)); };
	exports.makeBy = makeBy;
	/**
	 * Create a `ReadonlyArray` containing a value repeated the specified number of times.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { replicate } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(replicate(3, 'a'), ['a', 'a', 'a'])
	 *
	 * @category constructors
	 * @since 2.5.0
	 */
	var replicate = function (n, a) { return (0, exports.makeBy)(n, function () { return a; }); };
	exports.replicate = replicate;
	function fromPredicate(predicate) {
	    return function (a) { return (predicate(a) ? [a] : exports.empty); };
	}
	exports.fromPredicate = fromPredicate;
	// -------------------------------------------------------------------------------------
	// conversions
	// -------------------------------------------------------------------------------------
	/**
	 * @category conversions
	 * @since 2.11.0
	 */
	var fromOption = function (ma) { return (_.isNone(ma) ? exports.empty : [ma.value]); };
	exports.fromOption = fromOption;
	/**
	 * Transforms an `Either` to a `ReadonlyArray`.
	 *
	 * @category conversions
	 * @since 2.11.0
	 */
	var fromEither = function (e) { return (_.isLeft(e) ? exports.empty : [e.right]); };
	exports.fromEither = fromEither;
	/**
	 * Less strict version of [`match`](#match).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(as) : onEmpty();
	    };
	};
	exports.matchW = matchW;
	/**
	 * @category pattern matching
	 * @since 2.11.0
	 */
	exports.match = exports.matchW;
	/**
	 * Less strict version of [`matchLeft`](#matchleft).
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchLeftW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(RNEA.head(as), RNEA.tail(as)) : onEmpty();
	    };
	};
	exports.matchLeftW = matchLeftW;
	/**
	 * Break a `ReadonlyArray` into its first element and remaining elements.
	 *
	 * @example
	 * import { matchLeft } from 'fp-ts/ReadonlyArray'
	 *
	 * const len: <A>(as: ReadonlyArray<A>) => number = matchLeft(() => 0, (_, tail) => 1 + len(tail))
	 * assert.strictEqual(len([1, 2, 3]), 3)
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchLeft = exports.matchLeftW;
	/**
	 * Alias of [`matchLeft`](#matchleft).
	 *
	 * @category pattern matching
	 * @since 2.5.0
	 */
	exports.foldLeft = exports.matchLeft;
	/**
	 * Less strict version of [`matchRight`](#matchright).
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchRightW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(RNEA.init(as), RNEA.last(as)) : onEmpty();
	    };
	};
	exports.matchRightW = matchRightW;
	/**
	 * Break a `ReadonlyArray` into its initial elements and the last element.
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchRight = exports.matchRightW;
	/**
	 * Alias of [`matchRight`](#matchright).
	 *
	 * @category pattern matching
	 * @since 2.5.0
	 */
	exports.foldRight = exports.matchRight;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * @category sequencing
	 * @since 2.7.0
	 */
	var chainWithIndex = function (f) {
	    return function (as) {
	        if ((0, exports.isEmpty)(as)) {
	            return exports.empty;
	        }
	        var out = [];
	        for (var i = 0; i < as.length; i++) {
	            out.push.apply(out, f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.chainWithIndex = chainWithIndex;
	/**
	 * Same as `reduce` but it carries over the intermediate steps.
	 *
	 * @example
	 * import { scanLeft } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(scanLeft(10, (b, a: number) => b - a)([1, 2, 3]), [10, 9, 7, 4])
	 *
	 * @since 2.5.0
	 */
	var scanLeft = function (b, f) {
	    return function (as) {
	        var len = as.length;
	        var out = new Array(len + 1);
	        out[0] = b;
	        for (var i = 0; i < len; i++) {
	            out[i + 1] = f(out[i], as[i]);
	        }
	        return out;
	    };
	};
	exports.scanLeft = scanLeft;
	/**
	 * Fold an array from the right, keeping all intermediate results instead of only the final result
	 *
	 * @example
	 * import { scanRight } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(scanRight(10, (a: number, b) => b - a)([1, 2, 3]), [4, 5, 7, 10])
	 *
	 * @since 2.5.0
	 */
	var scanRight = function (b, f) {
	    return function (as) {
	        var len = as.length;
	        var out = new Array(len + 1);
	        out[len] = b;
	        for (var i = len - 1; i >= 0; i--) {
	            out[i] = f(as[i], out[i + 1]);
	        }
	        return out;
	    };
	};
	exports.scanRight = scanRight;
	/**
	 * Calculate the number of elements in a `ReadonlyArray`.
	 *
	 * @since 2.10.0
	 */
	var size = function (as) { return as.length; };
	exports.size = size;
	/**
	 * Test whether an array contains a particular index
	 *
	 * @since 2.5.0
	 */
	exports.isOutOfBound = RNEA.isOutOfBound;
	function lookup(i, as) {
	    return as === undefined ? function (as) { return lookup(i, as); } : (0, exports.isOutOfBound)(i, as) ? _.none : _.some(as[i]);
	}
	exports.lookup = lookup;
	/**
	 * Get the first element in an array, or `None` if the array is empty
	 *
	 * @example
	 * import { head } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(head([1, 2, 3]), some(1))
	 * assert.deepStrictEqual(head([]), none)
	 *
	 * @since 2.5.0
	 */
	var head = function (as) { return ((0, exports.isNonEmpty)(as) ? _.some(RNEA.head(as)) : _.none); };
	exports.head = head;
	/**
	 * Get the last element in an array, or `None` if the array is empty
	 *
	 * @example
	 * import { last } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(last([1, 2, 3]), some(3))
	 * assert.deepStrictEqual(last([]), none)
	 *
	 * @since 2.5.0
	 */
	var last = function (as) { return ((0, exports.isNonEmpty)(as) ? _.some(RNEA.last(as)) : _.none); };
	exports.last = last;
	/**
	 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
	 *
	 * @example
	 * import { tail } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(tail([1, 2, 3]), some([2, 3]))
	 * assert.deepStrictEqual(tail([]), none)
	 *
	 * @since 2.5.0
	 */
	var tail = function (as) {
	    return (0, exports.isNonEmpty)(as) ? _.some(RNEA.tail(as)) : _.none;
	};
	exports.tail = tail;
	/**
	 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
	 *
	 * @example
	 * import { init } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(init([1, 2, 3]), some([1, 2]))
	 * assert.deepStrictEqual(init([]), none)
	 *
	 * @since 2.5.0
	 */
	var init = function (as) {
	    return (0, exports.isNonEmpty)(as) ? _.some(RNEA.init(as)) : _.none;
	};
	exports.init = init;
	/**
	 * Keep only a max number of elements from the start of an `ReadonlyArray`, creating a new `ReadonlyArray`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const input: ReadonlyArray<number> = [1, 2, 3]
	 * assert.deepStrictEqual(pipe(input, RA.takeLeft(2)), [1, 2])
	 *
	 * // out of bounds
	 * assert.strictEqual(pipe(input, RA.takeLeft(4)), input)
	 * assert.strictEqual(pipe(input, RA.takeLeft(-1)), input)
	 *
	 * @since 2.5.0
	 */
	var takeLeft = function (n) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(n, as) ? as : n === 0 ? exports.empty : as.slice(0, n);
	    };
	};
	exports.takeLeft = takeLeft;
	/**
	 * Keep only a max number of elements from the end of an `ReadonlyArray`, creating a new `ReadonlyArray`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const input: ReadonlyArray<number> = [1, 2, 3]
	 * assert.deepStrictEqual(pipe(input, RA.takeRight(2)), [2, 3])
	 *
	 * // out of bounds
	 * assert.strictEqual(pipe(input, RA.takeRight(4)), input)
	 * assert.strictEqual(pipe(input, RA.takeRight(-1)), input)
	 *
	 * @since 2.5.0
	 */
	var takeRight = function (n) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(n, as) ? as : n === 0 ? exports.empty : as.slice(-n);
	    };
	};
	exports.takeRight = takeRight;
	function takeLeftWhile(predicate) {
	    return function (as) {
	        var out = [];
	        for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
	            var a = as_1[_i];
	            if (!predicate(a)) {
	                break;
	            }
	            out.push(a);
	        }
	        var len = out.length;
	        return len === as.length ? as : len === 0 ? exports.empty : out;
	    };
	}
	exports.takeLeftWhile = takeLeftWhile;
	var spanLeftIndex = function (as, predicate) {
	    var l = as.length;
	    var i = 0;
	    for (; i < l; i++) {
	        if (!predicate(as[i])) {
	            break;
	        }
	    }
	    return i;
	};
	function spanLeft(predicate) {
	    return function (as) {
	        var _a = (0, exports.splitAt)(spanLeftIndex(as, predicate))(as), init = _a[0], rest = _a[1];
	        return { init: init, rest: rest };
	    };
	}
	exports.spanLeft = spanLeft;
	/**
	 * Drop a max number of elements from the start of an `ReadonlyArray`, creating a new `ReadonlyArray`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const input: ReadonlyArray<number> = [1, 2, 3]
	 * assert.deepStrictEqual(pipe(input, RA.dropLeft(2)), [3])
	 * assert.strictEqual(pipe(input, RA.dropLeft(0)), input)
	 * assert.strictEqual(pipe(input, RA.dropLeft(-1)), input)
	 *
	 * @since 2.5.0
	 */
	var dropLeft = function (n) {
	    return function (as) {
	        return n <= 0 || (0, exports.isEmpty)(as) ? as : n >= as.length ? exports.empty : as.slice(n, as.length);
	    };
	};
	exports.dropLeft = dropLeft;
	/**
	 * Drop a max number of elements from the end of an `ReadonlyArray`, creating a new `ReadonlyArray`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const input: ReadonlyArray<number> = [1, 2, 3]
	 * assert.deepStrictEqual(pipe(input, RA.dropRight(2)), [1])
	 * assert.strictEqual(pipe(input, RA.dropRight(0)), input)
	 * assert.strictEqual(pipe(input, RA.dropRight(-1)), input)
	 *
	 * @since 2.5.0
	 */
	var dropRight = function (n) {
	    return function (as) {
	        return n <= 0 || (0, exports.isEmpty)(as) ? as : n >= as.length ? exports.empty : as.slice(0, as.length - n);
	    };
	};
	exports.dropRight = dropRight;
	function dropLeftWhile(predicate) {
	    return function (as) {
	        var i = spanLeftIndex(as, predicate);
	        return i === 0 ? as : i === as.length ? exports.empty : as.slice(i);
	    };
	}
	exports.dropLeftWhile = dropLeftWhile;
	/**
	 * Find the first index for which a predicate holds
	 *
	 * @example
	 * import { findIndex } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
	 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
	 *
	 * @since 2.5.0
	 */
	var findIndex = function (predicate) {
	    return function (as) {
	        for (var i = 0; i < as.length; i++) {
	            if (predicate(as[i])) {
	                return _.some(i);
	            }
	        }
	        return _.none;
	    };
	};
	exports.findIndex = findIndex;
	function findFirst(predicate) {
	    return function (as) {
	        for (var i = 0; i < as.length; i++) {
	            if (predicate(as[i])) {
	                return _.some(as[i]);
	            }
	        }
	        return _.none;
	    };
	}
	exports.findFirst = findFirst;
	/**
	 * Find the first element returned by an option based selector function
	 *
	 * @example
	 * import { findFirstMap } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface Person {
	 *   readonly name: string
	 *   readonly age?: number
	 * }
	 *
	 * const persons: ReadonlyArray<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
	 *
	 * // returns the name of the first person that has an age
	 * assert.deepStrictEqual(findFirstMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Mary'))
	 *
	 * @since 2.5.0
	 */
	var findFirstMap = function (f) {
	    return function (as) {
	        for (var i = 0; i < as.length; i++) {
	            var out = f(as[i]);
	            if (_.isSome(out)) {
	                return out;
	            }
	        }
	        return _.none;
	    };
	};
	exports.findFirstMap = findFirstMap;
	function findLast(predicate) {
	    return function (as) {
	        for (var i = as.length - 1; i >= 0; i--) {
	            if (predicate(as[i])) {
	                return _.some(as[i]);
	            }
	        }
	        return _.none;
	    };
	}
	exports.findLast = findLast;
	/**
	 * Find the last element returned by an option based selector function
	 *
	 * @example
	 * import { findLastMap } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface Person {
	 *   readonly name: string
	 *   readonly age?: number
	 * }
	 *
	 * const persons: ReadonlyArray<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
	 *
	 * // returns the name of the last person that has an age
	 * assert.deepStrictEqual(findLastMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Joey'))
	 *
	 * @since 2.5.0
	 */
	var findLastMap = function (f) {
	    return function (as) {
	        for (var i = as.length - 1; i >= 0; i--) {
	            var out = f(as[i]);
	            if (_.isSome(out)) {
	                return out;
	            }
	        }
	        return _.none;
	    };
	};
	exports.findLastMap = findLastMap;
	/**
	 * Returns the index of the last element of the list which matches the predicate
	 *
	 * @example
	 * import { findLastIndex } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface X {
	 *   readonly a: number
	 *   readonly b: number
	 * }
	 * const xs: ReadonlyArray<X> = [{ a: 1, b: 0 }, { a: 1, b: 1 }]
	 * assert.deepStrictEqual(findLastIndex((x: { readonly a: number }) => x.a === 1)(xs), some(1))
	 * assert.deepStrictEqual(findLastIndex((x: { readonly a: number }) => x.a === 4)(xs), none)
	 *
	 *
	 * @since 2.5.0
	 */
	var findLastIndex = function (predicate) {
	    return function (as) {
	        for (var i = as.length - 1; i >= 0; i--) {
	            if (predicate(as[i])) {
	                return _.some(i);
	            }
	        }
	        return _.none;
	    };
	};
	exports.findLastIndex = findLastIndex;
	/**
	 * Insert an element at the specified index, creating a new array, or returning `None` if the index is out of bounds
	 *
	 * @example
	 * import { insertAt } from 'fp-ts/ReadonlyArray'
	 * import { some } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(insertAt(2, 5)([1, 2, 3, 4]), some([1, 2, 5, 3, 4]))
	 *
	 * @since 2.5.0
	 */
	var insertAt = function (i, a) {
	    return function (as) {
	        return i < 0 || i > as.length ? _.none : _.some(RNEA.unsafeInsertAt(i, a, as));
	    };
	};
	exports.insertAt = insertAt;
	/**
	 * Change the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
	 *
	 * @example
	 * import { updateAt } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(updateAt(1, 1)([1, 2, 3]), some([1, 1, 3]))
	 * assert.deepStrictEqual(updateAt(1, 1)([]), none)
	 *
	 * @since 2.5.0
	 */
	var updateAt = function (i, a) {
	    return (0, exports.modifyAt)(i, function () { return a; });
	};
	exports.updateAt = updateAt;
	/**
	 * Delete the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
	 *
	 * @example
	 * import { deleteAt } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(deleteAt(0)([1, 2, 3]), some([2, 3]))
	 * assert.deepStrictEqual(deleteAt(1)([]), none)
	 *
	 * @since 2.5.0
	 */
	var deleteAt = function (i) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeDeleteAt)(i, as));
	    };
	};
	exports.deleteAt = deleteAt;
	/**
	 * Apply a function to the element at the specified index, creating a new array, or returning `None` if the index is out
	 * of bounds
	 *
	 * @example
	 * import { modifyAt } from 'fp-ts/ReadonlyArray'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * const double = (x: number): number => x * 2
	 * assert.deepStrictEqual(modifyAt(1, double)([1, 2, 3]), some([1, 4, 3]))
	 * assert.deepStrictEqual(modifyAt(1, double)([]), none)
	 *
	 * @since 2.5.0
	 */
	var modifyAt = function (i, f) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeUpdateAt)(i, f(as[i]), as));
	    };
	};
	exports.modifyAt = modifyAt;
	/**
	 * Reverse an array, creating a new array
	 *
	 * @example
	 * import { reverse } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(reverse([1, 2, 3]), [3, 2, 1])
	 *
	 * @since 2.5.0
	 */
	var reverse = function (as) { return (as.length <= 1 ? as : as.slice().reverse()); };
	exports.reverse = reverse;
	/**
	 * Extracts from an array of `Either` all the `Right` elements. All the `Right` elements are extracted in order
	 *
	 * @example
	 * import { rights } from 'fp-ts/ReadonlyArray'
	 * import { right, left } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(rights([right(1), left('foo'), right(2)]), [1, 2])
	 *
	 * @since 2.5.0
	 */
	var rights = function (as) {
	    var r = [];
	    for (var i = 0; i < as.length; i++) {
	        var a = as[i];
	        if (a._tag === 'Right') {
	            r.push(a.right);
	        }
	    }
	    return r;
	};
	exports.rights = rights;
	/**
	 * Extracts from an array of `Either` all the `Left` elements. All the `Left` elements are extracted in order
	 *
	 * @example
	 * import { lefts } from 'fp-ts/ReadonlyArray'
	 * import { left, right } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(lefts([right(1), left('foo'), right(2)]), ['foo'])
	 *
	 * @since 2.5.0
	 */
	var lefts = function (as) {
	    var r = [];
	    for (var i = 0; i < as.length; i++) {
	        var a = as[i];
	        if (a._tag === 'Left') {
	            r.push(a.left);
	        }
	    }
	    return r;
	};
	exports.lefts = lefts;
	/**
	 * Sort the elements of an array in increasing order, creating a new array
	 *
	 * @example
	 * import { sort } from 'fp-ts/ReadonlyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(sort(N.Ord)([3, 2, 1]), [1, 2, 3])
	 *
	 * @since 2.5.0
	 */
	var sort = function (O) {
	    return function (as) {
	        return as.length <= 1 ? as : as.slice().sort(O.compare);
	    };
	};
	exports.sort = sort;
	// TODO: curry and make data-last in v3
	/**
	 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
	 * input array is short, excess elements of the longer array are discarded.
	 *
	 * @example
	 * import { zipWith } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(zipWith([1, 2, 3], ['a', 'b', 'c', 'd'], (n, s) => s + n), ['a1', 'b2', 'c3'])
	 *
	 * @since 2.5.0
	 */
	var zipWith = function (fa, fb, f) {
	    var fc = [];
	    var len = Math.min(fa.length, fb.length);
	    for (var i = 0; i < len; i++) {
	        fc[i] = f(fa[i], fb[i]);
	    }
	    return fc;
	};
	exports.zipWith = zipWith;
	function zip(as, bs) {
	    if (bs === undefined) {
	        return function (bs) { return zip(bs, as); };
	    }
	    return (0, exports.zipWith)(as, bs, function (a, b) { return [a, b]; });
	}
	exports.zip = zip;
	/**
	 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays
	 *
	 * @example
	 * import { unzip } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(unzip([[1, 'a'], [2, 'b'], [3, 'c']]), [[1, 2, 3], ['a', 'b', 'c']])
	 *
	 * @since 2.5.0
	 */
	var unzip = function (as) {
	    var fa = [];
	    var fb = [];
	    for (var i = 0; i < as.length; i++) {
	        fa[i] = as[i][0];
	        fb[i] = as[i][1];
	    }
	    return [fa, fb];
	};
	exports.unzip = unzip;
	/**
	 * Prepend an element to every member of an array
	 *
	 * @example
	 * import { prependAll } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(prependAll(9)([1, 2, 3, 4]), [9, 1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.10.0
	 */
	var prependAll = function (middle) {
	    var f = RNEA.prependAll(middle);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : as); };
	};
	exports.prependAll = prependAll;
	/**
	 * Places an element in between members of an array
	 *
	 * @example
	 * import { intersperse } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(intersperse(9)([1, 2, 3, 4]), [1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.9.0
	 */
	var intersperse = function (middle) {
	    var f = RNEA.intersperse(middle);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : as); };
	};
	exports.intersperse = intersperse;
	/**
	 * Rotate a `ReadonlyArray` by `n` steps.
	 *
	 * @example
	 * import { rotate } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
	 *
	 * @since 2.5.0
	 */
	var rotate = function (n) {
	    var f = RNEA.rotate(n);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : as); };
	};
	exports.rotate = rotate;
	function elem(E) {
	    return function (a, as) {
	        if (as === undefined) {
	            var elemE_1 = elem(E);
	            return function (as) { return elemE_1(a, as); };
	        }
	        var predicate = function (element) { return E.equals(element, a); };
	        var i = 0;
	        for (; i < as.length; i++) {
	            if (predicate(as[i])) {
	                return true;
	            }
	        }
	        return false;
	    };
	}
	exports.elem = elem;
	/**
	 * Remove duplicates from an array, keeping the first occurrence of an element.
	 *
	 * @example
	 * import { uniq } from 'fp-ts/ReadonlyArray'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(uniq(N.Eq)([1, 2, 1]), [1, 2])
	 *
	 * @since 2.5.0
	 */
	var uniq = function (E) {
	    var f = RNEA.uniq(E);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : as); };
	};
	exports.uniq = uniq;
	/**
	 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
	 * etc...
	 *
	 * @example
	 * import { sortBy } from 'fp-ts/ReadonlyArray'
	 * import { contramap } from 'fp-ts/Ord'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * interface Person {
	 *   readonly name: string
	 *   readonly age: number
	 * }
	 * const byName = pipe(S.Ord, contramap((p: Person) => p.name))
	 * const byAge = pipe(N.Ord, contramap((p: Person) => p.age))
	 *
	 * const sortByNameByAge = sortBy([byName, byAge])
	 *
	 * const persons = [{ name: 'a', age: 1 }, { name: 'b', age: 3 }, { name: 'c', age: 2 }, { name: 'b', age: 2 }]
	 * assert.deepStrictEqual(sortByNameByAge(persons), [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 2 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 }
	 * ])
	 *
	 * @since 2.5.0
	 */
	var sortBy = function (ords) {
	    var f = RNEA.sortBy(ords);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : as); };
	};
	exports.sortBy = sortBy;
	/**
	 * A useful recursion pattern for processing a `ReadonlyArray` to produce a new `ReadonlyArray`, often used for "chopping" up the input
	 * `ReadonlyArray`. Typically `chop` is called with some function that will consume an initial prefix of the `ReadonlyArray` and produce a
	 * value and the tail of the `ReadonlyArray`.
	 *
	 * @example
	 * import { Eq } from 'fp-ts/Eq'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const group = <A>(S: Eq<A>): ((as: ReadonlyArray<A>) => ReadonlyArray<ReadonlyArray<A>>) => {
	 *   return RA.chop(as => {
	 *     const { init, rest } = pipe(as, RA.spanLeft((a: A) => S.equals(a, as[0])))
	 *     return [init, rest]
	 *   })
	 * }
	 * assert.deepStrictEqual(group(N.Eq)([1, 1, 2, 3, 3, 4]), [[1, 1], [2], [3, 3], [4]])
	 *
	 * @since 2.5.0
	 */
	var chop = function (f) {
	    var g = RNEA.chop(f);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? g(as) : exports.empty); };
	};
	exports.chop = chop;
	/**
	 * Splits a `ReadonlyArray` into two pieces, the first piece has max `n` elements.
	 *
	 * @example
	 * import { splitAt } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(splitAt(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4, 5]])
	 *
	 * @since 2.5.0
	 */
	var splitAt = function (n) {
	    return function (as) {
	        return n >= 1 && (0, exports.isNonEmpty)(as) ? RNEA.splitAt(n)(as) : (0, exports.isEmpty)(as) ? [as, exports.empty] : [exports.empty, as];
	    };
	};
	exports.splitAt = splitAt;
	/**
	 * Splits a `ReadonlyArray` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
	 * the `ReadonlyArray`. Note that `chunksOf(n)([])` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
	 * definition of `chunksOf`; it satisfies the property that:
	 *
	 * ```ts
	 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
	 * ```
	 *
	 * whenever `n` evenly divides the length of `as`.
	 *
	 * @example
	 * import { chunksOf } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
	 *
	 * @since 2.5.0
	 */
	var chunksOf = function (n) {
	    var f = RNEA.chunksOf(n);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : exports.empty); };
	};
	exports.chunksOf = chunksOf;
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	var fromOptionK = function (f) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return (0, exports.fromOption)(f.apply(void 0, a));
	    };
	};
	exports.fromOptionK = fromOptionK;
	function comprehension(input, f, g) {
	    if (g === void 0) { g = function () { return true; }; }
	    var go = function (scope, input) {
	        return (0, exports.isNonEmpty)(input)
	            ? (0, exports.flatMap)(RNEA.head(input), function (a) { return go((0, function_1.pipe)(scope, (0, exports.append)(a)), RNEA.tail(input)); })
	            : g.apply(void 0, scope) ? [f.apply(void 0, scope)]
	                : exports.empty;
	    };
	    return go(exports.empty, input);
	}
	exports.comprehension = comprehension;
	/**
	 * @since 2.11.0
	 */
	var concatW = function (second) {
	    return function (first) {
	        return (0, exports.isEmpty)(first) ? second : (0, exports.isEmpty)(second) ? first : first.concat(second);
	    };
	};
	exports.concatW = concatW;
	/**
	 * @since 2.11.0
	 */
	exports.concat = exports.concatW;
	function union(E) {
	    var unionE = RNEA.union(E);
	    return function (first, second) {
	        if (second === undefined) {
	            var unionE_1 = union(E);
	            return function (second) { return unionE_1(second, first); };
	        }
	        return (0, exports.isNonEmpty)(first) && (0, exports.isNonEmpty)(second) ? unionE(second)(first) : (0, exports.isNonEmpty)(first) ? first : second;
	    };
	}
	exports.union = union;
	function intersection(E) {
	    var elemE = elem(E);
	    return function (xs, ys) {
	        if (ys === undefined) {
	            var intersectionE_1 = intersection(E);
	            return function (ys) { return intersectionE_1(ys, xs); };
	        }
	        return xs.filter(function (a) { return elemE(a, ys); });
	    };
	}
	exports.intersection = intersection;
	function difference(E) {
	    var elemE = elem(E);
	    return function (xs, ys) {
	        if (ys === undefined) {
	            var differenceE_1 = difference(E);
	            return function (ys) { return differenceE_1(ys, xs); };
	        }
	        return xs.filter(function (a) { return !elemE(a, ys); });
	    };
	}
	exports.difference = difference;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	var _mapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapWithIndex)(f)); };
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	var _filter = function (fa, predicate) {
	    return (0, function_1.pipe)(fa, (0, exports.filter)(predicate));
	};
	var _filterMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.filterMap)(f)); };
	var _partition = function (fa, predicate) {
	    return (0, function_1.pipe)(fa, (0, exports.partition)(predicate));
	};
	var _partitionMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.partitionMap)(f)); };
	var _partitionWithIndex = function (fa, predicateWithIndex) { return (0, function_1.pipe)(fa, (0, exports.partitionWithIndex)(predicateWithIndex)); };
	var _partitionMapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.partitionMapWithIndex)(f)); };
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	var _foldMap = function (M) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapM(f)); };
	};
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	var _reduceWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
	};
	var _foldMapWithIndex = function (M) {
	    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapWithIndexM(f)); };
	};
	var _reduceRightWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
	};
	var _filterMapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.filterMapWithIndex)(f)); };
	var _filterWithIndex = function (fa, predicateWithIndex) { return (0, function_1.pipe)(fa, (0, exports.filterWithIndex)(predicateWithIndex)); };
	var _extend = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.extend)(f)); };
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	/* istanbul ignore next */
	var _traverseWithIndex = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseWithIndexF(f)); };
	};
	/** @internal */
	var _chainRecDepthFirst = function (a, f) { return (0, function_1.pipe)(a, (0, exports.chainRecDepthFirst)(f)); };
	exports._chainRecDepthFirst = _chainRecDepthFirst;
	/** @internal */
	var _chainRecBreadthFirst = function (a, f) { return (0, function_1.pipe)(a, (0, exports.chainRecBreadthFirst)(f)); };
	exports._chainRecBreadthFirst = _chainRecBreadthFirst;
	/**
	 * @category constructors
	 * @since 2.5.0
	 */
	exports.of = RNEA.of;
	/**
	 * @since 2.7.0
	 */
	var zero = function () { return exports.empty; };
	exports.zero = zero;
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.altW(() => ['a', 'b'])
	 *   ),
	 *   [1, 2, 3, 'a', 'b']
	 * )
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	var altW = function (that) {
	    return function (fa) {
	        return fa.concat(that());
	    };
	};
	exports.altW = altW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `ReadonlyArray` concatenates the inputs into a single array.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.alt(() => [4, 5])
	 *   ),
	 *   [1, 2, 3, 4, 5]
	 * )
	 *
	 * @category error handling
	 * @since 2.5.0
	 */
	exports.alt = exports.altW;
	/**
	 * @since 2.5.0
	 */
	var ap = function (fa) {
	    return (0, exports.flatMap)(function (f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); });
	};
	exports.ap = ap;
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.flatMap((n) => [`a${n}`, `b${n}`])
	 *   ),
	 *   ['a1', 'b1', 'a2', 'b2', 'a3', 'b3']
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.flatMap(() => [])
	 *   ),
	 *   []
	 * )
	 *
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) {
	    return (0, function_1.pipe)(ma, (0, exports.chainWithIndex)(function (i, a) { return f(a, i); }));
	});
	/**
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.flatten = (0, exports.flatMap)(function_1.identity);
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
	 * use the type constructor `F` to represent some computational context.
	 *
	 * @category mapping
	 * @since 2.5.0
	 */
	var map = function (f) { return function (fa) {
	    return fa.map(function (a) { return f(a); });
	}; };
	exports.map = map;
	/**
	 * @category mapping
	 * @since 2.5.0
	 */
	var mapWithIndex = function (f) { return function (fa) {
	    return fa.map(function (a, i) { return f(i, a); });
	}; };
	exports.mapWithIndex = mapWithIndex;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var separate = function (fa) {
	    var left = [];
	    var right = [];
	    for (var _i = 0, fa_1 = fa; _i < fa_1.length; _i++) {
	        var e = fa_1[_i];
	        if (e._tag === 'Left') {
	            left.push(e.left);
	        }
	        else {
	            right.push(e.right);
	        }
	    }
	    return (0, Separated_1.separated)(left, right);
	};
	exports.separate = separate;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var filter = function (predicate) {
	    return function (as) {
	        return as.filter(predicate);
	    };
	};
	exports.filter = filter;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var filterMapWithIndex = function (f) {
	    return function (fa) {
	        var out = [];
	        for (var i = 0; i < fa.length; i++) {
	            var optionB = f(i, fa[i]);
	            if (_.isSome(optionB)) {
	                out.push(optionB.value);
	            }
	        }
	        return out;
	    };
	};
	exports.filterMapWithIndex = filterMapWithIndex;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var filterMap = function (f) {
	    return (0, exports.filterMapWithIndex)(function (_, a) { return f(a); });
	};
	exports.filterMap = filterMap;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	exports.compact = (0, exports.filterMap)(function_1.identity);
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var partition = function (predicate) {
	    return (0, exports.partitionWithIndex)(function (_, a) { return predicate(a); });
	};
	exports.partition = partition;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var partitionWithIndex = function (predicateWithIndex) {
	    return function (as) {
	        var left = [];
	        var right = [];
	        for (var i = 0; i < as.length; i++) {
	            var a = as[i];
	            if (predicateWithIndex(i, a)) {
	                right.push(a);
	            }
	            else {
	                left.push(a);
	            }
	        }
	        return (0, Separated_1.separated)(left, right);
	    };
	};
	exports.partitionWithIndex = partitionWithIndex;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var partitionMap = function (f) {
	    return (0, exports.partitionMapWithIndex)(function (_, a) { return f(a); });
	};
	exports.partitionMap = partitionMap;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var partitionMapWithIndex = function (f) {
	    return function (fa) {
	        var left = [];
	        var right = [];
	        for (var i = 0; i < fa.length; i++) {
	            var e = f(i, fa[i]);
	            if (e._tag === 'Left') {
	                left.push(e.left);
	            }
	            else {
	                right.push(e.right);
	            }
	        }
	        return (0, Separated_1.separated)(left, right);
	    };
	};
	exports.partitionMapWithIndex = partitionMapWithIndex;
	/**
	 * @category filtering
	 * @since 2.5.0
	 */
	var filterWithIndex = function (predicateWithIndex) {
	    return function (as) {
	        return as.filter(function (a, i) { return predicateWithIndex(i, a); });
	    };
	};
	exports.filterWithIndex = filterWithIndex;
	/**
	 * @since 2.5.0
	 */
	var extend = function (f) { return function (wa) {
	    return wa.map(function (_, i) { return f(wa.slice(i)); });
	}; };
	exports.extend = extend;
	/**
	 * @since 2.5.0
	 */
	exports.duplicate = (0, exports.extend)(function_1.identity);
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var foldMapWithIndex = function (M) {
	    return function (f) {
	        return function (fa) {
	            return fa.reduce(function (b, a, i) { return M.concat(b, f(i, a)); }, M.empty);
	        };
	    };
	};
	exports.foldMapWithIndex = foldMapWithIndex;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduce = function (b, f) {
	    return (0, exports.reduceWithIndex)(b, function (_, b, a) { return f(b, a); });
	};
	exports.reduce = reduce;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var foldMap = function (M) {
	    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
	    return function (f) { return foldMapWithIndexM(function (_, a) { return f(a); }); };
	};
	exports.foldMap = foldMap;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceWithIndex = function (b, f) { return function (fa) {
	    var len = fa.length;
	    var out = b;
	    for (var i = 0; i < len; i++) {
	        out = f(i, out, fa[i]);
	    }
	    return out;
	}; };
	exports.reduceWithIndex = reduceWithIndex;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceRight = function (b, f) {
	    return (0, exports.reduceRightWithIndex)(b, function (_, a, b) { return f(a, b); });
	};
	exports.reduceRight = reduceRight;
	/**
	 * @category folding
	 * @since 2.5.0
	 */
	var reduceRightWithIndex = function (b, f) { return function (fa) {
	    return fa.reduceRight(function (b, a, i) { return f(i, a, b); }, b);
	}; };
	exports.reduceRightWithIndex = reduceRightWithIndex;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
	};
	exports.traverse = traverse;
	/**
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) {
	    return function (ta) {
	        return _reduce(ta, F.of((0, exports.zero)()), function (fas, fa) {
	            return F.ap(F.map(fas, function (as) { return function (a) { return (0, function_1.pipe)(as, (0, exports.append)(a)); }; }), fa);
	        });
	    };
	};
	exports.sequence = sequence;
	/**
	 * @category sequencing
	 * @since 2.6.3
	 */
	var traverseWithIndex = function (F) {
	    return function (f) {
	        return (0, exports.reduceWithIndex)(F.of((0, exports.zero)()), function (i, fbs, a) {
	            return F.ap(F.map(fbs, function (bs) { return function (b) { return (0, function_1.pipe)(bs, (0, exports.append)(b)); }; }), f(i, a));
	        });
	    };
	};
	exports.traverseWithIndex = traverseWithIndex;
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wither = function (F) {
	    var _witherF = _wither(F);
	    return function (f) { return function (fa) { return _witherF(fa, f); }; };
	};
	exports.wither = wither;
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wilt = function (F) {
	    var _wiltF = _wilt(F);
	    return function (f) { return function (fa) { return _wiltF(fa, f); }; };
	};
	exports.wilt = wilt;
	/**
	 * @since 2.6.6
	 */
	var unfold = function (b, f) {
	    var out = [];
	    var bb = b;
	    // eslint-disable-next-line no-constant-condition
	    while (true) {
	        var mt = f(bb);
	        if (_.isSome(mt)) {
	            var _a = mt.value, a = _a[0], b_1 = _a[1];
	            out.push(a);
	            bb = b_1;
	        }
	        else {
	            break;
	        }
	    }
	    return out;
	};
	exports.unfold = unfold;
	/**
	 * @category type lambdas
	 * @since 2.5.0
	 */
	exports.URI = 'ReadonlyArray';
	/**
	 * @category instances
	 * @since 2.5.0
	 */
	var getShow = function (S) { return ({
	    show: function (as) { return "[".concat(as.map(S.show).join(', '), "]"); }
	}); };
	exports.getShow = getShow;
	/**
	 * @category instances
	 * @since 2.5.0
	 */
	var getSemigroup = function () { return ({
	    concat: function (first, second) { return ((0, exports.isEmpty)(first) ? second : (0, exports.isEmpty)(second) ? first : first.concat(second)); }
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * Returns a `Monoid` for `ReadonlyArray<A>`.
	 *
	 * @example
	 * import { getMonoid } from 'fp-ts/ReadonlyArray'
	 *
	 * const M = getMonoid<number>()
	 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
	 *
	 * @category instances
	 * @since 2.5.0
	 */
	var getMonoid = function () { return ({
	    concat: (0, exports.getSemigroup)().concat,
	    empty: exports.empty
	}); };
	exports.getMonoid = getMonoid;
	/**
	 * Derives an `Eq` over the `ReadonlyArray` of a given element type from the `Eq` of that type. The derived `Eq` defines two
	 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
	 * different lengths, the result is non equality.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { getEq } from 'fp-ts/ReadonlyArray'
	 *
	 * const E = getEq(S.Eq)
	 * assert.strictEqual(E.equals(['a', 'b'], ['a', 'b']), true)
	 * assert.strictEqual(E.equals(['a'], []), false)
	 *
	 * @category instances
	 * @since 2.5.0
	 */
	var getEq = function (E) {
	    return (0, Eq_1.fromEquals)(function (xs, ys) { return xs.length === ys.length && xs.every(function (x, i) { return E.equals(x, ys[i]); }); });
	};
	exports.getEq = getEq;
	/**
	 * Derives an `Ord` over the `ReadonlyArray` of a given element type from the `Ord` of that type. The ordering between two such
	 * arrays is equal to: the first non equal comparison of each arrays elements taken pairwise in increasing order, in
	 * case of equality over all the pairwise elements; the longest array is considered the greatest, if both arrays have
	 * the same length, the result is equality.
	 *
	 * @example
	 * import { getOrd } from 'fp-ts/ReadonlyArray'
	 * import * as S from 'fp-ts/string'
	 *
	 * const O = getOrd(S.Ord)
	 * assert.strictEqual(O.compare(['b'], ['a']), 1)
	 * assert.strictEqual(O.compare(['a'], ['a']), 0)
	 * assert.strictEqual(O.compare(['a'], ['b']), -1)
	 *
	 *
	 * @category instances
	 * @since 2.5.0
	 */
	var getOrd = function (O) {
	    return (0, Ord_1.fromCompare)(function (a, b) {
	        var aLen = a.length;
	        var bLen = b.length;
	        var len = Math.min(aLen, bLen);
	        for (var i = 0; i < len; i++) {
	            var ordering = O.compare(a[i], b[i]);
	            if (ordering !== 0) {
	                return ordering;
	            }
	        }
	        return N.Ord.compare(aLen, bLen);
	    });
	};
	exports.getOrd = getOrd;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getUnionSemigroup = function (E) {
	    var unionE = union(E);
	    return {
	        concat: function (first, second) { return unionE(second)(first); }
	    };
	};
	exports.getUnionSemigroup = getUnionSemigroup;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getUnionMonoid = function (E) { return ({
	    concat: (0, exports.getUnionSemigroup)(E).concat,
	    empty: exports.empty
	}); };
	exports.getUnionMonoid = getUnionMonoid;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getIntersectionSemigroup = function (E) {
	    var intersectionE = intersection(E);
	    return {
	        concat: function (first, second) { return intersectionE(second)(first); }
	    };
	};
	exports.getIntersectionSemigroup = getIntersectionSemigroup;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	var getDifferenceMagma = function (E) {
	    var differenceE = difference(E);
	    return {
	        concat: function (first, second) { return differenceE(second)(first); }
	    };
	};
	exports.getDifferenceMagma = getDifferenceMagma;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FunctorWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.5.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.5.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.chainFirst(() => ['a', 'b'])
	 *   ),
	 *   [1, 1, 2, 2, 3, 3]
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     RA.chainFirst(() => [])
	 *   ),
	 *   []
	 * )
	 *
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.chainFirst = 
	/*#__PURE__*/ (0, Chain_1.chainFirst)(exports.Chain);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Unfoldable = {
	    URI: exports.URI,
	    unfold: exports.unfold
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.Zero = {
	    URI: exports.URI,
	    zero: exports.zero
	};
	/**
	 * @category do notation
	 * @since 2.11.0
	 */
	exports.guard = (0, Zero_1.guard)(exports.Zero, exports.Pointed);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alternative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    alt: _alt,
	    zero: exports.zero
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Extend = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Compactable = {
	    URI: exports.URI,
	    compact: exports.compact,
	    separate: exports.separate
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Filterable = {
	    URI: exports.URI,
	    map: _map,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FilterableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    partitionMapWithIndex: _partitionMapWithIndex,
	    partitionWithIndex: _partitionWithIndex,
	    filterMapWithIndex: _filterMapWithIndex,
	    filterWithIndex: _filterWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FoldableWithIndex = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.TraversableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    traverseWithIndex: _traverseWithIndex
	};
	/**
	 * @category sequencing
	 * @since 2.11.0
	 */
	var chainRecDepthFirst = function (f) {
	    return function (a) {
	        var todo = __spreadArray([], f(a), true);
	        var out = [];
	        while (todo.length > 0) {
	            var e = todo.shift();
	            if (_.isLeft(e)) {
	                todo.unshift.apply(todo, f(e.left));
	            }
	            else {
	                out.push(e.right);
	            }
	        }
	        return out;
	    };
	};
	exports.chainRecDepthFirst = chainRecDepthFirst;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.ChainRecDepthFirst = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap,
	    chainRec: exports._chainRecDepthFirst
	};
	/**
	 * @category sequencing
	 * @since 2.11.0
	 */
	var chainRecBreadthFirst = function (f) {
	    return function (a) {
	        var initial = f(a);
	        var todo = [];
	        var out = [];
	        function go(e) {
	            if (_.isLeft(e)) {
	                f(e.left).forEach(function (v) { return todo.push(v); });
	            }
	            else {
	                out.push(e.right);
	            }
	        }
	        for (var _i = 0, initial_1 = initial; _i < initial_1.length; _i++) {
	            var e = initial_1[_i];
	            go(e);
	        }
	        while (todo.length > 0) {
	            go(todo.shift());
	        }
	        return out;
	    };
	};
	exports.chainRecBreadthFirst = chainRecBreadthFirst;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.ChainRecBreadthFirst = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap,
	    chainRec: exports._chainRecBreadthFirst
	};
	var _wither = /*#__PURE__*/ (0, Witherable_1.witherDefault)(exports.Traversable, exports.Compactable);
	var _wilt = /*#__PURE__*/ (0, Witherable_1.wiltDefault)(exports.Traversable, exports.Compactable);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Witherable = {
	    URI: exports.URI,
	    map: _map,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    wither: _wither,
	    wilt: _wilt
	};
	/**
	 * Filter values inside a context.
	 *
	 * @example
	 * import { pipe } from 'fp-ts/function'
	 * import * as RA from 'fp-ts/ReadonlyArray'
	 * import * as T from 'fp-ts/Task'
	 *
	 * const filterE = RA.filterE(T.ApplicativePar)
	 * async function test() {
	 *   assert.deepStrictEqual(
	 *     await pipe(
	 *       [-1, 2, 3],
	 *       filterE((n) => T.of(n > 0))
	 *     )(),
	 *     [2, 3]
	 *   )
	 * }
	 * test()
	 *
	 * @since 2.11.0
	 */
	exports.filterE = (0, Witherable_1.filterE)(exports.Witherable);
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.FromEither = {
	    URI: exports.URI,
	    fromEither: exports.fromEither
	};
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	exports.fromEitherK = (0, FromEither_1.fromEitherK)(exports.FromEither);
	// -------------------------------------------------------------------------------------
	// unsafe
	// -------------------------------------------------------------------------------------
	/**
	 * @category unsafe
	 * @since 2.5.0
	 */
	exports.unsafeInsertAt = RNEA.unsafeInsertAt;
	/**
	 * @category unsafe
	 * @since 2.5.0
	 */
	var unsafeUpdateAt = function (i, a, as) {
	    return (0, exports.isNonEmpty)(as) ? RNEA.unsafeUpdateAt(i, a, as) : as;
	};
	exports.unsafeUpdateAt = unsafeUpdateAt;
	/**
	 * @category unsafe
	 * @since 2.5.0
	 */
	var unsafeDeleteAt = function (i, as) {
	    var xs = as.slice();
	    xs.splice(i, 1);
	    return xs;
	};
	exports.unsafeDeleteAt = unsafeDeleteAt;
	/**
	 * @category conversions
	 * @since 2.5.0
	 */
	var toArray = function (as) { return as.slice(); };
	exports.toArray = toArray;
	/**
	 * @category conversions
	 * @since 2.5.0
	 */
	var fromArray = function (as) { return ((0, exports.isEmpty)(as) ? exports.empty : as.slice()); };
	exports.fromArray = fromArray;
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * An empty array
	 *
	 * @since 2.5.0
	 */
	exports.empty = RNEA.empty;
	function every(predicate) {
	    return function (as) { return as.every(predicate); };
	}
	exports.every = every;
	/**
	 * Check if a predicate holds true for any array member.
	 *
	 * @example
	 * import { some } from 'fp-ts/ReadonlyArray'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const isPositive = (n: number): boolean => n > 0
	 *
	 * assert.deepStrictEqual(pipe([-1, -2, 3], some(isPositive)), true)
	 * assert.deepStrictEqual(pipe([-1, -2, -3], some(isPositive)), false)
	 *
	 * @since 2.9.0
	 */
	var some = function (predicate) {
	    return function (as) {
	        return as.some(predicate);
	    };
	};
	exports.some = some;
	/**
	 * Alias of [`some`](#some)
	 *
	 * @since 2.11.0
	 */
	exports.exists = exports.some;
	/**
	 * Places an element in between members of a `ReadonlyArray`, then folds the results using the provided `Monoid`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { intercalate } from 'fp-ts/ReadonlyArray'
	 *
	 * assert.deepStrictEqual(intercalate(S.Monoid)('-')(['a', 'b', 'c']), 'a-b-c')
	 *
	 * @since 2.12.0
	 */
	var intercalate = function (M) {
	    var intercalateM = RNEA.intercalate(M);
	    return function (middle) { return (0, exports.match)(function () { return M.empty; }, intercalateM(middle)); };
	};
	exports.intercalate = intercalate;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = (0, Chain_1.bind)(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.5.0
	 */
	exports.chain = exports.flatMap;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use `ReadonlyNonEmptyArray` module instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.range = RNEA.range;
	/**
	 * Use [`prepend`](#prepend) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.cons = RNEA.cons;
	/**
	 * Use [`append`](#append) instead.
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.snoc = RNEA.snoc;
	/**
	 * Use [`prependAll`](#prependall) instead.
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.prependToAll = exports.prependAll;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `RA.Functor` instead of `RA.readonlyArray`
	 * (where `RA` is from `import RA from 'fp-ts/ReadonlyArray'`)
	 *
	 * @category zone of death
	 * @since 2.5.0
	 * @deprecated
	 */
	exports.readonlyArray = {
	    URI: exports.URI,
	    compact: exports.compact,
	    separate: exports.separate,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    mapWithIndex: _mapWithIndex,
	    partitionMapWithIndex: _partitionMapWithIndex,
	    partitionWithIndex: _partitionWithIndex,
	    filterMapWithIndex: _filterMapWithIndex,
	    filterWithIndex: _filterWithIndex,
	    alt: _alt,
	    zero: exports.zero,
	    unfold: exports.unfold,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex,
	    extend: _extend,
	    wither: _wither,
	    wilt: _wilt
	}; 
} (ReadonlyArray));

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lefts = exports.rights = exports.reverse = exports.modifyAt = exports.deleteAt = exports.updateAt = exports.insertAt = exports.copy = exports.findLastIndex = exports.findLastMap = exports.findLast = exports.findFirstMap = exports.findFirst = exports.findIndex = exports.dropLeftWhile = exports.dropRight = exports.dropLeft = exports.spanLeft = exports.takeLeftWhile = exports.takeRight = exports.takeLeft = exports.init = exports.tail = exports.last = exports.head = exports.lookup = exports.isOutOfBound = exports.size = exports.scanRight = exports.scanLeft = exports.chainWithIndex = exports.foldRight = exports.matchRight = exports.matchRightW = exports.foldLeft = exports.matchLeft = exports.matchLeftW = exports.match = exports.matchW = exports.fromEither = exports.fromOption = exports.fromPredicate = exports.replicate = exports.makeBy = exports.appendW = exports.append = exports.prependW = exports.prepend = exports.isNonEmpty = exports.isEmpty = void 0;
	exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = exports.foldMapWithIndex = exports.foldMap = exports.duplicate = exports.extend = exports.filterWithIndex = exports.alt = exports.altW = exports.partitionMapWithIndex = exports.partitionMap = exports.partitionWithIndex = exports.partition = exports.filter = exports.separate = exports.compact = exports.filterMap = exports.filterMapWithIndex = exports.mapWithIndex = exports.flatten = exports.flatMap = exports.ap = exports.map = exports.zero = exports.of = exports.difference = exports.intersection = exports.union = exports.concat = exports.concatW = exports.comprehension = exports.fromOptionK = exports.chunksOf = exports.splitAt = exports.chop = exports.sortBy = exports.uniq = exports.elem = exports.rotate = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = exports.sort = void 0;
	exports.some = exports.every = exports.unsafeDeleteAt = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.fromEitherK = exports.FromEither = exports.filterE = exports.ChainRecBreadthFirst = exports.chainRecBreadthFirst = exports.ChainRecDepthFirst = exports.chainRecDepthFirst = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.guard = exports.Zero = exports.Alt = exports.Unfoldable = exports.Monad = exports.chainFirst = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getDifferenceMagma = exports.getIntersectionSemigroup = exports.getUnionMonoid = exports.getUnionSemigroup = exports.getOrd = exports.getEq = exports.getMonoid = exports.getSemigroup = exports.getShow = exports.URI = exports.unfold = exports.wilt = exports.wither = void 0;
	exports.array = exports.prependToAll = exports.snoc = exports.cons = exports.empty = exports.range = exports.chain = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.intercalate = exports.exists = void 0;
	var Apply_1 = Apply;
	var Chain_1 = Chain;
	var FromEither_1 = FromEither;
	var function_1 = _function;
	var Functor_1 = Functor;
	var _ = __importStar(internal);
	var NEA = __importStar(NonEmptyArray);
	var RA = __importStar(ReadonlyArray);
	var Separated_1 = Separated;
	var Witherable_1 = Witherable;
	var Zero_1 = Zero;
	// -------------------------------------------------------------------------------------
	// refinements
	// -------------------------------------------------------------------------------------
	/**
	 * Test whether an array is empty
	 *
	 * @example
	 * import { isEmpty } from 'fp-ts/Array'
	 *
	 * assert.strictEqual(isEmpty([]), true)
	 * assert.strictEqual(isEmpty(['a']), false)
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	var isEmpty = function (as) { return as.length === 0; };
	exports.isEmpty = isEmpty;
	/**
	 * Test whether an array is non empty narrowing down the type to `NonEmptyArray<A>`
	 *
	 * @example
	 * import { isNonEmpty } from 'fp-ts/Array'
	 *
	 * assert.strictEqual(isNonEmpty([]), false)
	 * assert.strictEqual(isNonEmpty(['a']), true)
	 *
	 * @category refinements
	 * @since 2.0.0
	 */
	exports.isNonEmpty = NEA.isNonEmpty;
	// -------------------------------------------------------------------------------------
	// constructors
	// -------------------------------------------------------------------------------------
	/**
	 * Prepend an element to the front of a `Array`, creating a new `NonEmptyArray`.
	 *
	 * @example
	 * import { prepend } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([2, 3, 4], prepend(1)), [1, 2, 3, 4])
	 *
	 * @since 2.10.0
	 */
	exports.prepend = NEA.prepend;
	/**
	 * Less strict version of [`prepend`](#prepend).
	 *
	 * @example
	 * import { prependW } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([2, 3, 4], prependW("a")), ["a", 2, 3, 4]);
	 *
	 * @since 2.11.0
	 */
	exports.prependW = NEA.prependW;
	/**
	 * Append an element to the end of a `Array`, creating a new `NonEmptyArray`.
	 *
	 * @example
	 * import { append } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([1, 2, 3], append(4)), [1, 2, 3, 4])
	 *
	 * @since 2.10.0
	 */
	exports.append = NEA.append;
	/**
	 * Less strict version of [`append`](#append).
	 *
	 * @example
	 * import { appendW } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([1, 2, 3], appendW("d")), [1, 2, 3, "d"]);
	 *
	 * @since 2.11.0
	 */
	exports.appendW = NEA.appendW;
	/**
	 * Return a `Array` of length `n` with element `i` initialized with `f(i)`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { makeBy } from 'fp-ts/Array'
	 *
	 * const double = (i: number): number => i * 2
	 * assert.deepStrictEqual(makeBy(5, double), [0, 2, 4, 6, 8])
	 * assert.deepStrictEqual(makeBy(-3, double), [])
	 * assert.deepStrictEqual(makeBy(4.32164, double), [0, 2, 4, 6])
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	var makeBy = function (n, f) { return (n <= 0 ? [] : NEA.makeBy(f)(n)); };
	exports.makeBy = makeBy;
	/**
	 * Create a `Array` containing a value repeated the specified number of times.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { replicate } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(replicate(3, 'a'), ['a', 'a', 'a'])
	 * assert.deepStrictEqual(replicate(-3, 'a'), [])
	 * assert.deepStrictEqual(replicate(2.985647, 'a'), ['a', 'a'])
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	var replicate = function (n, a) { return (0, exports.makeBy)(n, function () { return a; }); };
	exports.replicate = replicate;
	function fromPredicate(predicate) {
	    return function (a) { return (predicate(a) ? [a] : []); };
	}
	exports.fromPredicate = fromPredicate;
	// -------------------------------------------------------------------------------------
	// conversions
	// -------------------------------------------------------------------------------------
	/**
	 * Create an array from an `Option`. The resulting array will contain the content of the
	 * `Option` if it is `Some` and it will be empty if the `Option` is `None`.
	 *
	 * @example
	 * import { fromOption } from 'fp-ts/Array'
	 * import { option } from "fp-ts";
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(option.some("a"), fromOption),["a"])
	 * assert.deepStrictEqual(pipe(option.none, fromOption),[])
	 *
	 * @category conversions
	 * @since 2.11.0
	 */
	var fromOption = function (ma) { return (_.isNone(ma) ? [] : [ma.value]); };
	exports.fromOption = fromOption;
	/**
	 * Create an array from an `Either`. The resulting array will contain the content of the
	 * `Either` if it is `Right` and it will be empty if the `Either` is `Left`.
	 *
	 * @example
	 * import { fromEither } from 'fp-ts/Array'
	 * import { either } from "fp-ts";
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe(either.right("r"), fromEither), ["r"]);
	 * assert.deepStrictEqual(pipe(either.left("l"), fromEither), []);
	 *
	 * @category conversions
	 * @since 2.11.0
	 */
	var fromEither = function (e) { return (_.isLeft(e) ? [] : [e.right]); };
	exports.fromEither = fromEither;
	/**
	 * Less strict version of [`match`](#match).
	 *
	 * The `W` suffix (short for **W**idening) means that the handler return types will be merged.
	 *
	 * @example
	 * import { matchW } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const matcherW = matchW(
	 *   () => "No elements",
	 *   (as) => as.length
	 * );
	 * assert.deepStrictEqual(pipe([1, 2, 3, 4], matcherW), 4);
	 * assert.deepStrictEqual(pipe([], matcherW), "No elements");
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(as) : onEmpty();
	    };
	};
	exports.matchW = matchW;
	/**
	 * Takes an array, if the array is empty it returns the result of `onEmpty`, otherwise
	 * it passes the array to `onNonEmpty` and returns the result.
	 *
	 * @example
	 * import { match } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const matcher = match(
	 *   () => "No elements",
	 *   (as) => `Found ${as.length} element(s)`
	 * );
	 * assert.deepStrictEqual(pipe([1, 2, 3, 4], matcher), "Found 4 element(s)");
	 * assert.deepStrictEqual(pipe([], matcher), "No elements");
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	exports.match = exports.matchW;
	/**
	 * Less strict version of [`matchLeft`](#matchleft). It will work when `onEmpty` and
	 * `onNonEmpty` have different return types.
	 *
	 * @example
	 * import { matchLeftW } from 'fp-ts/Array'
	 *
	 * const f = matchLeftW(
	 *   () => 0,
	 *   (head: string, tail: string[]) => `Found "${head}" followed by ${tail.length} elements`
	 * );
	 * assert.strictEqual(f(["a", "b", "c"]), 'Found "a" followed by 2 elements');
	 * assert.strictEqual(f([]), 0);
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchLeftW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(NEA.head(as), NEA.tail(as)) : onEmpty();
	    };
	};
	exports.matchLeftW = matchLeftW;
	/**
	 * Takes an array, if the array is empty it returns the result of `onEmpty`, otherwise
	 * it passes the array to `onNonEmpty` broken into its first element and remaining elements.
	 *
	 * @example
	 * import { matchLeft } from 'fp-ts/Array'
	 *
	 * const len: <A>(as: Array<A>) => number = matchLeft(() => 0, (_, tail) => 1 + len(tail))
	 * assert.strictEqual(len([1, 2, 3]), 3)
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchLeft = exports.matchLeftW;
	/**
	 * Alias of [`matchLeft`](#matchleft).
	 *
	 * @category pattern matching
	 * @since 2.0.0
	 */
	exports.foldLeft = exports.matchLeft;
	/**
	 * Less strict version of [`matchRight`](#matchright). It will work when `onEmpty` and
	 * `onNonEmpty` have different return types.
	 *
	 * @example
	 * import { matchRightW } from 'fp-ts/Array'
	 *
	 * const f = matchRightW(
	 *   () => 0,
	 *   (head: string[], tail: string) => `Found ${head.length} elements folllowed by "${tail}"`
	 * );
	 * assert.strictEqual(f(["a", "b", "c"]), 'Found 2 elements folllowed by "c"');
	 * assert.strictEqual(f([]), 0);
	 *
	 * @category pattern matching
	 * @since 2.11.0
	 */
	var matchRightW = function (onEmpty, onNonEmpty) {
	    return function (as) {
	        return (0, exports.isNonEmpty)(as) ? onNonEmpty(NEA.init(as), NEA.last(as)) : onEmpty();
	    };
	};
	exports.matchRightW = matchRightW;
	/**
	 * Takes an array, if the array is empty it returns the result of `onEmpty`, otherwise
	 * it passes the array to `onNonEmpty` broken  into its initial elements and the last element.
	 *
	 * @example
	 * import { matchRight } from 'fp-ts/Array'
	 *
	 * const len: <A>(as: Array<A>) => number = matchRight(
	 *   () => 0,
	 *   (head, _) => 1 + len(head)
	 * );
	 * assert.strictEqual(len([1, 2, 3]), 3);
	 *
	 * @category pattern matching
	 * @since 2.10.0
	 */
	exports.matchRight = exports.matchRightW;
	/**
	 * Alias of [`matchRight`](#matchright).
	 *
	 * @category pattern matching
	 * @since 2.0.0
	 */
	exports.foldRight = exports.matchRight;
	// -------------------------------------------------------------------------------------
	// combinators
	// -------------------------------------------------------------------------------------
	/**
	 * Same as [`chain`](#chain), but passing also the index to the iterating function.
	 *
	 * @example
	 * import { chainWithIndex, replicate } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const f = (index: number, x: string) => replicate(2, `${x}${index}`);
	 * assert.deepStrictEqual(pipe(["a", "b", "c"], chainWithIndex(f)), ["a0", "a0", "b1", "b1", "c2", "c2"]);
	 *
	 * @category sequencing
	 * @since 2.7.0
	 */
	var chainWithIndex = function (f) {
	    return function (as) {
	        var out = [];
	        for (var i = 0; i < as.length; i++) {
	            out.push.apply(out, f(i, as[i]));
	        }
	        return out;
	    };
	};
	exports.chainWithIndex = chainWithIndex;
	/**
	 * Same as `reduce` but it carries over the intermediate steps
	 *
	 * @example
	 * import { scanLeft } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(scanLeft(10, (b, a: number) => b - a)([1, 2, 3]), [10, 9, 7, 4])
	 *
	 * @since 2.0.0
	 */
	var scanLeft = function (b, f) {
	    return function (as) {
	        var len = as.length;
	        var out = new Array(len + 1);
	        out[0] = b;
	        for (var i = 0; i < len; i++) {
	            out[i + 1] = f(out[i], as[i]);
	        }
	        return out;
	    };
	};
	exports.scanLeft = scanLeft;
	/**
	 * Fold an array from the right, keeping all intermediate results instead of only the final result
	 *
	 * @example
	 * import { scanRight } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(scanRight(10, (a: number, b) => b - a)([1, 2, 3]), [4, 5, 7, 10])
	 *
	 * @since 2.0.0
	 */
	var scanRight = function (b, f) {
	    return function (as) {
	        var len = as.length;
	        var out = new Array(len + 1);
	        out[len] = b;
	        for (var i = len - 1; i >= 0; i--) {
	            out[i] = f(as[i], out[i + 1]);
	        }
	        return out;
	    };
	};
	exports.scanRight = scanRight;
	/**
	 * Calculate the number of elements in a `Array`.
	 *
	 * @example
	 * import { size } from 'fp-ts/Array'
	 *
	 * assert.strictEqual(size(["a","b","c"]),3)
	 *
	 * @since 2.10.0
	 */
	var size = function (as) { return as.length; };
	exports.size = size;
	/**
	 * Test whether an array contains a particular index
	 *
	 * @example
	 * import { isOutOfBound } from 'fp-ts/Array'
	 *
	 * assert.strictEqual(isOutOfBound(1,["a","b","c"]),false)
	 * assert.strictEqual(isOutOfBound(-1,["a","b","c"]),true)
	 * assert.strictEqual(isOutOfBound(3,["a","b","c"]),true)
	 *
	 * @since 2.0.0
	 */
	exports.isOutOfBound = NEA.isOutOfBound;
	// TODO: remove non-curried overloading in v3
	/**
	 * This function provides a safe way to read a value at a particular index from an array.
	 * It returns a `none` if the index is out of bounds, and a `some` of the element if the
	 * index is valid.
	 *
	 * @example
	 * import { lookup } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(pipe([1, 2, 3], lookup(1)), some(2))
	 * assert.deepStrictEqual(pipe([1, 2, 3], lookup(3)), none)
	 *
	 * @since 2.0.0
	 */
	exports.lookup = RA.lookup;
	/**
	 * Get the first element in an array, or `None` if the array is empty
	 *
	 * @example
	 * import { head } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(head([1, 2, 3]), some(1))
	 * assert.deepStrictEqual(head([]), none)
	 *
	 * @since 2.0.0
	 */
	exports.head = RA.head;
	/**
	 * Get the last element in an array, or `None` if the array is empty
	 *
	 * @example
	 * import { last } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(last([1, 2, 3]), some(3))
	 * assert.deepStrictEqual(last([]), none)
	 *
	 * @since 2.0.0
	 */
	exports.last = RA.last;
	/**
	 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
	 *
	 * @example
	 * import { tail } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(tail([1, 2, 3]), some([2, 3]))
	 * assert.deepStrictEqual(tail([]), none)
	 *
	 * @since 2.0.0
	 */
	var tail = function (as) { return ((0, exports.isNonEmpty)(as) ? _.some(NEA.tail(as)) : _.none); };
	exports.tail = tail;
	/**
	 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
	 *
	 * @example
	 * import { init } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(init([1, 2, 3]), some([1, 2]))
	 * assert.deepStrictEqual(init([]), none)
	 *
	 * @since 2.0.0
	 */
	var init = function (as) { return ((0, exports.isNonEmpty)(as) ? _.some(NEA.init(as)) : _.none); };
	exports.init = init;
	/**
	 * Keep only a max number of elements from the start of an `Array`, creating a new `Array`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { takeLeft } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(takeLeft(2)([1, 2, 3, 4, 5]), [1, 2]);
	 * assert.deepStrictEqual(takeLeft(7)([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
	 * assert.deepStrictEqual(takeLeft(0)([1, 2, 3, 4, 5]), []);
	 * assert.deepStrictEqual(takeLeft(-1)([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
	 *
	 * @since 2.0.0
	 */
	var takeLeft = function (n) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(n, as) ? (0, exports.copy)(as) : as.slice(0, n);
	    };
	};
	exports.takeLeft = takeLeft;
	/**
	 * Keep only a max number of elements from the end of an `Array`, creating a new `Array`.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { takeRight } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(takeRight(2)([1, 2, 3, 4, 5]), [4, 5]);
	 * assert.deepStrictEqual(takeRight(7)([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
	 * assert.deepStrictEqual(takeRight(0)([1, 2, 3, 4, 5]), []);
	 * assert.deepStrictEqual(takeRight(-1)([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
	 *
	 * @since 2.0.0
	 */
	var takeRight = function (n) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(n, as) ? (0, exports.copy)(as) : n === 0 ? [] : as.slice(-n);
	    };
	};
	exports.takeRight = takeRight;
	function takeLeftWhile(predicate) {
	    return function (as) {
	        var out = [];
	        for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
	            var a = as_1[_i];
	            if (!predicate(a)) {
	                break;
	            }
	            out.push(a);
	        }
	        return out;
	    };
	}
	exports.takeLeftWhile = takeLeftWhile;
	var spanLeftIndex = function (as, predicate) {
	    var l = as.length;
	    var i = 0;
	    for (; i < l; i++) {
	        if (!predicate(as[i])) {
	            break;
	        }
	    }
	    return i;
	};
	function spanLeft(predicate) {
	    return function (as) {
	        var _a = (0, exports.splitAt)(spanLeftIndex(as, predicate))(as), init = _a[0], rest = _a[1];
	        return { init: init, rest: rest };
	    };
	}
	exports.spanLeft = spanLeft;
	/**
	 * Creates a new `Array` which is a copy of the input dropping a max number of elements from the start.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { dropLeft } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(dropLeft(2)([1, 2, 3]), [3]);
	 * assert.deepStrictEqual(dropLeft(5)([1, 2, 3]), []);
	 * assert.deepStrictEqual(dropLeft(0)([1, 2, 3]), [1, 2, 3]);
	 * assert.deepStrictEqual(dropLeft(-2)([1, 2, 3]), [1, 2, 3]);
	 *
	 * @since 2.0.0
	 */
	var dropLeft = function (n) {
	    return function (as) {
	        return n <= 0 || (0, exports.isEmpty)(as) ? (0, exports.copy)(as) : n >= as.length ? [] : as.slice(n, as.length);
	    };
	};
	exports.dropLeft = dropLeft;
	/**
	 * Creates a new `Array` which is a copy of the input dropping a max number of elements from the end.
	 *
	 * **Note**. `n` is normalized to a non negative integer.
	 *
	 * @example
	 * import { dropRight } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(dropRight(2)([1, 2, 3]), [1]);
	 * assert.deepStrictEqual(dropRight(5)([1, 2, 3]), []);
	 * assert.deepStrictEqual(dropRight(0)([1, 2, 3]), [1, 2, 3]);
	 * assert.deepStrictEqual(dropRight(-2)([1, 2, 3]), [1, 2, 3]);
	 *
	 * @since 2.0.0
	 */
	var dropRight = function (n) {
	    return function (as) {
	        return n <= 0 || (0, exports.isEmpty)(as) ? (0, exports.copy)(as) : n >= as.length ? [] : as.slice(0, as.length - n);
	    };
	};
	exports.dropRight = dropRight;
	function dropLeftWhile(predicate) {
	    return function (as) { return as.slice(spanLeftIndex(as, predicate)); };
	}
	exports.dropLeftWhile = dropLeftWhile;
	/**
	 * `findIndex` returns an `Option` containing the first index for which a predicate holds.
	 * It returns `None` if no element satisfies the predicate.
	 * Similar to [`findFirst`](#findFirst) but returning the index instead of the element.
	 *
	 * @example
	 * import { findIndex } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
	 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
	 *
	 * @since 2.0.0
	 */
	exports.findIndex = RA.findIndex;
	function findFirst(predicate) {
	    return RA.findFirst(predicate);
	}
	exports.findFirst = findFirst;
	/**
	 * Given a selector function which takes an element and returns an option,
	 * this function applies the selector to each element of the array and
	 * returns the first `Some` result. Otherwise it returns `None`.
	 *
	 * @example
	 * import { findFirstMap } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface Person {
	 *   readonly name: string;
	 *   readonly age: number;
	 * }
	 *
	 * const persons: Array<Person> = [
	 *   { name: "John", age: 16 },
	 *   { name: "Mary", age: 45 },
	 *   { name: "Joey", age: 28 },
	 * ];
	 *
	 * const nameOfPersonAbove18 = (p: Person) => (p.age <= 18 ? none : some(p.name));
	 * const nameOfPersonAbove70 = (p: Person) => (p.age <= 70 ? none : some(p.name));
	 * assert.deepStrictEqual(findFirstMap(nameOfPersonAbove18)(persons), some("Mary"));
	 * assert.deepStrictEqual(findFirstMap(nameOfPersonAbove70)(persons), none);
	 *
	 * @since 2.0.0
	 */
	exports.findFirstMap = RA.findFirstMap;
	function findLast(predicate) {
	    return RA.findLast(predicate);
	}
	exports.findLast = findLast;
	/**
	 * Given a selector function which takes an element and returns an option,
	 * this function applies the selector to each element of the array starting from the
	 * end and returns the last `Some` result. Otherwise it returns `None`.
	 *
	 * @example
	 * import { findLastMap } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface Person {
	 *   readonly name: string;
	 *   readonly age: number;
	 * }
	 *
	 * const persons: Array<Person> = [
	 *   { name: "John", age: 16 },
	 *   { name: "Mary", age: 45 },
	 *   { name: "Joey", age: 28 },
	 * ];
	 *
	 * const nameOfPersonAbove18 = (p: Person) => (p.age <= 18 ? none : some(p.name));
	 * const nameOfPersonAbove70 = (p: Person) => (p.age <= 70 ? none : some(p.name));
	 * assert.deepStrictEqual(findLastMap(nameOfPersonAbove18)(persons), some("Joey"));
	 * assert.deepStrictEqual(findLastMap(nameOfPersonAbove70)(persons), none);
	 *
	 * @since 2.0.0
	 */
	exports.findLastMap = RA.findLastMap;
	/**
	 * Returns the index of the last element of the list which matches the predicate.
	 * It returns an `Option` containing the index or `None` if not found.
	 *
	 * @example
	 * import { findLastIndex } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * interface X {
	 *   readonly a: number
	 *   readonly b: number
	 * }
	 * const xs: Array<X> = [{ a: 1, b: 0 }, { a: 1, b: 1 }]
	 * assert.deepStrictEqual(findLastIndex((x: { readonly a: number }) => x.a === 1)(xs), some(1))
	 * assert.deepStrictEqual(findLastIndex((x: { readonly a: number }) => x.a === 4)(xs), none)
	 *
	 * @since 2.0.0
	 */
	exports.findLastIndex = RA.findLastIndex;
	/**
	 * This function takes an array and makes a new array containing the same elements.
	 *
	 * @since 2.0.0
	 */
	var copy = function (as) { return as.slice(); };
	exports.copy = copy;
	/**
	 * Insert an element at the specified index, creating a new array,
	 * or returning `None` if the index is out of bounds.
	 *
	 * @example
	 * import { insertAt } from 'fp-ts/Array'
	 * import { some } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(insertAt(2, 5)([1, 2, 3, 4]), some([1, 2, 5, 3, 4]))
	 *
	 * @since 2.0.0
	 */
	var insertAt = function (i, a) {
	    return function (as) {
	        return i < 0 || i > as.length ? _.none : _.some((0, exports.unsafeInsertAt)(i, a, as));
	    };
	};
	exports.insertAt = insertAt;
	/**
	 * Change the element at the specified index, creating a new array,
	 * or returning `None` if the index is out of bounds.
	 *
	 * @example
	 * import { updateAt } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(updateAt(1, 1)([1, 2, 3]), some([1, 1, 3]))
	 * assert.deepStrictEqual(updateAt(1, 1)([]), none)
	 *
	 * @since 2.0.0
	 */
	var updateAt = function (i, a) { return (0, exports.modifyAt)(i, function () { return a; }); };
	exports.updateAt = updateAt;
	/**
	 * Delete the element at the specified index, creating a new array, or returning `None` if the index is out of bounds.
	 *
	 * @example
	 * import { deleteAt } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * assert.deepStrictEqual(deleteAt(0)([1, 2, 3]), some([2, 3]))
	 * assert.deepStrictEqual(deleteAt(1)([]), none)
	 *
	 * @since 2.0.0
	 */
	var deleteAt = function (i) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeDeleteAt)(i, as));
	    };
	};
	exports.deleteAt = deleteAt;
	/**
	 * Apply a function to the element at the specified index, creating a new array, or returning `None` if the index is out
	 * of bounds.
	 *
	 * @example
	 * import { modifyAt } from 'fp-ts/Array'
	 * import { some, none } from 'fp-ts/Option'
	 *
	 * const double = (x: number): number => x * 2
	 * assert.deepStrictEqual(modifyAt(1, double)([1, 2, 3]), some([1, 4, 3]))
	 * assert.deepStrictEqual(modifyAt(1, double)([]), none)
	 *
	 * @since 2.0.0
	 */
	var modifyAt = function (i, f) {
	    return function (as) {
	        return (0, exports.isOutOfBound)(i, as) ? _.none : _.some((0, exports.unsafeUpdateAt)(i, f(as[i]), as));
	    };
	};
	exports.modifyAt = modifyAt;
	/**
	 * Reverse an array, creating a new array
	 *
	 * @example
	 * import { reverse } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(reverse([1, 2, 3]), [3, 2, 1])
	 *
	 * @since 2.0.0
	 */
	var reverse = function (as) { return ((0, exports.isEmpty)(as) ? [] : as.slice().reverse()); };
	exports.reverse = reverse;
	/**
	 * Takes an `Array` of `Either` and produces a new `Array` containing
	 * the values of all the `Right` elements in the same order.
	 *
	 * @example
	 * import { rights } from 'fp-ts/Array'
	 * import { right, left } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(rights([right(1), left('foo'), right(2)]), [1, 2])
	 *
	 * @since 2.0.0
	 */
	var rights = function (as) {
	    var r = [];
	    for (var i = 0; i < as.length; i++) {
	        var a = as[i];
	        if (a._tag === 'Right') {
	            r.push(a.right);
	        }
	    }
	    return r;
	};
	exports.rights = rights;
	/**
	 * Takes an `Array` of `Either` and produces a new `Array` containing
	 * the values of all the `Left` elements in the same order.
	 *
	 * @example
	 * import { lefts } from 'fp-ts/Array'
	 * import { left, right } from 'fp-ts/Either'
	 *
	 * assert.deepStrictEqual(lefts([right(1), left('foo'), right(2)]), ['foo'])
	 *
	 * @since 2.0.0
	 */
	var lefts = function (as) {
	    var r = [];
	    for (var i = 0; i < as.length; i++) {
	        var a = as[i];
	        if (a._tag === 'Left') {
	            r.push(a.left);
	        }
	    }
	    return r;
	};
	exports.lefts = lefts;
	/**
	 * Sort the elements of an array in increasing order, creating a new array
	 *
	 * @example
	 * import { sort } from 'fp-ts/Array'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(sort(N.Ord)([3, 2, 1]), [1, 2, 3])
	 *
	 * @since 2.0.0
	 */
	var sort = function (O) {
	    return function (as) {
	        return as.length <= 1 ? (0, exports.copy)(as) : as.slice().sort(O.compare);
	    };
	};
	exports.sort = sort;
	/**
	 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
	 * input array is short, excess elements of the longer array are discarded.
	 *
	 * @example
	 * import { zipWith } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(zipWith([1, 2, 3], ['a', 'b', 'c', 'd'], (n, s) => s + n), ['a1', 'b2', 'c3'])
	 *
	 * @since 2.0.0
	 */
	var zipWith = function (fa, fb, f) {
	    var fc = [];
	    var len = Math.min(fa.length, fb.length);
	    for (var i = 0; i < len; i++) {
	        fc[i] = f(fa[i], fb[i]);
	    }
	    return fc;
	};
	exports.zipWith = zipWith;
	function zip(as, bs) {
	    if (bs === undefined) {
	        return function (bs) { return zip(bs, as); };
	    }
	    return (0, exports.zipWith)(as, bs, function (a, b) { return [a, b]; });
	}
	exports.zip = zip;
	/**
	 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays
	 *
	 * @example
	 * import { unzip } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(unzip([[1, 'a'], [2, 'b'], [3, 'c']]), [[1, 2, 3], ['a', 'b', 'c']])
	 *
	 * @since 2.0.0
	 */
	var unzip = function (as) {
	    var fa = [];
	    var fb = [];
	    for (var i = 0; i < as.length; i++) {
	        fa[i] = as[i][0];
	        fb[i] = as[i][1];
	    }
	    return [fa, fb];
	};
	exports.unzip = unzip;
	/**
	 * Creates a new `Array`, prepending an element to every member of the input `Array`.
	 *
	 * @example
	 * import { prependAll } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(prependAll(9)([1, 2, 3, 4]), [9, 1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.10.0
	 */
	var prependAll = function (middle) {
	    var f = NEA.prependAll(middle);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : []); };
	};
	exports.prependAll = prependAll;
	/**
	 * Creates a new `Array` placing an element in between members of the input `Array`.
	 *
	 * @example
	 * import { intersperse } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(intersperse(9)([1, 2, 3, 4]), [1, 9, 2, 9, 3, 9, 4])
	 *
	 * @since 2.9.0
	 */
	var intersperse = function (middle) {
	    var f = NEA.intersperse(middle);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : (0, exports.copy)(as)); };
	};
	exports.intersperse = intersperse;
	/**
	 * Creates a new `Array` rotating the input `Array` by `n` steps.
	 *
	 * @example
	 * import { rotate } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
	 *
	 * @since 2.0.0
	 */
	var rotate = function (n) {
	    var f = NEA.rotate(n);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : (0, exports.copy)(as)); };
	};
	exports.rotate = rotate;
	// TODO: remove non-curried overloading in v3
	/**
	 * Test if a value is a member of an `Array`. Takes a `Eq<A>` as a single
	 * argument which returns the function to use to search for a value of type `A` in
	 * an `Array<A>`.
	 *
	 * @example
	 * import { elem } from 'fp-ts/Array'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.strictEqual(pipe([1, 2, 3], elem(N.Eq)(2)), true)
	 * assert.strictEqual(pipe([1, 2, 3], elem(N.Eq)(0)), false)
	 *
	 * @since 2.0.0
	 */
	exports.elem = RA.elem;
	/**
	 * Creates a new `Array` removing duplicate elements, keeping the first occurrence of an element,
	 * based on a `Eq<A>`.
	 *
	 * @example
	 * import { uniq } from 'fp-ts/Array'
	 * import * as N from 'fp-ts/number'
	 *
	 * assert.deepStrictEqual(uniq(N.Eq)([1, 2, 1]), [1, 2])
	 *
	 * @since 2.0.0
	 */
	var uniq = function (E) {
	    var f = NEA.uniq(E);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : (0, exports.copy)(as)); };
	};
	exports.uniq = uniq;
	/**
	 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
	 * etc...
	 *
	 * @example
	 * import { sortBy } from 'fp-ts/Array'
	 * import { contramap } from 'fp-ts/Ord'
	 * import * as S from 'fp-ts/string'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * interface Person {
	 *   readonly name: string
	 *   readonly age: number
	 * }
	 * const byName = pipe(S.Ord, contramap((p: Person) => p.name))
	 * const byAge = pipe(N.Ord, contramap((p: Person) => p.age))
	 *
	 * const sortByNameByAge = sortBy([byName, byAge])
	 *
	 * const persons = [{ name: 'a', age: 1 }, { name: 'b', age: 3 }, { name: 'c', age: 2 }, { name: 'b', age: 2 }]
	 * assert.deepStrictEqual(sortByNameByAge(persons), [
	 *   { name: 'a', age: 1 },
	 *   { name: 'b', age: 2 },
	 *   { name: 'b', age: 3 },
	 *   { name: 'c', age: 2 }
	 * ])
	 *
	 * @since 2.0.0
	 */
	var sortBy = function (ords) {
	    var f = NEA.sortBy(ords);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : (0, exports.copy)(as)); };
	};
	exports.sortBy = sortBy;
	/**
	 * A useful recursion pattern for processing an array to produce a new array, often used for "chopping" up the input
	 * array. Typically chop is called with some function that will consume an initial prefix of the array and produce a
	 * value and the rest of the array.
	 *
	 * @example
	 * import { Eq } from 'fp-ts/Eq'
	 * import * as A from 'fp-ts/Array'
	 * import * as N from 'fp-ts/number'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const group = <A>(S: Eq<A>): ((as: Array<A>) => Array<Array<A>>) => {
	 *   return A.chop(as => {
	 *     const { init, rest } = pipe(as, A.spanLeft((a: A) => S.equals(a, as[0])))
	 *     return [init, rest]
	 *   })
	 * }
	 * assert.deepStrictEqual(group(N.Eq)([1, 1, 2, 3, 3, 4]), [[1, 1], [2], [3, 3], [4]])
	 *
	 * @since 2.0.0
	 */
	var chop = function (f) {
	    var g = NEA.chop(f);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? g(as) : []); };
	};
	exports.chop = chop;
	/**
	 * Splits an `Array` into two pieces, the first piece has max `n` elements.
	 *
	 * @example
	 * import { splitAt } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(splitAt(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4, 5]])
	 *
	 * @since 2.0.0
	 */
	var splitAt = function (n) {
	    return function (as) {
	        return n >= 1 && (0, exports.isNonEmpty)(as) ? NEA.splitAt(n)(as) : (0, exports.isEmpty)(as) ? [(0, exports.copy)(as), []] : [[], (0, exports.copy)(as)];
	    };
	};
	exports.splitAt = splitAt;
	/**
	 * Splits an array into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
	 * the array. Note that `chunksOf(n)([])` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
	 * definition of `chunksOf`; it satisfies the property that
	 *
	 * ```ts
	 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
	 * ```
	 *
	 * whenever `n` evenly divides the length of `xs`.
	 *
	 * @example
	 * import { chunksOf } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
	 *
	 * @since 2.0.0
	 */
	var chunksOf = function (n) {
	    var f = NEA.chunksOf(n);
	    return function (as) { return ((0, exports.isNonEmpty)(as) ? f(as) : []); };
	};
	exports.chunksOf = chunksOf;
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	var fromOptionK = function (f) {
	    return function () {
	        var a = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            a[_i] = arguments[_i];
	        }
	        return (0, exports.fromOption)(f.apply(void 0, a));
	    };
	};
	exports.fromOptionK = fromOptionK;
	function comprehension(input, f, g) {
	    if (g === void 0) { g = function () { return true; }; }
	    var go = function (scope, input) {
	        return (0, exports.isNonEmpty)(input)
	            ? (0, exports.flatMap)(NEA.head(input), function (a) { return go((0, function_1.pipe)(scope, (0, exports.append)(a)), NEA.tail(input)); })
	            : g.apply(void 0, scope) ? [f.apply(void 0, scope)]
	                : [];
	    };
	    return go([], input);
	}
	exports.comprehension = comprehension;
	/**
	 * @since 2.11.0
	 */
	var concatW = function (second) {
	    return function (first) {
	        return (0, exports.isEmpty)(first) ? (0, exports.copy)(second) : (0, exports.isEmpty)(second) ? (0, exports.copy)(first) : first.concat(second);
	    };
	};
	exports.concatW = concatW;
	/**
	 * @since 2.11.0
	 */
	exports.concat = exports.concatW;
	function union(E) {
	    var unionE = NEA.union(E);
	    return function (first, second) {
	        if (second === undefined) {
	            var unionE_1 = union(E);
	            return function (second) { return unionE_1(second, first); };
	        }
	        return (0, exports.isNonEmpty)(first) && (0, exports.isNonEmpty)(second)
	            ? unionE(second)(first)
	            : (0, exports.isNonEmpty)(first)
	                ? (0, exports.copy)(first)
	                : (0, exports.copy)(second);
	    };
	}
	exports.union = union;
	function intersection(E) {
	    var elemE = (0, exports.elem)(E);
	    return function (xs, ys) {
	        if (ys === undefined) {
	            var intersectionE_1 = intersection(E);
	            return function (ys) { return intersectionE_1(ys, xs); };
	        }
	        return xs.filter(function (a) { return elemE(a, ys); });
	    };
	}
	exports.intersection = intersection;
	function difference(E) {
	    var elemE = (0, exports.elem)(E);
	    return function (xs, ys) {
	        if (ys === undefined) {
	            var differenceE_1 = difference(E);
	            return function (ys) { return differenceE_1(ys, xs); };
	        }
	        return xs.filter(function (a) { return !elemE(a, ys); });
	    };
	}
	exports.difference = difference;
	var _map = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); };
	/* istanbul ignore next */
	var _mapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.mapWithIndex)(f)); };
	var _ap = function (fab, fa) { return (0, function_1.pipe)(fab, (0, exports.ap)(fa)); };
	/* istanbul ignore next */
	var _filter = function (fa, predicate) { return (0, function_1.pipe)(fa, (0, exports.filter)(predicate)); };
	/* istanbul ignore next */
	var _filterMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.filterMap)(f)); };
	/* istanbul ignore next */
	var _partition = function (fa, predicate) {
	    return (0, function_1.pipe)(fa, (0, exports.partition)(predicate));
	};
	/* istanbul ignore next */
	var _partitionMap = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.partitionMap)(f)); };
	/* istanbul ignore next */
	var _partitionWithIndex = function (fa, predicateWithIndex) { return (0, function_1.pipe)(fa, (0, exports.partitionWithIndex)(predicateWithIndex)); };
	/* istanbul ignore next */
	var _partitionMapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.partitionMapWithIndex)(f)); };
	/* istanbul ignore next */
	var _alt = function (fa, that) { return (0, function_1.pipe)(fa, (0, exports.alt)(that)); };
	var _reduce = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduce)(b, f)); };
	/* istanbul ignore next */
	var _foldMap = function (M) {
	    var foldMapM = (0, exports.foldMap)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRight = function (fa, b, f) { return (0, function_1.pipe)(fa, (0, exports.reduceRight)(b, f)); };
	/* istanbul ignore next */
	var _reduceWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _foldMapWithIndex = function (M) {
	    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
	    return function (fa, f) { return (0, function_1.pipe)(fa, foldMapWithIndexM(f)); };
	};
	/* istanbul ignore next */
	var _reduceRightWithIndex = function (fa, b, f) {
	    return (0, function_1.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
	};
	/* istanbul ignore next */
	var _filterMapWithIndex = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.filterMapWithIndex)(f)); };
	/* istanbul ignore next */
	var _filterWithIndex = function (fa, predicateWithIndex) { return (0, function_1.pipe)(fa, (0, exports.filterWithIndex)(predicateWithIndex)); };
	/* istanbul ignore next */
	var _extend = function (fa, f) { return (0, function_1.pipe)(fa, (0, exports.extend)(f)); };
	/* istanbul ignore next */
	var _traverse = function (F) {
	    var traverseF = (0, exports.traverse)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseF(f)); };
	};
	/* istanbul ignore next */
	var _traverseWithIndex = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (ta, f) { return (0, function_1.pipe)(ta, traverseWithIndexF(f)); };
	};
	var _chainRecDepthFirst = RA._chainRecDepthFirst;
	var _chainRecBreadthFirst = RA._chainRecBreadthFirst;
	/**
	 * Given an element of the base type, `of` builds an `Array` containing just that
	 * element of the base type (this is useful for building a `Monad`).
	 *
	 * @example
	 * import { of } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(of("a"), ["a"]);
	 *
	 * @category constructors
	 * @since 2.0.0
	 */
	exports.of = NEA.of;
	/**
	 * Makes an empty `Array`, useful for building a [`Monoid`](#Monoid)
	 *
	 * @since 2.7.0
	 */
	var zero = function () { return []; };
	exports.zero = zero;
	/**
	 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: Array<A>) => Array<B>`.
	 * In practice it applies the base function to each element of the array and collects the
	 * results in a new array.
	 *
	 * @example
	 * import { map } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const f = (n: number) => n * 2;
	 * assert.deepStrictEqual(pipe([1, 2, 3], map(f)), [2, 4, 6]);
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	var map = function (f) { return function (fa) { return fa.map(function (a) { return f(a); }); }; };
	exports.map = map;
	/**
	 * @example
	 * import { ap, map, of } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * // a curried function with 3 input parameteres
	 * const f = (s1: string) => (n: number) => (s2: string) => s1 + n + s2;
	 *
	 * // let's use `ap` to iterate `f` over an array for each input parameter
	 * assert.deepStrictEqual(pipe(["a", "b"], map(f), ap([1, 2]), ap(["😀", "😫", "😎"])), [
	 *   "a1😀", "a1😫", "a1😎",
	 *   "a2😀", "a2😫", "a2😎",
	 *   "b1😀", "b1😫", "b1😎",
	 *   "b2😀", "b2😫", "b2😎",
	 * ]);
	 *
	 * // given Array implements the Applicative interface with the `of` method,
	 * // we can write exactly the same thing in a more symmetric way
	 * // using `of` on `f` and `ap` on each array in input
	 * assert.deepStrictEqual(
	 *   pipe(of(f), ap(["a", "b"]), ap([1, 2]), ap(["😀", "😫", "😎"])),
	 *   pipe(["a", "b"], map(f), ap([1, 2]), ap(["😀", "😫", "😎"]))
	 * );
	 *
	 * @since 2.0.0
	 */
	var ap = function (fa) {
	    return (0, exports.flatMap)(function (f) { return (0, function_1.pipe)(fa, (0, exports.map)(f)); });
	};
	exports.ap = ap;
	/**
	 * Composes computations in sequence, using the return value of one computation to
	 * determine the next computation.
	 *
	 * In other words it takes a function `f` that produces an array from a single element of
	 * the base type `A` and returns a new function which applies `f` to each element of the
	 * input array (like [`map`](#map)) and, instead of returning an array of arrays, concatenates the
	 * results into a single array (like [`flatten`](#flatten)).
	 *
	 * @example
	 * import { flatMap, map, replicate } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const f = (n: number) => replicate(n, `${n}`);
	 * assert.deepStrictEqual(pipe([1, 2, 3], map(f)), [["1"], ["2", "2"], ["3", "3", "3"]]);
	 * assert.deepStrictEqual(pipe([1, 2, 3], flatMap(f)), ["1", "2", "2", "3", "3", "3"]);
	 *
	 * @category sequencing
	 * @since 2.14.0
	 */
	exports.flatMap = (0, function_1.dual)(2, function (ma, f) {
	    return (0, function_1.pipe)(ma, (0, exports.chainWithIndex)(function (i, a) { return f(a, i); }));
	});
	/**
	 * Takes an array of arrays of `A` and flattens them into an array of `A`
	 * by concatenating the elements of each array in order.
	 *
	 * @example
	 * import { flatten } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(flatten([["a"], ["b", "c"], ["d", "e", "f"]]), ["a", "b", "c", "d", "e", "f"]);
	 *
	 * @category sequencing
	 * @since 2.5.0
	 */
	exports.flatten = (0, exports.flatMap)(function_1.identity);
	/**
	 * Same as [`map`](#map), but the iterating function takes both the index and the value
	 * of the element.
	 *
	 * @example
	 * import { mapWithIndex } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * const f = (i: number, s: string) => `${s} - ${i}`;
	 * assert.deepStrictEqual(pipe(["a", "b", "c"], mapWithIndex(f)), ["a - 0", "b - 1", "c - 2"]);
	 *
	 * @category mapping
	 * @since 2.0.0
	 */
	var mapWithIndex = function (f) { return function (fa) {
	    return fa.map(function (a, i) { return f(i, a); });
	}; };
	exports.mapWithIndex = mapWithIndex;
	/**
	 * Maps an array with an iterating function that takes the index and the value of
	 * each element and returns an `Option`. It keeps only the `Some` values discarding
	 * the `None`s.
	 *
	 * Same as [`filterMap`](#filterMap), but with an iterating function which takes also
	 * the index as input.
	 *
	 * @example
	 * import { filterMapWithIndex } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 * import { option } from "fp-ts";
	 *
	 * const f = (i: number, s: string) => (i % 2 === 1 ? option.some(s.toUpperCase()) : option.none);
	 * assert.deepStrictEqual(pipe(["a", "no", "neither", "b"], filterMapWithIndex(f)), ["NO", "B"]);
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var filterMapWithIndex = function (f) {
	    return function (fa) {
	        var out = [];
	        for (var i = 0; i < fa.length; i++) {
	            var optionB = f(i, fa[i]);
	            if (_.isSome(optionB)) {
	                out.push(optionB.value);
	            }
	        }
	        return out;
	    };
	};
	exports.filterMapWithIndex = filterMapWithIndex;
	/**
	 * Maps an array with an iterating function that returns an `Option`
	 * and it keeps only the `Some` values discarding the `None`s.
	 *
	 * @example
	 * import { filterMap } from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 * import { option } from "fp-ts";
	 *
	 * const f = (s: string) => s.length === 1 ? option.some(s.toUpperCase()) : option.none;
	 * assert.deepStrictEqual(pipe(["a", "no", "neither", "b"], filterMap(f)), ["A", "B"]);
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var filterMap = function (f) {
	    return (0, exports.filterMapWithIndex)(function (_, a) { return f(a); });
	};
	exports.filterMap = filterMap;
	/**
	 * Compact an array of `Option`s discarding the `None` values and
	 * keeping the `Some` values. It returns a new array containing the values of
	 * the `Some` options.
	 *
	 * @example
	 * import { compact } from 'fp-ts/Array'
	 * import { option } from "fp-ts";
	 *
	 * assert.deepStrictEqual(compact([option.some("a"), option.none, option.some("b")]), ["a", "b"]);
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	exports.compact = (0, exports.filterMap)(function_1.identity);
	/**
	 * Separate an array of `Either`s into `Left`s and `Right`s, creating two new arrays:
	 * one containing all the left values and one containing all the right values.
	 *
	 * @example
	 * import { separate } from 'fp-ts/Array'
	 * import { either } from "fp-ts";
	 *
	 * assert.deepStrictEqual(separate([either.right("r1"), either.left("l1"), either.right("r2")]), {
	 *   left: ["l1"],
	 *   right: ["r1", "r2"],
	 * });
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var separate = function (fa) {
	    var left = [];
	    var right = [];
	    for (var _i = 0, fa_1 = fa; _i < fa_1.length; _i++) {
	        var e = fa_1[_i];
	        if (e._tag === 'Left') {
	            left.push(e.left);
	        }
	        else {
	            right.push(e.right);
	        }
	    }
	    return (0, Separated_1.separated)(left, right);
	};
	exports.separate = separate;
	/**
	 * Given an iterating function that is a `Predicate` or a `Refinement`,
	 * `filter` creates a new `Array` containing the elements of the original
	 * `Array` for which the iterating function is `true`.
	 *
	 * @example
	 * import { filter } from 'fp-ts/Array'
	 * import { isString } from "fp-ts/lib/string";
	 *
	 * assert.deepStrictEqual(filter(isString)(["a", 1, {}, "b", 5]), ["a", "b"]);
	 * assert.deepStrictEqual(filter((x:number) => x > 0)([-3, 1, -2, 5]), [1, 5]);
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var filter = function (predicate) {
	    return function (as) {
	        return as.filter(predicate);
	    };
	};
	exports.filter = filter;
	/**
	 * Given an iterating function that is a `Predicate` or a `Refinement`,
	 * `partition` creates two new `Array`s: `right` containing the elements of the original
	 * `Array` for which the iterating function is `true`, `left` containing the elements
	 * for which it is false.
	 *
	 * @example
	 * import { partition } from 'fp-ts/Array'
	 * import { isString } from "fp-ts/lib/string";
	 *
	 * assert.deepStrictEqual(partition(isString)(["a", 1, {}, "b", 5]), { left: [1, {}, 5], right: ["a", "b"] });
	 * assert.deepStrictEqual(partition((x: number) => x > 0)([-3, 1, -2, 5]), { left: [-3, -2], right: [1, 5] });
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var partition = function (predicate) {
	    return (0, exports.partitionWithIndex)(function (_, a) { return predicate(a); });
	};
	exports.partition = partition;
	/**
	 * Same as [`partition`](#partition), but passing also the index to the iterating function.
	 *
	 * @example
	 * import { partitionWithIndex } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(partitionWithIndex((index, x: number) => index < 3 && x > 0)([-2, 5, 6, 7]), {
	 *   left: [-2, 7],
	 *   right: [5, 6],
	 * });
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var partitionWithIndex = function (predicateWithIndex) {
	    return function (as) {
	        var left = [];
	        var right = [];
	        for (var i = 0; i < as.length; i++) {
	            var b = as[i];
	            if (predicateWithIndex(i, b)) {
	                right.push(b);
	            }
	            else {
	                left.push(b);
	            }
	        }
	        return (0, Separated_1.separated)(left, right);
	    };
	};
	exports.partitionWithIndex = partitionWithIndex;
	/**
	 * Given an iterating function that returns an `Either`,
	 * `partitionMap` applies the iterating function to each element and it creates two `Array`s:
	 * `right` containing the values of `Right` results, `left` containing the values of `Left` results.
	 *
	 * @example
	 * import { partitionMap } from 'fp-ts/Array'
	 * import { Either, left, right } from "fp-ts/lib/Either";
	 *
	 * const upperIfString = <B>(x: B): Either<B, string> =>
	 *   typeof x === "string" ? right(x.toUpperCase()) : left(x);
	 * assert.deepStrictEqual(partitionMap(upperIfString)([-2, "hello", 6, 7, "world"]), {
	 *   left: [-2, 6, 7],
	 *   right: [ 'HELLO', 'WORLD' ],
	 * });
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var partitionMap = function (f) { return (0, exports.partitionMapWithIndex)(function (_, a) { return f(a); }); };
	exports.partitionMap = partitionMap;
	/**
	 * Same as [`partitionMap`](#partitionMap), but passing also the index to the iterating function.
	 *
	 * @example
	 * import { partitionMapWithIndex } from 'fp-ts/Array'
	 * import { Either, left, right } from "fp-ts/lib/Either";
	 *
	 * const upperIfStringBefore3 = <B>(index: number, x: B): Either<B, string> =>
	 *   index < 3 && typeof x === "string" ? right(x.toUpperCase()) : left(x);
	 * assert.deepStrictEqual(partitionMapWithIndex(upperIfStringBefore3)([-2, "hello", 6, 7, "world"]), {
	 *   left: [-2, 6, 7, "world"],
	 *   right: ["HELLO"],
	 * });
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var partitionMapWithIndex = function (f) {
	    return function (fa) {
	        var left = [];
	        var right = [];
	        for (var i = 0; i < fa.length; i++) {
	            var e = f(i, fa[i]);
	            if (e._tag === 'Left') {
	                left.push(e.left);
	            }
	            else {
	                right.push(e.right);
	            }
	        }
	        return (0, Separated_1.separated)(left, right);
	    };
	};
	exports.partitionMapWithIndex = partitionMapWithIndex;
	/**
	 * Less strict version of [`alt`](#alt).
	 *
	 * The `W` suffix (short for **W**idening) means that the return types will be merged.
	 *
	 * @example
	 * import * as A from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     A.altW(() => ['a', 'b'])
	 *   ),
	 *   [1, 2, 3, 'a', 'b']
	 * )
	 *
	 * @category error handling
	 * @since 2.9.0
	 */
	var altW = function (that) {
	    return function (fa) {
	        return fa.concat(that());
	    };
	};
	exports.altW = altW;
	/**
	 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
	 * types of kind `* -> *`.
	 *
	 * In case of `Array` concatenates the inputs into a single array.
	 *
	 * @example
	 * import * as A from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     A.alt(() => [4, 5])
	 *   ),
	 *   [1, 2, 3, 4, 5]
	 * )
	 *
	 * @category error handling
	 * @since 2.0.0
	 */
	exports.alt = exports.altW;
	/**
	 * Same as [`filter`](#filter), but passing also the index to the iterating function.
	 *
	 * @example
	 * import { filterWithIndex } from 'fp-ts/Array';
	 *
	 * const f = (index: number, x: number) => x > 0 && index <= 2;
	 * assert.deepStrictEqual(filterWithIndex(f)([-3, 1, -2, 5]), [1]);
	 *
	 * @category filtering
	 * @since 2.0.0
	 */
	var filterWithIndex = function (predicateWithIndex) {
	    return function (as) {
	        return as.filter(function (b, i) { return predicateWithIndex(i, b); });
	    };
	};
	exports.filterWithIndex = filterWithIndex;
	/**
	 * Given an iterating function that takes `Array<A>` as input, `extend` returns
	 * an array containing the results of the iterating function applied to the whole input
	 * `Array`, then to the input `Array` without the first element, then to the input
	 * `Array` without the first two elements, etc.
	 *
	 * @example
	 * import { extend } from 'fp-ts/Array'
	 *
	 * const f = (a: string[]) => a.join(",");
	 * assert.deepStrictEqual(extend(f)(["a", "b", "c"]), ["a,b,c", "b,c", "c"]);
	 *
	 * @since 2.0.0
	 */
	var extend = function (f) { return function (wa) {
	    return wa.map(function (_, i) { return f(wa.slice(i)); });
	}; };
	exports.extend = extend;
	/**
	 * `duplicate` returns an array containing the whole input `Array`,
	 * then to the input `Array` dropping the first element, then to the input
	 * `Array` dropping the first two elements, etc.
	 *
	 * @example
	 * import { duplicate } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(duplicate(["a", "b", "c"]), [["a", "b", "c"], ["b", "c"], ["c"]]);
	 *
	 * @since 2.0.0
	 */
	exports.duplicate = (0, exports.extend)(function_1.identity);
	/**
	 * Map and fold an `Array`.
	 * Map the `Array` passing each value to the iterating function.
	 * Then fold the results using the provided `Monoid`.
	 *
	 * @example
	 * import { foldMap } from 'fp-ts/Array'
	 *
	 * const monoid = { concat: (a: string, b: string) => a + b, empty: "" };
	 * const f = (s: string) => s.toUpperCase()
	 * assert.deepStrictEqual(foldMap(monoid)(f)(["a", "b", "c"]), "ABC");
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.foldMap = RA.foldMap;
	/**
	 * Same as [`foldMap`](#foldMap) but passing also the index to the iterating function.
	 *
	 * @example
	 * import { foldMapWithIndex } from 'fp-ts/Array'
	 *
	 * const monoid = { concat: (a: string, b: string) => a + b, empty: "" };
	 * const f = (index:number, s: string) => `${s.toUpperCase()}(${index})`
	 * assert.deepStrictEqual(foldMapWithIndex(monoid)(f)(["a", "b", "c"]), "A(0)B(1)C(2)");
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.foldMapWithIndex = RA.foldMapWithIndex;
	/**
	 * Reduces an `Array`.
	 *
	 * `reduce` executes the supplied iterating function on each element of the array,
	 * in order, passing in the element and the return value from the calculation on the preceding element.
	 *
	 * The first time that the iterating function is called there is no "return value of the
	 * previous calculation", the initial value is used in its place.
	 *
	 * @example
	 * import { reduce } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(reduce(5, (acc: number, cur: number) => acc * cur)([2, 3]), 5 * 2 * 3);
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduce = RA.reduce;
	/**
	 * Same as [`reduce`](#reduce) but passing also the index to the iterating function.
	 *
	 * @example
	 * import { reduceWithIndex } from 'fp-ts/Array'
	 *
	 * const f = (index: number, acc: string, cur: unknown) =>
	 *   acc + (typeof cur === "string" ? cur.toUpperCase() + index : "");
	 * assert.deepStrictEqual(reduceWithIndex("", f)([2, "a", "b", null]), "A1B2");
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceWithIndex = RA.reduceWithIndex;
	/**
	 * Same as [`reduce`](#reduce) but applied from the end to the start.
	 *
	 * *Note*: the iterating function in this case takes the accumulator as the last argument.
	 *
	 * @example
	 * import { reduceRight } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(reduceRight("", (cur: string, acc: string) => acc + cur)(["a", "b", "c"]), "cba");
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceRight = RA.reduceRight;
	/**
	 * Same as [`reduceRight`](#reduceRight) but passing also the index to the iterating function.
	 *
	 * @example
	 * import { reduceRightWithIndex } from 'fp-ts/Array'
	 *
	 * const f = (index: number, cur: unknown, acc: string) =>
	 *   acc + (typeof cur === "string" ? cur.toUpperCase() + index : "");
	 * assert.deepStrictEqual(reduceRightWithIndex("", f)([2, "a", "b", null]), "B2A1");
	 *
	 * @category folding
	 * @since 2.0.0
	 */
	exports.reduceRightWithIndex = RA.reduceRightWithIndex;
	/**
	 * Given an iterating function that returns a `HKT` (higher kinded type), `traverse`
	 * applies the iterating function to each element of the `Array` and then [`sequence`](#sequence)-s
	 * the results using the provided `Applicative`.
	 *
	 * E.g. suppose you have an `Array` and you want to format each element with a function
	 * that returns a result or an error as `f = (a: A) => Either<Error, B>`, using `traverse`
	 * you can apply `f` to all elements and directly obtain as a result an `Either<Error,Array<B>>`
	 * i.e. an `Array<B>` if all the results are `B`, or an `Error` if some of the results
	 * are `Error`s.
	 *
	 * @example
	 * import { traverse } from 'fp-ts/Array'
	 * import { Applicative, left, right } from "fp-ts/lib/Either";
	 *
	 * const f = (x: unknown) =>
	 *   typeof x === "string" ? right(x.toUpperCase()) : left(new Error("not a string"));
	 * assert.deepStrictEqual(traverse(Applicative)(f)(["a", "b"]), right(["A", "B"]));
	 * assert.deepStrictEqual(traverse(Applicative)(f)(["a", 5]), left(new Error("not a string")));
	 *
	 * @category traversing
	 * @since 2.6.3
	 */
	var traverse = function (F) {
	    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
	    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
	};
	exports.traverse = traverse;
	/**
	 * `sequence` takes an `Array` where elements are `HKT<A>` (higher kinded type) and,
	 * using an applicative of that `HKT`, returns an `HKT` of `Array<A>`.
	 * E.g. it can turn an `Array<Either<Error, string>>` into an `Either<Error, Array<string>>`.
	 *
	 * `sequence` requires an `Applicative` of the `HKT` you are targeting, e.g. to turn an
	 * `Array<Either<E, A>>` into an `Either<E, Array<A>>`, it needs an
	 * `Applicative` for `Either`, to to turn an `Array<Option<A>>` into an `Option<Array<A>>`,
	 * it needs an `Applicative` for `Option`.
	 *
	 * @example
	 * import { sequence } from 'fp-ts/Array'
	 * import { Applicative, left, right } from "fp-ts/lib/Either";
	 *
	 * assert.deepStrictEqual(sequence(Applicative)([right("a"), right("b")]), right(["a", "b"]));
	 * assert.deepStrictEqual(
	 *   sequence(Applicative)([right("a"), left(new Error("not a string"))]),
	 *   left(new Error("not a string"))
	 * );
	 *
	 * @category traversing
	 * @since 2.6.3
	 */
	var sequence = function (F) {
	    return function (ta) {
	        return _reduce(ta, F.of((0, exports.zero)()), function (fas, fa) {
	            return F.ap(F.map(fas, function (as) { return function (a) { return (0, function_1.pipe)(as, (0, exports.append)(a)); }; }), fa);
	        });
	    };
	};
	exports.sequence = sequence;
	/**
	 * Same as [`traverse`](#traverse) but passing also the index to the iterating function.
	 *
	 * @example
	 * import { traverseWithIndex } from 'fp-ts/Array'
	 * import { Applicative, left, right } from "fp-ts/lib/Either";
	 *
	 * const f = (index:number, x:unknown) =>
	 *   typeof x === "string" ? right(x.toUpperCase() + index) : left(new Error("not a string"));
	 * assert.deepStrictEqual(traverseWithIndex(Applicative)(f)(["a", "b"]), right(["A0", "B1"]));
	 * assert.deepStrictEqual(traverseWithIndex(Applicative)(f)(["a", 5]), left(new Error("not a string")));
	 *
	 * @category sequencing
	 * @since 2.6.3
	 */
	var traverseWithIndex = function (F) {
	    return function (f) {
	        return (0, exports.reduceWithIndex)(F.of((0, exports.zero)()), function (i, fbs, a) {
	            return F.ap(F.map(fbs, function (bs) { return function (b) { return (0, function_1.pipe)(bs, (0, exports.append)(b)); }; }), f(i, a));
	        });
	    };
	};
	exports.traverseWithIndex = traverseWithIndex;
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wither = function (F) {
	    var _witherF = _wither(F);
	    return function (f) { return function (fa) { return _witherF(fa, f); }; };
	};
	exports.wither = wither;
	/**
	 * @category filtering
	 * @since 2.6.5
	 */
	var wilt = function (F) {
	    var _wiltF = _wilt(F);
	    return function (f) { return function (fa) { return _wiltF(fa, f); }; };
	};
	exports.wilt = wilt;
	/**
	 * `unfold` takes a function `f` which returns an `Option` of a tuple containing an outcome
	 * value and an input for the following iteration.
	 * `unfold` applies `f` to the initial value `b` and then recursively to the second
	 * element of the tuple contained in the returned `option` of the previous
	 * calculation until `f` returns `Option.none`.
	 *
	 * @example
	 * import { unfold } from 'fp-ts/Array'
	 * import { option } from 'fp-ts'
	 *
	 * const f = (n: number) => {
	 *   if (n <= 0) return option.none;
	 *   const returnValue = n * 2;
	 *   const inputForNextRound = n - 1;
	 *   return option.some([returnValue, inputForNextRound] as const);
	 * };
	 * assert.deepStrictEqual(unfold(5, f), [10, 8, 6, 4, 2]);
	 *
	 * @since 2.6.6
	 */
	var unfold = function (b, f) {
	    var out = [];
	    var bb = b;
	    // eslint-disable-next-line no-constant-condition
	    while (true) {
	        var mt = f(bb);
	        if (_.isSome(mt)) {
	            var _a = mt.value, a = _a[0], b_1 = _a[1];
	            out.push(a);
	            bb = b_1;
	        }
	        else {
	            break;
	        }
	    }
	    return out;
	};
	exports.unfold = unfold;
	/**
	 * @category type lambdas
	 * @since 2.0.0
	 */
	exports.URI = 'Array';
	/**
	 * `getShow` makes a `Show` for an `Array<A>` from a `Show` for
	 * an `A`.
	 *
	 * @example
	 * import { getShow } from 'fp-ts/Array'
	 *
	 * const numShow = { show: (n: number) => (n >= 0 ? `${n}` : `(${-n})`) };
	 * assert.deepStrictEqual(getShow(numShow).show([-2, -1, 0, 1]), "[(2), (1), 0, 1]");
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	exports.getShow = RA.getShow;
	/**
	 * Get a `Semigroup` based on the concatenation of `Array`s.
	 * See also [`getMonoid`](#getMonoid).
	 *
	 * @example
	 * import { getSemigroup } from 'fp-ts/Array'
	 *
	 * const S = getSemigroup<number>();
	 * assert.deepStrictEqual(S.concat([1, 2], [2, 3]), [1, 2, 2, 3]);
	 *
	 * @category instances
	 * @since 2.10.0
	 */
	var getSemigroup = function () { return ({
	    concat: function (first, second) { return first.concat(second); }
	}); };
	exports.getSemigroup = getSemigroup;
	/**
	 * Returns a `Monoid` for `Array<A>` based on the concatenation of `Array`s.
	 *
	 * @example
	 * import { getMonoid } from 'fp-ts/Array'
	 *
	 * const M = getMonoid<number>()
	 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	var getMonoid = function () { return ({
	    concat: (0, exports.getSemigroup)().concat,
	    empty: []
	}); };
	exports.getMonoid = getMonoid;
	/**
	 * Derives an `Eq` over the `Array` of a given element type from the `Eq` of that type. The derived `Eq` defines two
	 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
	 * different lengths, the result is non equality.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { getEq } from 'fp-ts/Array'
	 *
	 * const E = getEq(S.Eq)
	 * assert.strictEqual(E.equals(['a', 'b'], ['a', 'b']), true)
	 * assert.strictEqual(E.equals(['a'], []), false)
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	exports.getEq = RA.getEq;
	/**
	 * Derives an `Ord` over the `Array` of a given element type from the `Ord` of that type. The ordering between two such
	 * arrays is equal to: the first non equal comparison of each arrays elements taken pairwise in increasing order, in
	 * case of equality over all the pairwise elements; the longest array is considered the greatest, if both arrays have
	 * the same length, the result is equality.
	 *
	 * @example
	 * import { getOrd } from 'fp-ts/Array'
	 * import * as S from 'fp-ts/string'
	 *
	 * const O = getOrd(S.Ord)
	 * assert.strictEqual(O.compare(['b'], ['a']), 1)
	 * assert.strictEqual(O.compare(['a'], ['a']), 0)
	 * assert.strictEqual(O.compare(['a'], ['b']), -1)
	 *
	 * @category instances
	 * @since 2.0.0
	 */
	exports.getOrd = RA.getOrd;
	/**
	 * Get a `Semigroup` based on the union of the elements of `Array`s.
	 * Elements which equal according to the provided `Eq` are included
	 * only once in the result.
	 * See also [`getUnionMonoid`](#getUnionMonoid).
	 *
	 * @example
	 * import { getUnionSemigroup } from 'fp-ts/Array';
	 * import { Eq } from 'fp-ts/number';
	 *
	 * const S = getUnionSemigroup<number>(Eq);
	 * assert.deepStrictEqual(S.concat([1, 2], [2, 3]), [1, 2, 3]);
	 *
	 * @category instances
	 * @since 2.11.0
	 */
	var getUnionSemigroup = function (E) {
	    var unionE = union(E);
	    return {
	        concat: function (first, second) { return unionE(second)(first); }
	    };
	};
	exports.getUnionSemigroup = getUnionSemigroup;
	/**
	 * Get a `Monoid` based on the union of the elements of `Array`s.
	 * Elements which equal according to the provided `Eq` are included
	 * only once in the result.
	 *
	 * @example
	 * import { getUnionMonoid } from 'fp-ts/Array'
	 * import { Eq } from 'fp-ts/number';
	 *
	 * const M = getUnionMonoid<number>(Eq);
	 * assert.deepStrictEqual(M.concat([1, 2], [2, 3]), [1, 2, 3]);
	 * assert.deepStrictEqual(M.empty,[]);
	 *
	 * @category instances
	 * @since 2.11.0
	 */
	var getUnionMonoid = function (E) { return ({
	    concat: (0, exports.getUnionSemigroup)(E).concat,
	    empty: []
	}); };
	exports.getUnionMonoid = getUnionMonoid;
	/**
	 * Get a `Semigroup` based on the intersection of the elements of `Array`s.
	 * Only elements present in the two arrays which are equal according to the
	 * provided `Eq` are included in the result.
	 *
	 * @example
	 * import { getIntersectionSemigroup } from 'fp-ts/Array'
	 * import { Eq } from 'fp-ts/number';
	 *
	 * const S = getIntersectionSemigroup<number>(Eq);
	 * assert.deepStrictEqual(S.concat([1, 2], [2, 3]), [2]);
	 *
	 * @category instances
	 * @since 2.11.0
	 */
	var getIntersectionSemigroup = function (E) {
	    var intersectionE = intersection(E);
	    return {
	        concat: function (first, second) { return intersectionE(second)(first); }
	    };
	};
	exports.getIntersectionSemigroup = getIntersectionSemigroup;
	/**
	 * Get a `Magma` for `Array` where the `concat` function is the differnce between
	 * the first and the second array, i.e. the result contains all the elements of the
	 * first array for which their is no equal element in the second array according
	 * to the `Eq` provided.
	 *
	 *
	 * @example
	 * import { getDifferenceMagma } from 'fp-ts/Array'
	 * import { Eq } from 'fp-ts/number';
	 *
	 * const S = getDifferenceMagma<number>(Eq);
	 * assert.deepStrictEqual(S.concat([1, 2], [2, 3]), [1]);
	 *
	 * @category instances
	 * @since 2.11.0
	 */
	var getDifferenceMagma = function (E) {
	    var differenceE = difference(E);
	    return {
	        concat: function (first, second) { return differenceE(second)(first); }
	    };
	};
	exports.getDifferenceMagma = getDifferenceMagma;
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Functor = {
	    URI: exports.URI,
	    map: _map
	};
	/**
	 * Given an input an `Array` of functions, `flap` returns an `Array` containing
	 * the results of applying each function to the given input.
	 *
	 * @example
	 * import { flap } from 'fp-ts/Array'
	 *
	 * const funs = [
	 *   (n: number) => `Double: ${n * 2}`,
	 *   (n: number) => `Triple: ${n * 3}`,
	 *   (n: number) => `Square: ${n * n}`,
	 * ];
	 * assert.deepStrictEqual(flap(4)(funs), ['Double: 8', 'Triple: 12', 'Square: 16']);
	 *
	 * @category mapping
	 * @since 2.10.0
	 */
	exports.flap = (0, Functor_1.flap)(exports.Functor);
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Pointed = {
	    URI: exports.URI,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FunctorWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Apply = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap
	};
	/**
	 * Combine two effectful actions, keeping only the result of the first.
	 *
	 * @since 2.5.0
	 */
	exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
	/**
	 * Combine two effectful actions, keeping only the result of the second.
	 *
	 * @since 2.5.0
	 */
	exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Applicative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of
	};
	/**
	 * @category instances
	 * @since 2.10.0
	 */
	exports.Chain = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap
	};
	/**
	 * Composes computations in sequence, using the return value of one computation to determine the next computation and
	 * keeping only the result of the first.
	 *
	 * @example
	 * import * as A from 'fp-ts/Array'
	 * import { pipe } from 'fp-ts/function'
	 *
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     A.chainFirst(() => ['a', 'b'])
	 *   ),
	 *   [1, 1, 2, 2, 3, 3]
	 * )
	 * assert.deepStrictEqual(
	 *   pipe(
	 *     [1, 2, 3],
	 *     A.chainFirst(() => [])
	 *   ),
	 *   []
	 * )
	 *
	 * @category sequencing
	 * @since 2.0.0
	 */
	exports.chainFirst = 
	/*#__PURE__*/ (0, Chain_1.chainFirst)(exports.Chain);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Monad = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Unfoldable = {
	    URI: exports.URI,
	    unfold: exports.unfold
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alt = {
	    URI: exports.URI,
	    map: _map,
	    alt: _alt
	};
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.Zero = {
	    URI: exports.URI,
	    zero: exports.zero
	};
	/**
	 * @category do notation
	 * @since 2.11.0
	 */
	exports.guard = (0, Zero_1.guard)(exports.Zero, exports.Pointed);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Alternative = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    alt: _alt,
	    zero: exports.zero
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Extend = {
	    URI: exports.URI,
	    map: _map,
	    extend: _extend
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Compactable = {
	    URI: exports.URI,
	    compact: exports.compact,
	    separate: exports.separate
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Filterable = {
	    URI: exports.URI,
	    map: _map,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FilterableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    partitionMapWithIndex: _partitionMapWithIndex,
	    partitionWithIndex: _partitionWithIndex,
	    filterMapWithIndex: _filterMapWithIndex,
	    filterWithIndex: _filterWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Foldable = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.FoldableWithIndex = {
	    URI: exports.URI,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Traversable = {
	    URI: exports.URI,
	    map: _map,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence
	};
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.TraversableWithIndex = {
	    URI: exports.URI,
	    map: _map,
	    mapWithIndex: _mapWithIndex,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    traverseWithIndex: _traverseWithIndex
	};
	var _wither = /*#__PURE__*/ (0, Witherable_1.witherDefault)(exports.Traversable, exports.Compactable);
	var _wilt = /*#__PURE__*/ (0, Witherable_1.wiltDefault)(exports.Traversable, exports.Compactable);
	/**
	 * @category instances
	 * @since 2.7.0
	 */
	exports.Witherable = {
	    URI: exports.URI,
	    map: _map,
	    compact: exports.compact,
	    separate: exports.separate,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    wither: _wither,
	    wilt: _wilt
	};
	/**
	 * @category sequencing
	 * @since 2.11.0
	 */
	exports.chainRecDepthFirst = RA.chainRecDepthFirst;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.ChainRecDepthFirst = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap,
	    chainRec: _chainRecDepthFirst
	};
	/**
	 * @category sequencing
	 * @since 2.11.0
	 */
	exports.chainRecBreadthFirst = RA.chainRecBreadthFirst;
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.ChainRecBreadthFirst = {
	    URI: exports.URI,
	    map: _map,
	    ap: _ap,
	    chain: exports.flatMap,
	    chainRec: _chainRecBreadthFirst
	};
	/**
	 * Filter values inside a context.
	 *
	 * @since 2.11.0
	 */
	exports.filterE = (0, Witherable_1.filterE)(exports.Witherable);
	/**
	 * @category instances
	 * @since 2.11.0
	 */
	exports.FromEither = {
	    URI: exports.URI,
	    fromEither: exports.fromEither
	};
	/**
	 * @category lifting
	 * @since 2.11.0
	 */
	exports.fromEitherK = (0, FromEither_1.fromEitherK)(exports.FromEither);
	// -------------------------------------------------------------------------------------
	// unsafe
	// -------------------------------------------------------------------------------------
	/**
	 * @category unsafe
	 * @since 2.0.0
	 */
	exports.unsafeInsertAt = NEA.unsafeInsertAt;
	/**
	 * @category unsafe
	 * @since 2.0.0
	 */
	var unsafeUpdateAt = function (i, a, as) {
	    return (0, exports.isNonEmpty)(as) ? NEA.unsafeUpdateAt(i, a, as) : [];
	};
	exports.unsafeUpdateAt = unsafeUpdateAt;
	/**
	 * @category unsafe
	 * @since 2.0.0
	 */
	var unsafeDeleteAt = function (i, as) {
	    var xs = as.slice();
	    xs.splice(i, 1);
	    return xs;
	};
	exports.unsafeDeleteAt = unsafeDeleteAt;
	// -------------------------------------------------------------------------------------
	// utils
	// -------------------------------------------------------------------------------------
	/**
	 * `every` tells if the provided predicate holds true for every element in the `Array`.
	 *
	 * @example
	 * import { every } from 'fp-ts/Array'
	 *
	 * assert.equal(every((x: number) => x >= 0)([1, 2, 3]), true);
	 * assert.equal(every((x: number) => x >= 0)([-1, 2, 3]), false);
	 *
	 * @since 2.9.0
	 */
	exports.every = RA.every;
	/**
	 * `some` tells if the provided predicate holds true at least for one element in the `Array`.
	 *
	 * @example
	 * import { some } from 'fp-ts/Array'
	 *
	 * assert.equal(some((x: number) => x >= 0)([1, 2, 3]), true);
	 * assert.equal(some((x: number) => x >= 10)([1, 2, 3]), false);
	 *
	 * @since 2.9.0
	 */
	var some = function (predicate) {
	    return function (as) {
	        return as.some(predicate);
	    };
	};
	exports.some = some;
	/**
	 * Alias of [`some`](#some)
	 *
	 * @since 2.11.0
	 */
	exports.exists = exports.some;
	/**
	 * Places an element in between members of an `Array`, then folds the results using the provided `Monoid`.
	 *
	 * @example
	 * import * as S from 'fp-ts/string'
	 * import { intercalate } from 'fp-ts/Array'
	 *
	 * assert.deepStrictEqual(intercalate(S.Monoid)('-')(['a', 'b', 'c']), 'a-b-c')
	 *
	 * @since 2.12.0
	 */
	exports.intercalate = RA.intercalate;
	// -------------------------------------------------------------------------------------
	// do notation
	// -------------------------------------------------------------------------------------
	/**
	 * @category do notation
	 * @since 2.9.0
	 */
	exports.Do = (0, exports.of)(_.emptyRecord);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
	var let_ = /*#__PURE__*/ (0, Functor_1.let)(exports.Functor);
	exports.let = let_;
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.bind = (0, Chain_1.bind)(exports.Chain);
	/**
	 * @category do notation
	 * @since 2.8.0
	 */
	exports.apS = (0, Apply_1.apS)(exports.Apply);
	// -------------------------------------------------------------------------------------
	// legacy
	// -------------------------------------------------------------------------------------
	/**
	 * Alias of `flatMap`.
	 *
	 * @category legacy
	 * @since 2.0.0
	 */
	exports.chain = exports.flatMap;
	// -------------------------------------------------------------------------------------
	// deprecated
	// -------------------------------------------------------------------------------------
	/**
	 * Use `NonEmptyArray` module instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.range = NEA.range;
	/**
	 * Use a new `[]` instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.empty = [];
	/**
	 * Use `prepend` instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.cons = NEA.cons;
	/**
	 * Use `append` instead.
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.snoc = NEA.snoc;
	/**
	 * Use `prependAll` instead
	 *
	 * @category zone of death
	 * @since 2.9.0
	 * @deprecated
	 */
	exports.prependToAll = exports.prependAll;
	/**
	 * This instance is deprecated, use small, specific instances instead.
	 * For example if a function needs a `Functor` instance, pass `A.Functor` instead of `A.array`
	 * (where `A` is from `import A from 'fp-ts/Array'`)
	 *
	 * @category zone of death
	 * @since 2.0.0
	 * @deprecated
	 */
	exports.array = {
	    URI: exports.URI,
	    compact: exports.compact,
	    separate: exports.separate,
	    map: _map,
	    ap: _ap,
	    of: exports.of,
	    chain: exports.flatMap,
	    filter: _filter,
	    filterMap: _filterMap,
	    partition: _partition,
	    partitionMap: _partitionMap,
	    mapWithIndex: _mapWithIndex,
	    partitionMapWithIndex: _partitionMapWithIndex,
	    partitionWithIndex: _partitionWithIndex,
	    filterMapWithIndex: _filterMapWithIndex,
	    filterWithIndex: _filterWithIndex,
	    alt: _alt,
	    zero: exports.zero,
	    unfold: exports.unfold,
	    reduce: _reduce,
	    foldMap: _foldMap,
	    reduceRight: _reduceRight,
	    traverse: _traverse,
	    sequence: exports.sequence,
	    reduceWithIndex: _reduceWithIndex,
	    foldMapWithIndex: _foldMapWithIndex,
	    reduceRightWithIndex: _reduceRightWithIndex,
	    traverseWithIndex: _traverseWithIndex,
	    extend: _extend,
	    wither: _wither,
	    wilt: _wilt
	}; 
} (_Array));

function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }

  var number = Number(dirtyNumber);

  if (isNaN(number)) {
    return number;
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
  }
}

function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }
/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @param {Date|Number} argument - the value to convert
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */

function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument); // Clone the date

  if (argument instanceof Date || _typeof$1(argument) === 'object' && argStr === '[object Date]') {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else {
    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"); // eslint-disable-next-line no-console

      console.warn(new Error().stack);
    }

    return new Date(NaN);
  }
}

/**
 * @name addMilliseconds
 * @category Millisecond Helpers
 * @summary Add the specified number of milliseconds to the given date.
 *
 * @description
 * Add the specified number of milliseconds to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
 * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:30.750
 */

function addMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var timestamp = toDate(dirtyDate).getTime();
  var amount = toInteger(dirtyAmount);
  return new Date(timestamp + amount);
}

var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

var MILLISECONDS_IN_MINUTE = 60000;
/**
 * @name addMinutes
 * @category Minute Helpers
 * @summary Add the specified number of minutes to the given date.
 *
 * @description
 * Add the specified number of minutes to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of minutes to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the minutes added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 30 minutes to 10 July 2014 12:00:00:
 * const result = addMinutes(new Date(2014, 6, 10, 12, 0), 30)
 * //=> Thu Jul 10 2014 12:30:00
 */

function addMinutes(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, amount * MILLISECONDS_IN_MINUTE);
}

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param {*} value - the value to check
 * @returns {boolean} true if the given value is a date
 * @throws {TypeError} 1 arguments required
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */

function isDate(value) {
  requiredArgs(1, arguments);
  return value instanceof Date || _typeof(value) === 'object' && Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {*} date - the date to check
 * @returns {Boolean} the date is valid
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertable into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */

function isValid(dirtyDate) {
  requiredArgs(1, arguments);

  if (!isDate(dirtyDate) && typeof dirtyDate !== 'number') {
    return false;
  }

  var date = toDate(dirtyDate);
  return !isNaN(Number(date));
}

/**
 * @name subMilliseconds
 * @category Millisecond Helpers
 * @summary Subtract the specified number of milliseconds from the given date.
 *
 * @description
 * Subtract the specified number of milliseconds from the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds subtracted
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
 * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:29.250
 */

function subMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, -amount);
}

var MILLISECONDS_IN_DAY = 86400000;
function getUTCDayOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

function startOfUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getUTCISOWeekYear(dirtyDate);
  var fourthOfJanuary = new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCISOWeek(fourthOfJanuary);
  return date;
}

var MILLISECONDS_IN_WEEK$1 = 604800000;
function getUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
}

function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var firstWeekOfNextYear = new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, options);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getUTCWeekYear(dirtyDate, options);
  var firstWeek = new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCWeek(firstWeek, options);
  return date;
}

var MILLISECONDS_IN_WEEK = 604800000;
function getUTCWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? '-' : '';
  var output = Math.abs(number).toString();

  while (output.length < targetLength) {
    output = '0' + output;
  }

  return sign + output;
}

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */

var formatters$2 = {
  // Year
  y: function y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
    var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return addLeadingZeros(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return dayPeriodEnumValue.toUpperCase();

      case 'aaa':
        return dayPeriodEnumValue;

      case 'aaaaa':
        return dayPeriodEnumValue[0];

      case 'aaaa':
      default:
        return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
    }
  },
  // Hour [1-12]
  h: function h(date, token) {
    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return addLeadingZeros(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return addLeadingZeros(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return addLeadingZeros(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};
var formatters$3 = formatters$2;

var dayPeriodEnum = {
  am: 'am',
  pm: 'pm',
  midnight: 'midnight',
  noon: 'noon',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night'
};

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */
var formatters = {
  // Era
  G: function G(date, token, localize) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;

    switch (token) {
      // AD, BC
      case 'G':
      case 'GG':
      case 'GGG':
        return localize.era(era, {
          width: 'abbreviated'
        });
      // A, B

      case 'GGGGG':
        return localize.era(era, {
          width: 'narrow'
        });
      // Anno Domini, Before Christ

      case 'GGGG':
      default:
        return localize.era(era, {
          width: 'wide'
        });
    }
  },
  // Year
  y: function y(date, token, localize) {
    // Ordinal number
    if (token === 'yo') {
      var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, {
        unit: 'year'
      });
    }

    return formatters$3.y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize, options) {
    var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

    if (token === 'YY') {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    } // Ordinal number


    if (token === 'Yo') {
      return localize.ordinalNumber(weekYear, {
        unit: 'year'
      });
    } // Padding


    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = getUTCISOWeekYear(date); // Padding

    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'Q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'QQ':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'Qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'QQQ':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'QQQQQ':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'formatting'
        });
      // 1st quarter, 2nd quarter, ...

      case 'QQQQ':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone quarter
  q: function q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'qq':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'qqq':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'qqqqq':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'standalone'
        });
      // 1st quarter, 2nd quarter, ...

      case 'qqqq':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Month
  M: function M(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      case 'M':
      case 'MM':
        return formatters$3.M(date, token);
      // 1st, 2nd, ..., 12th

      case 'Mo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'MMM':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // J, F, ..., D

      case 'MMMMM':
        return localize.month(month, {
          width: 'narrow',
          context: 'formatting'
        });
      // January, February, ..., December

      case 'MMMM':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      // 1, 2, ..., 12
      case 'L':
        return String(month + 1);
      // 01, 02, ..., 12

      case 'LL':
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th

      case 'Lo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'LLL':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // J, F, ..., D

      case 'LLLLL':
        return localize.month(month, {
          width: 'narrow',
          context: 'standalone'
        });
      // January, February, ..., December

      case 'LLLL':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize, options) {
    var week = getUTCWeek(date, options);

    if (token === 'wo') {
      return localize.ordinalNumber(week, {
        unit: 'week'
      });
    }

    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize) {
    var isoWeek = getUTCISOWeek(date);

    if (token === 'Io') {
      return localize.ordinalNumber(isoWeek, {
        unit: 'week'
      });
    }

    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function d(date, token, localize) {
    if (token === 'do') {
      return localize.ordinalNumber(date.getUTCDate(), {
        unit: 'date'
      });
    }

    return formatters$3.d(date, token);
  },
  // Day of year
  D: function D(date, token, localize) {
    var dayOfYear = getUTCDayOfYear(date);

    if (token === 'Do') {
      return localize.ordinalNumber(dayOfYear, {
        unit: 'dayOfYear'
      });
    }

    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize) {
    var dayOfWeek = date.getUTCDay();

    switch (token) {
      // Tue
      case 'E':
      case 'EE':
      case 'EEE':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'EEEEE':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'EEEEEE':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'EEEE':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Local day of week
  e: function e(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case 'e':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'ee':
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th

      case 'eo':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'eee':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'eeeee':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'eeeeee':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'eeee':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone local day of week
  c: function c(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (same as in `e`)
      case 'c':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'cc':
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th

      case 'co':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'ccc':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // T

      case 'ccccc':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'standalone'
        });
      // Tu

      case 'cccccc':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'standalone'
        });
      // Tuesday

      case 'cccc':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // ISO day of week
  i: function i(date, token, localize) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    switch (token) {
      // 2
      case 'i':
        return String(isoDayOfWeek);
      // 02

      case 'ii':
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd

      case 'io':
        return localize.ordinalNumber(isoDayOfWeek, {
          unit: 'day'
        });
      // Tue

      case 'iii':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'iiiii':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'iiiiii':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'iiii':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM or PM
  a: function a(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'aaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'aaaaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'aaaa':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM, PM, midnight, noon
  b: function b(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
    }

    switch (token) {
      case 'b':
      case 'bb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'bbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'bbbbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'bbbb':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function B(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }

    switch (token) {
      case 'B':
      case 'BB':
      case 'BBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'BBBBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'BBBB':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Hour [1-12]
  h: function h(date, token, localize) {
    if (token === 'ho') {
      var hours = date.getUTCHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return formatters$3.h(date, token);
  },
  // Hour [0-23]
  H: function H(date, token, localize) {
    if (token === 'Ho') {
      return localize.ordinalNumber(date.getUTCHours(), {
        unit: 'hour'
      });
    }

    return formatters$3.H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize) {
    var hours = date.getUTCHours() % 12;

    if (token === 'Ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize) {
    var hours = date.getUTCHours();
    if (hours === 0) hours = 24;

    if (token === 'ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function m(date, token, localize) {
    if (token === 'mo') {
      return localize.ordinalNumber(date.getUTCMinutes(), {
        unit: 'minute'
      });
    }

    return formatters$3.m(date, token);
  },
  // Second
  s: function s(date, token, localize) {
    if (token === 'so') {
      return localize.ordinalNumber(date.getUTCSeconds(), {
        unit: 'second'
      });
    }

    return formatters$3.s(date, token);
  },
  // Fraction of second
  S: function S(date, token) {
    return formatters$3.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    if (timezoneOffset === 0) {
      return 'Z';
    }

    switch (token) {
      // Hours and optional minutes
      case 'X':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`

      case 'XXXX':
      case 'XX':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`

      case 'XXXXX':
      case 'XXX': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Hours and optional minutes
      case 'x':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`

      case 'xxxx':
      case 'xx':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`

      case 'xxxxx':
      case 'xxx': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (GMT)
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'O':
      case 'OO':
      case 'OOO':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'OOOO':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (specific non-location)
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'z':
      case 'zz':
      case 'zzz':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'zzzz':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Seconds timestamp
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1000);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};

function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;

  if (minutes === 0) {
    return sign + String(hours);
  }

  var delimiter = dirtyDelimiter || '';
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? '-' : '+';
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }

  return formatTimezone(offset, dirtyDelimiter);
}

function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || '';
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

var formatters$1 = formatters;

var dateLongFormatter = function dateLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'P':
      return formatLong.date({
        width: 'short'
      });

    case 'PP':
      return formatLong.date({
        width: 'medium'
      });

    case 'PPP':
      return formatLong.date({
        width: 'long'
      });

    case 'PPPP':
    default:
      return formatLong.date({
        width: 'full'
      });
  }
};

var timeLongFormatter = function timeLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'p':
      return formatLong.time({
        width: 'short'
      });

    case 'pp':
      return formatLong.time({
        width: 'medium'
      });

    case 'ppp':
      return formatLong.time({
        width: 'long'
      });

    case 'pppp':
    default:
      return formatLong.time({
        width: 'full'
      });
  }
};

var dateTimeLongFormatter = function dateTimeLongFormatter(pattern, formatLong) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];

  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }

  var dateTimeFormat;

  switch (datePattern) {
    case 'P':
      dateTimeFormat = formatLong.dateTime({
        width: 'short'
      });
      break;

    case 'PP':
      dateTimeFormat = formatLong.dateTime({
        width: 'medium'
      });
      break;

    case 'PPP':
      dateTimeFormat = formatLong.dateTime({
        width: 'long'
      });
      break;

    case 'PPPP':
    default:
      dateTimeFormat = formatLong.dateTime({
        width: 'full'
      });
      break;
  }

  return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
};

var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
var longFormatters$1 = longFormatters;

var protectedDayOfYearTokens = ['D', 'DD'];
var protectedWeekYearTokens = ['YY', 'YYYY'];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format, input) {
  if (token === 'YYYY') {
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'YY') {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'D') {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'DD') {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}

var formatDistanceLocale = {
  lessThanXSeconds: {
    one: 'less than a second',
    other: 'less than {{count}} seconds'
  },
  xSeconds: {
    one: '1 second',
    other: '{{count}} seconds'
  },
  halfAMinute: 'half a minute',
  lessThanXMinutes: {
    one: 'less than a minute',
    other: 'less than {{count}} minutes'
  },
  xMinutes: {
    one: '1 minute',
    other: '{{count}} minutes'
  },
  aboutXHours: {
    one: 'about 1 hour',
    other: 'about {{count}} hours'
  },
  xHours: {
    one: '1 hour',
    other: '{{count}} hours'
  },
  xDays: {
    one: '1 day',
    other: '{{count}} days'
  },
  aboutXWeeks: {
    one: 'about 1 week',
    other: 'about {{count}} weeks'
  },
  xWeeks: {
    one: '1 week',
    other: '{{count}} weeks'
  },
  aboutXMonths: {
    one: 'about 1 month',
    other: 'about {{count}} months'
  },
  xMonths: {
    one: '1 month',
    other: '{{count}} months'
  },
  aboutXYears: {
    one: 'about 1 year',
    other: 'about {{count}} years'
  },
  xYears: {
    one: '1 year',
    other: '{{count}} years'
  },
  overXYears: {
    one: 'over 1 year',
    other: 'over {{count}} years'
  },
  almostXYears: {
    one: 'almost 1 year',
    other: 'almost {{count}} years'
  }
};

var formatDistance = function formatDistance(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];

  if (typeof tokenValue === 'string') {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace('{{count}}', count.toString());
  }

  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return 'in ' + result;
    } else {
      return result + ' ago';
    }
  }

  return result;
};

var formatDistance$1 = formatDistance;

function buildFormatLongFn(args) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // TODO: Remove String()
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

var dateFormats = {
  full: 'EEEE, MMMM do, y',
  long: 'MMMM do, y',
  medium: 'MMM d, y',
  short: 'MM/dd/yyyy'
};
var timeFormats = {
  full: 'h:mm:ss a zzzz',
  long: 'h:mm:ss a z',
  medium: 'h:mm:ss a',
  short: 'h:mm a'
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: '{{date}}, {{time}}',
  short: '{{date}}, {{time}}'
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: 'full'
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: 'full'
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: 'full'
  })
};
var formatLong$1 = formatLong;

var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'P'
};

var formatRelative = function formatRelative(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};

var formatRelative$1 = formatRelative;

function buildLocalizeFn(args) {
  return function (dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : 'standalone';
    var valuesArray;

    if (context === 'formatting' && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;

      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;

      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }

    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex; // @ts-ignore: For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!

    return valuesArray[index];
  };
}

var eraValues = {
  narrow: ['B', 'A'],
  abbreviated: ['BC', 'AD'],
  wide: ['Before Christ', 'Anno Domini']
};
var quarterValues = {
  narrow: ['1', '2', '3', '4'],
  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
  wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
}; // Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.

var monthValues = {
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
var dayValues = {
  narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};
var dayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  }
};

var ordinalNumber = function ordinalNumber(dirtyNumber, _options) {
  var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  var rem100 = number % 100;

  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + 'st';

      case 2:
        return number + 'nd';

      case 3:
        return number + 'rd';
    }
  }

  return number + 'th';
};

var localize = {
  ordinalNumber: ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: 'wide'
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: 'wide',
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: 'wide'
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: 'wide'
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: 'wide',
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: 'wide'
  })
};
var localize$1 = localize;

function buildMatchFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);

    if (!matchResult) {
      return null;
    }

    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }

  return undefined;
}

function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }

  return undefined;
}

function buildMatchPatternFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseEraPatterns,
    defaultParseWidth: 'any'
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: 'any',
    valueCallback: function valueCallback(index) {
      return index + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: 'any'
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseDayPatterns,
    defaultParseWidth: 'any'
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: 'any',
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: 'any'
  })
};
var match$1 = match;

/**
 * @type {Locale}
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
 */
var locale = {
  code: 'en-US',
  formatDistance: formatDistance$1,
  formatLong: formatLong$1,
  formatRelative: formatRelative$1,
  localize: localize$1,
  match: match$1,
  options: {
    weekStartsOn: 0
    /* Sunday */
    ,
    firstWeekContainsDate: 1
  }
};
var defaultLocale = locale;

// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps

var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
/**
 * @name format
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param {Date|Number} date - the original date
 * @param {String} format - the string of tokens
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {String} the formatted date string
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `date` must not be Invalid Date
 * @throws {RangeError} `options.locale` must contain `localize` property
 * @throws {RangeError} `options.locale` must contain `formatLong` property
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */

function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;

  requiredArgs(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions = getDefaultOptions();
  var locale = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions.locale) !== null && _ref !== void 0 ? _ref : defaultLocale;
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  if (!locale.localize) {
    throw new RangeError('locale must contain localize property');
  }

  if (!locale.formatLong) {
    throw new RangeError('locale must contain formatLong property');
  }

  var originalDate = toDate(dirtyDate);

  if (!isValid(originalDate)) {
    throw new RangeError('Invalid time value');
  } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate: firstWeekContainsDate,
    weekStartsOn: weekStartsOn,
    locale: locale,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
    var firstCharacter = substring[0];

    if (firstCharacter === 'p' || firstCharacter === 'P') {
      var longFormatter = longFormatters$1[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }

    return substring;
  }).join('').match(formattingTokensRegExp).map(function (substring) {
    // Replace two single quote characters with one single quote character
    if (substring === "''") {
      return "'";
    }

    var firstCharacter = substring[0];

    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }

    var formatter = formatters$1[firstCharacter];

    if (formatter) {
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }

      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }

      return formatter(utcDate, substring, locale.localize, formatterOptions);
    }

    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
    }

    return substring;
  }).join('');
  return result;
}

function cleanEscapedString(input) {
  var matched = input.match(escapedStringRegExp);

  if (!matched) {
    return input;
  }

  return matched[1].replace(doubleQuoteRegExp, "'");
}

/**
 * @name subMinutes
 * @category Minute Helpers
 * @summary Subtract the specified number of minutes from the given date.
 *
 * @description
 * Subtract the specified number of minutes from the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of minutes to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the minutes subtracted
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Subtract 30 minutes from 10 July 2014 12:00:00:
 * const result = subMinutes(new Date(2014, 6, 10, 12, 0), 30)
 * //=> Thu Jul 10 2014 11:30:00
 */

function subMinutes(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMinutes(dirtyDate, -amount);
}

const ISO8601 = string$1;
const datetoIso8601 = (date) => _function.pipe(date, date => format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"));

const mkEnvironment = (start) => (end) => ({ validityStart: datetoIso8601(start), validityEnd: datetoIso8601(end) });
type({ validityStart: ISO8601,
    validityEnd: ISO8601
});

const mkRuntime = (runtimeRestAPI) => (walletAPI) => ({ wallet: { ...walletAPI,
        getLovelaces: getLovelaces(walletAPI) },
    restAPI: runtimeRestAPI,
    initialise: (payload) => initialise(runtimeRestAPI)(walletAPI)(payload),
    withdraw: (payload) => withdraw(runtimeRestAPI)(walletAPI)(payload),
    applyInputs: (contractId) => (provideInput) => _function.pipe(runtimeRestAPI.contracts.contract.get(contractId), TaskEither.chain(header => TaskEither.fromTask(getParties()(header.roleTokenMintingPolicyId))), TaskEither.chain(parties => runtimeRestAPI.contracts.contract.next(contractId)(mkEnvironment(_function.pipe(Date.now(), (date) => subMinutes(date, 15)))(_function.pipe(Date.now(), (date) => addMinutes(date, 15))))(parties)), TaskEither.chain(next => applyInputs(runtimeRestAPI)(walletAPI)(contractId)(provideInput(next))))
});
const getLovelaces = (walletAPI) => _function.pipe(walletAPI.getTokenValues, TaskEither.map(tokenvalues => _function.pipe(tokenvalues, _Array.filter((tokenValue) => tokenValue.token.currency_symbol == ''), _Array.map(tokenValue => tokenValue.amount), _Array.head, Option.getOrElse(() => 0n))));
const getParties = (walletAPI) => (roleMintingPolicyId) => Task.of([]);

export { commonjsGlobal as c, getDefaultExportFromCjs as g, mkRuntime as m };
