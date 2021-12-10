'use strict';

if (typeof(exports) !== "undefined") {
  exports.handler = (event, context, callback) => {
    callback(null, handler(event));
  }
}

function handler(event) {
    var request = null;
    if (typeof(event.Records) !== "undefined") {
      request = event.Records[0].cf.request;
    } else {
      request = event.request;
    }
    var headerKeys = Object.keys(request.headers);
    var uri = request.uri;

    var failureResponse = {
      statusCode: 403,
      statusDescription: "Forbidden"
    };

    // CloudFront Functions and Lambda@Edge:
    if (jdniMatch(uri)) {
      return failureResponse;
    }

    if (typeof(request.querystring) === "string") {
      if (jdniMatch(request.querystring)) {
        return failureResponse;
      }
    } else if (typeof(request.querystring) === "object") {
      var querystrings = Object.keys(request.querystring);
      for (var j = 0; j < querystrings.length; j++) {
        var qs = request.querystring[querystrings[j]];
        if (typeof(qs.value) !== "undefined") {
          if (jdniMatch(qs.value)) {
            return failureResponse;
          }
        }
        if (typeof(qs.multiValue) !== "undefined") {
          for (var k = 0; k < qs.multiValue.length; k++) {
            if (jdniMatch(qs.multiValue[k].value)) {
              return failureResponse;
            }
          }
        }
      }
    }

    for (var i = 0; i < headerKeys.length; i++) {
      var key = headerKeys[i];

      var value;
      if (typeof(request.headers[key].value) !== "undefined") {
        value = request.headers[key].value;
      } else if (typeof(request.headers[key][0].value) !== "undefined") {
        value = request.headers[key][0].value;
      }

      if (jdniMatch(key) || jdniMatch(value)) {
        return failureResponse;
      }
    }

    // CloudFront Functions cannot access the body, only Lambda@Edge
    // for Lambda@Edge you must choose IncludeBody=true (false by default)
    if (typeof(request.body) !== "undefined") {
      try {
        if (jdniMatch(request.body.data, (request.body.encoding == "base64"))) {
          return failureResponse;
        }
      } catch (e) {
        console.log(`Failed to match the body for the request: ${e}`)
      }
    }

    return request;
}

function jdniMatch(value, isBase64) {
  if (typeof(value) !== "string") {
    return false;
  }

  if (typeof(isBase64) === "undefined") {
    isBase64 = false;
  }

  var res = false;

  var jndiRegex = /(?:\$|\%24)\s*(?:\{|\%7b)\s*jndi\s*(?:\:|\%3a)/im;

  if (value.match(jndiRegex)) {
    res = true;
  } else {
    if (isBase64) {
      value = decodeBase64(value);
    }
    if (value.match(jndiRegex)) {
      res = true;
    }

    var jndiPossibleBase64 = /([A-Za-z0-9][A-Za-z0-9+/]*(?:am5kaQ|puZGkg|qbmRp|Sk5ESQ|pOREk|KTkRJ)[A-Za-z0-9+/]*(?:\={1,3})?)/;
    var b64Matches = value.match(jndiPossibleBase64);

    if (b64Matches) {
      for (var i = 0; i < b64Matches.length; i++) {
        var test_value = decodeBase64(b64Matches[i]);
        if (test_value.match(jndiRegex)) {
          res = true;
          break;
        }
      }
    }
  }

  return res;
}

function decodeBase64(value) {
  var res = "";

  if (typeof(value) !== "string") {
    return res;
  }

  try {
    res = String.bytesFrom(value, 'base64').toString();
  } catch (e) {
    console.log(`decodeBase64 - failed to run String.bytesFrom: ${e}`)
  }
  try {
    res = Buffer.from(value, 'base64').toString();
  } catch (e) {
    console.log(`decodeBase64 - failed to run Buffer.from: ${e}`)
  }

  return res;
}
