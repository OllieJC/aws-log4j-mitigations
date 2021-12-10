const expect         = require("chai").expect;
const viewer_request = require("./function.js");

fixture_valid = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'GET',
    uri: '/index.php',
    querystring: {},
    headers: {
      host: {
        value:'valid.example'
      }
    },
    cookies: {}
  }
}

fixture_invalid_1 = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'GET',
    uri: '/index.php',
    querystring: {},
    headers: {
      host: {
        value:'invalid.${jndi:ldap....}.example'
      }
    },
    cookies: {}
  }
}

fixture_invalid_2 = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'GET',
    uri: '/index.php',
    querystring: {},
    headers: {
      '${jndi:ldap....}': {
        value:'invalid.example'
      }
    },
    cookies: {}
  }
}

fixture_invalid_3 = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'GET',
    uri: '/index.php',
    querystring: {},
    headers: {
      '${JNDI:ldap....}': {
        value:'invalid.example'
      }
    },
    cookies: {}
  }
}

fixture_invalid_4 = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'POST',
    uri: '/index.php',
    querystring: {},
    headers: {
      host: {
        value:'invalid.example'
      }
    },
    body: {
      data: "param=${jndi:ldap....}",
      encoding: "text"
    },
    cookies: {}
  }
}

fixture_invalid_5 = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'POST',
    uri: '/index.php',
    querystring: {},
    headers: {
      host: {
        value:'invalid.example'
      }
    },
    body: {
      data: "cGFyYW09JHtqbmRpOmxkYXAuLi4ufQ==",
      encoding: "base64"
    },
    cookies: {}
  }
}

fixture_lambdaatedge_valid = {
  "Records": [
    {
      "cf": {
        "config": {
          "distributionId": "EXAMPLE"
        },
        "request": {
          "headers": {
            "host": [
              {
                "key": "Host",
                "value": "d123.cf.net"
              }
            ],
            "user-name": [
              {
                "key": "User-Name",
                "value": "CloudFront"
              }
            ]
          },
          "clientIp": "2001:cdba::3257:9652",
          "uri": "/test",
          "method": "GET"
        }
      }
    }
  ]
}

fixture_lambdaatedge_invalid = {
  "Records": [
    {
      "cf": {
        "config": {
          "distributionId": "EXAMPLE"
        },
        "request": {
          "headers": {
            "host": [
              {
                "key": "Host",
                "value": "d123.cf.net"
              }
            ],
            "user-name": [
              {
                "key": "User-Name",
                "value": "CloudFront"
              }
            ]
          },
          "clientIp": "2001:cdba::3257:9652",
          "uri": "/test",
          "method": "GET"
        }
      }
    }
  ]
}

fixture_bad_body = {
  context: {
    distributionDomainName:'d123.cloudfront.net',
    eventType:'viewer-request',
  },
  viewer: {
    ip:'1.2.3.4'
  },
  request: {
    method: 'POST',
    uri: '/index.php',
    querystring: {},
    headers: {
      host: {
        value:'invalid.example'
      }
    },
    body: {
      data: "SHOULD BE BASE64, GRACEFUL FAIL EXPECTED!",
      encoding: "base64"
    },
    cookies: {}
  }
}

describe("origin_request", function() {
  it('fixture_valid', function(done) {
    var res = viewer_request.handler(fixture_valid);

    expect(res).to.equal(fixture_valid.request);
    done();
  });

  it('fixture_invalid_1', function(done) {
    var res = viewer_request.handler(fixture_invalid_1);

    expect(res).to.not.equal(fixture_invalid_1.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_invalid_2', function(done) {
    var res = viewer_request.handler(fixture_invalid_2);

    expect(res).to.not.equal(fixture_invalid_2.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_invalid_3', function(done) {
    var res = viewer_request.handler(fixture_invalid_3);

    expect(res).to.not.equal(fixture_invalid_3.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_invalid_4', function(done) {
    var res = viewer_request.handler(fixture_invalid_4);

    expect(res).to.not.equal(fixture_invalid_4.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_invalid_5', function(done) {
    var res = viewer_request.handler(fixture_invalid_5);

    expect(res).to.not.equal(fixture_invalid_5.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_lambdaatedge_valid', function(done) {
    var res = viewer_request.handler(fixture_lambdaatedge_valid);

    expect(res).to.not.equal(fixture_lambdaatedge_valid.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_lambdaatedge_valid', function(done) {
    var res = viewer_request.handler(fixture_lambdaatedge_valid);

    expect(res).to.not.equal(fixture_lambdaatedge_valid.request);
    expect(res.statusCode).to.equal(403);

    done();
  });

  it('fixture_bad_body', function(done) {
    var res = viewer_request.handler(fixture_bad_body);

    expect(res).to.equal(fixture_bad_body.request);

    done();
  });
});
