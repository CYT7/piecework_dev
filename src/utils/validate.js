//邮箱
export function isEmail (s) {
  return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}
//手机号码
export function isMobile (s) {
  return /^1[0-9]{10}$/.test(s)
}
