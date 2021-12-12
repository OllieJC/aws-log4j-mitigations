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

    if (testEventForJndi(event)) {
      return {
        statusCode: 403,
        statusDescription: "Forbidden"
      }
    };

    return request;
}

function testEventForJndi(event) {
  var request = null;
  if (typeof(event.Records) !== "undefined") {
    request = event.Records[0].cf.request;
  } else {
    request = event.request;
  }

  var request_string = JSON.stringify(request);

  if (jndiMatch(request_string)) {
    return true;
  }

  // CloudFront Functions cannot access the body, only Lambda@Edge.
  // For Lambda@Edge you must choose IncludeBody=true (false by default)
  if (typeof(request.body) !== "undefined") {
    if (request.body.encoding == "base64") {
      try {
        if (jndiMatch(request.body.data, true)) {
          return true;
        }
      } catch (e) {
        console.log(`Failed to match the body for the request: ${e}`)
      }
    }
  }
  return false;
}

function jndiMatch(value, isBase64) {
  if (typeof(value) !== "string") {
    return false;
  }

  if (typeof(isBase64) === "undefined") {
    isBase64 = false;
  }

  var res = false;

  var jndiRegex = /(?:\$|\%24)(?:\{|\%7b)[^\w]*?j[^\w]*?n[^\w]*?d[^\w]*?i[^\w]*?(?:\:|\%3a)/im;

  if (value.match(jndiRegex)) {
    res = true;
  } else {
    if (isBase64) {
      value = decodeBase64(value);
    }
    if (value.match(jndiRegex)) {
      res = true;
    } else {
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
