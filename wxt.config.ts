import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage', 'identity'],
    web_accessible_resources: [
      {
        resources: ['auth-callback.html'],
        matches: ['<all_urls>'],
      },
    ],
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiecuwT9vm2pB1hrmXYWnf7YIUR0iIWRSXgkp3RVJgTFYlROOMh/YuMvseBPic/WRBxSBP/vI6vOxSG9mTkwrcPC0t7SvX6s83b70YpK2WYSWQ+kR5cNo5nhd8pdM89d1lGGEiPAG1L9ZZmCSVGie6S3UxhQI8/C7x0oJXcwpQ4twh910i5zFuGr6eLZlP9SgpEqgL2iUxHsuR20T7ZMFyaFtjsYskkr32+bragoqet7jCy9JyE1TRLPQklNB2v5ZeRcow2Ku4B4sYhAkEb+IK3jl1DSa97EzNOHJMM8buCBSQ6sTxPv7Th/2LP6Ad2vcW2Lk+p8LtB2MrE4WMUj4KQIDAQAB',
  },
});
