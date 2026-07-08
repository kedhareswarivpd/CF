from jose import jwt

jwk = {
    'alg': 'ES256', 'crv': 'P-256', 'kty': 'EC',
    'x': '4sstJoTvC-TnemRCvadCdZ0tiizlI8Eu_PwtJVvizYI',
    'y': 'JljSJHdMe8NOUse-dp4N-PaN0pZf5VsYVtz_UfeFNFw',
    'kid': 'c627b9fe-c81c-48b2-b20e-cbc6593e0717',
}

try:
    jwt.decode('a.b.c', jwk, algorithms=['ES256'], audience='authenticated')
    print("UNEXPECTED: no error")
except Exception as e:
    msg = str(e)
    print("Error:", msg)
    if any(w in msg.lower() for w in ['key', 'algorithm', 'ec', 'crv', 'curve', 'not supported']):
        print("VERDICT: jose CANNOT handle EC JWK dict as key")
    else:
        print("VERDICT: jose CAN handle EC JWK dict (error is about token, not key)")
