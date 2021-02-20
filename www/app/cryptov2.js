let nanoid=(t=21)=>{let e="",r=crypto.getRandomValues(new Uint8Array(t));for(;t--;){let n=61&r[t];e+=n<36?n.toString(36):(n-26).toString(36).toUpperCase()}return e};

function libcrypto (password) {

  if (!window.crypto.subtle) {
    window.alert("The crypto functionalities are not supported in this browser.");
    throw new Error("The crypto functionalities are not supported in this browser.");
  }


  let _password = password;
  let _salt = nanoid(32);
  let _keymaterial;
  let _cryptkey, _signkey, _wrapkey;

  const _keysExtractable = false;

  const _cryptalg = { name: "AES-GCM", length: 256};
  const _cryptusage = [ "encrypt", "decrypt" ];
  const _signalg = { name: "HMAC", hash: "SHA-256"};
  const _signusage = [ "sign", "verify" ];
  const _wrapalg = { name: "AES-GCM", length: 256};
  const _wrapusage = [ "wrapKey", "unwrapKey" ];

  const _type = {
    crypt: 0, sign: 1, wrap: 2
  }

  const _getAlg = (type) => {
    switch(type) {
      case _type.crypt: return _cryptalg;
      case _type.sign: return _signalg;
      case _type.wrap: return _wrapalg;
    }
  }

  const _getUsage = (type) => {
    switch(type) {
      case _type.crypt: return _cryptusage;
      case _type.sign: return _signusage;
      case _type.wrap: return _wrapusage;
    }
  }

  const _enc = new TextEncoder();
  const _dec = new TextDecoder();


  let _ready = false;

  const _waitReady = (resolveArray = []) => {
    if (_ready) {
      while(resolveArray.length) resolveArray.pop()();
      return;
    }
    return new Promise((res) => {
      resolveArray.push(res);
      setTimeout(_waitReady, 200, resolveArray);
    });
  }


  const _makeKeyMaterial = async () => {
    await window.crypto.subtle.importKey(
      "raw",
      _enc.encode(_password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    ).then((keymaterial) => {
      _keymaterial = keymaterial;
    });
  }

  const _deriveKey = async (type, overwriteSalt, save = true) => {
    let alg = _getAlg(type);
    let usage = _getUsage(type);
    let salt = _enc.encode(overwriteSalt || _salt);
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 121324,
        hash: "SHA-256"
      },
      _keymaterial,
      alg,
      _keysExtractable,
      usage
    ).then((key) => {
      if(save) {
        if(type === _type.crypt) _cryptkey = key;
        if(type === _type.sign) _signkey = key;
        if(type === _type.wrap) _wrapkey = key;
      }
      return key;
    });
  }

  const _deriveNewKeys = async () => {
    await _deriveKey(_type.crypt);
    await _deriveKey(_type.sign);
    await _deriveKey(_type.wrap);
  }

  const _setPassword = async (password) => {
    await _waitReady();
    _ready = false;
    _password = password;
    await _makeKeyMaterial();
    await _deriveNewKeys();
    _ready = true;
  }

  const _setSalt = async (salt) => {
    await _waitReady();
    _ready = false;
    _salt = salt;
    await _deriveNewKeys();
    _ready = true;
  }

  const _completeInit = async () => {
    await _makeKeyMaterial();
    await _deriveNewKeys();
    _ready = true;
  }

  const _encryptData = async (data) => {
    await _waitReady();
    let iv = nanoid(32);
    return window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: _enc.encode(iv)
      },
      _cryptkey,
      data
    ).then((data) => {
      return {data: data, salt: _salt, iv: iv};
    }).catch((e) => {
      console.log(e);
    });
  }
  const _encryptText = (text) => {
    return _encryptData(_enc.encode(text));
  }

  const _decryptData = async (dataobj) => {
    await _waitReady();
    let key = await _deriveKey(_type.crypt,dataobj.salt,false);
    let data = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: _enc.encode(dataobj.iv)
      },
      key,
      dataobj.data
    ).then((data) => {
      return data;
    }).catch(function(err) {
      console.error(err);
    });
    return data;
  }
  const _decryptText = (dataobj) => {
    return _decryptData(dataobj).then((data) => { return _dec.decode(data); });
  }

  const _signData = async (data) => {
    await _waitReady();
    return window.crypto.subtle.sign(
      "HMAC",
      _signkey,
      data
    ).then((signature) => {
      return {data: data, signature: signature, salt: _salt};
    });
  }
  const _signText = (text) => {
    return _signData(_enc.encode(text));
  }

  const _verifyData = async (dataobj) => {
    await _waitReady();
    let key = await _deriveKey(_type.sign,dataobj.salt);
    return window.crypto.subtle.verify(
     "HMAC",
     key,
     dataobj.signature,
     dataobj.data
   );
  }

  const _getHashOfData = (data) => {
    return crypto.subtle.digest('SHA-256', data).then((hashBuffer) => {
      let hashArray = Array.from(new Uint8Array(hashBuffer));
      let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    });
  }
  const _getHashOfText = (text) => {
    return _getHashOfData(_enc.encode(text));
  }

  if (!password || password.length < 8) {   //without specifying a password only standard hash functions are available
    return {
      info: "Only standardized hash functions are available because of weak or missing password",
      getHashOfData(data) {
        return _getHashOfData(data);
      },
      getHashOfText(text) {
        return _getHashOfText(text);
      }
    }
  }


  _completeInit();


  return {
    setPassword(password) {
      _setPassword(password);
    },
    setSalt(salt) {
      _setSalt(salt);
    },

    encryptData(data) {
      return _encryptData(data);
    },
    encryptText(text) {
      return _encryptText(text);
    },
    decryptData(dataobj) {
      return _decryptData(dataobj);
    },
    decryptText(dataobj) {
      return _decryptText(dataobj);
    },

    signData(data) {
      return _signData(data);
    },
    signText(text) {
      return _signText(text);
    },
    verifyData(dataobj) {
      return _verifyData(dataobj);
    },

    getHashOfData(data) {
      return _getHashOfData(data);
    },
    getHashOfText(text) {
      return _getHashOfText(text);
    }
  };
}

document.Crypto = libcrypto();
