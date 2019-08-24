const BUILD_JSON = require('./build.json');

module.exports = {
  exportPathMap: async function() {
    return BUILD_JSON.reduce((acc, query) => {
      acc[query.slug] = {
        page: '/post',
        query
      };
      return acc;
    }, {});
  }
}
