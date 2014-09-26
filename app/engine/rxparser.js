define([
    'vendor/rxjs/dist/rx'
], function(Rx) {
    var RxParser = {};
    RxParser.Parser = (function() {
        "use strict";

        // The Parser object is a wrapper for a parser function.
        // Externally, you use one to parse a string by calling
        //   var result = SomeParser.parse('Me Me Me! Parse Me!');
        // You should never call the constructor, rather you should
        // construct your Parser from the base parsers and the
        // parser combinator methods.
        function Parser(action) {
            if (!(this instanceof Parser)) return new Parser(action);
            this._ = action;
        };

        var _ = Parser.prototype;
        _.observer = null;

        function furthestBacktrackFor(result, last) {
            if (!last) return result;
            if (result.furthest >= last.furthest) return result;

            return {
                status: result.status,
                index: result.index,
                value: result.value,
                furthest: last.furthest,
                expected: last.expected
            }
        }

        _.desc = function(expected) {
            return this.or(fail(expected))
        };

        _.or = function(alternative) {
            return alt(this, alternative);
        };

        _.map = function(fn) {
            var self = this;
            return Parser(function(stream, i) {
                var result = self._(stream, i);
                if (!result.status) return result;
                return furthestBacktrackFor(makeSuccess(result.index, fn(result.value)), result);
            });
        };

        _.skip = function(next) {
            return seq(this, next).map(function(results) {
                return results[0];
            });
        };

        var alt = RxParser.alt = function() {
            var parsers = [].slice.call(arguments);
            var numParsers = parsers.length;
            if (numParsers === 0) return fail('zero alternates')

            return Parser(function(stream, i) {
                var result;
                for (var j = 0; j < parsers.length; j += 1) {
                    result = furthestBacktrackFor(parsers[j]._(stream, i), result);
                    if (result.status) return result;
                }
                return result;
            });
        };

        function makeSuccess(index, value) {
            _.observer.onCompleted({
                status: true,
                index: index,
                value: value,
                furthest: -1,
                expected: ''
            });
        }

        function makeFailure(index, value) {
            _.observer.onError({
                status: false,
                index: -1,
                value: null,
                furthest: index,
                expected: expected
            });
        }

        var regex = RxParser.regex = function(re, group) {
            var anchored = RegExp('^(?:' + re.source + ')', ('' + re).slice(('' + re).lastIndexOf('/') + 1));
            if (group == null) group = 0;

            return Parser(function(stream, i) {
                var match = anchored.exec(stream.slice(i));

                if (match) {
                    var fullMatch = match[0];
                    var groupMatch = match[group];
                    if (groupMatch != null) return makeSuccess(i + fullMatch.length, groupMatch);
                }

                return makeFailure(i, re);
            });
        };

        _.parse = function(stream, onSymbolCallback, onErrorCallback, onCompleteCallback) {

            var self = this;

            _.observeableSequence = Rx.Observable.create(function(observer) {
                // Yield a single value and complete
                _.observer = observer;
                self.skip(eof)._(stream, 0);
                // Any cleanup logic might go here
                return function() {
                    console.log('disposed');
                }
            });

            return _.observeableSequence.subscribe(onSymbolCallback, onErrorCallback, onCompleteCallback);
        }

        var succeed = RxParser.succeed = function(value) {
            return Parser(function(stream, i) {
                return makeSuccess(i, value);
            });
        };

        var fail = RxParser.fail = function(expected) {
            return Parser(function(stream, i) {
                return makeFailure(i, expected);
            });
        };

        var eof = RxParser.eof = Parser(function(stream, i) {
            if (i < stream.length) return makeFailure(i, 'EOF');

            return makeSuccess(i, null);
        });

        var seq = RxParser.seq = function() {
            var parsers = [].slice.call(arguments);
            var numParsers = parsers.length;

            return Parser(function(stream, i) {
                var result;
                var accum = new Array(numParsers);

                for (var j = 0; j < numParsers; j += 1) {
                    result = furthestBacktrackFor(parsers[j]._(stream, i), result);
                    if (!result.status) return result;
                    accum[j] = result.value
                    i = result.index;
                }

                return furthestBacktrackFor(makeSuccess(i, accum), result);
            });
        };

        var letter = RxParser.letter = regex(/[a-z]/i).desc('a letter')

    })();



    return RxParser;
});