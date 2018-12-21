function removeToken(reqData) {
  for (let key in reqData) {
    if (key.startsWith('_')) {
      delete reqData[key];
    }
  }
}

module.exports = removeToken;
